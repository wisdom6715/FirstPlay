import { db, isFirebaseLive } from '../../../../services/firebaseConfig.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  limit 
} from 'firebase/firestore';
import { handleOptions, jsonResponse } from '../../../../utils/apiCors.js';

export const OPTIONS = handleOptions;

/**
 * Helper to update or create a tournament participant score document
 */
async function recordParticipantScore({ userId, tournamentId, score, username, keepOnlyHighest = false }) {
  const numericScore = Number(score);
  const cleanUserId = userId.toString().trim();
  const cleanTournamentId = (tournamentId || '').toString().trim();
  const cleanUsername = (username || '').toString().trim();

  // If tournament_id is provided, use the canonical document ID: `${tournament_id}_${userId}`
  let targetDocRef = null;
  let existingData = null;
  let resolvedTournamentId = cleanTournamentId;

  if (cleanTournamentId) {
    const docId = `${cleanTournamentId}_${cleanUserId}`;
    const directRef = doc(db, 'tournament_participants', docId);
    const snap = await getDoc(directRef);

    if (snap.exists()) {
      targetDocRef = directRef;
      existingData = snap.data();
    } else {
      // Query collection fallback in case document had an auto-generated ID
      const q = query(
        collection(db, 'tournament_participants'),
        where('tournament_id', '==', cleanTournamentId),
        where('user_id', '==', cleanUserId),
        limit(1)
      );
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        targetDocRef = querySnap.docs[0].ref;
        existingData = querySnap.docs[0].data();
      } else {
        // Will create new document with canonical ID
        targetDocRef = directRef;
      }
    }
  } else {
    // If tournament_id was NOT provided, find existing participations for this user_id
    const qUser = query(
      collection(db, 'tournament_participants'),
      where('user_id', '==', cleanUserId)
    );
    const userSnap = await getDocs(qUser);

    if (!userSnap.empty) {
      // Pick the most recent record or first record
      const docs = userSnap.docs.map((d) => ({ ref: d.ref, data: d.data() }));
      docs.sort((a, b) => {
        const timeA = a.data.updated_at?.toMillis ? a.data.updated_at.toMillis() : 0;
        const timeB = b.data.updated_at?.toMillis ? b.data.updated_at.toMillis() : 0;
        return timeB - timeA;
      });
      targetDocRef = docs[0].ref;
      existingData = docs[0].data;
      resolvedTournamentId = existingData.tournament_id || '';
    } else {
      // Try to find currently ongoing tournament to auto-enroll
      try {
        const qOngoing = query(
          collection(db, 'tournaments'),
          where('status', '==', 'ongoing'),
          limit(1)
        );
        const ongoingSnap = await getDocs(qOngoing);
        if (!ongoingSnap.empty) {
          resolvedTournamentId = ongoingSnap.docs[0].id;
          targetDocRef = doc(db, 'tournament_participants', `${resolvedTournamentId}_${cleanUserId}`);
        }
      } catch {
        // Fallback
      }
    }
  }

  if (!targetDocRef || !resolvedTournamentId) {
    throw new Error('tournament_id is required to register or update score for a new tournament participant');
  }

  const previousScore = existingData?.score !== undefined ? Number(existingData.score) : null;
  const previousHighest = existingData?.highest_score !== undefined ? Number(existingData.highest_score) : (previousScore || 0);

  // If keepOnlyHighest is requested, do not lower score if new score is smaller
  const finalScore = keepOnlyHighest ? Math.max(previousScore || 0, numericScore) : numericScore;
  const newHighestScore = Math.max(previousHighest, numericScore);

  if (existingData) {
    // Update existing document
    const updatePayload = {
      score: finalScore,
      highest_score: newHighestScore,
      previous_score: previousScore,
      updated_at: serverTimestamp()
    };
    if (cleanUsername) {
      updatePayload.username = cleanUsername;
    }
    await updateDoc(targetDocRef, updatePayload);
  } else {
    // Create new document
    const initialPayload = {
      participant_id: targetDocRef.id,
      tournament_id: resolvedTournamentId,
      user_id: cleanUserId,
      username: cleanUsername || 'Player',
      score: finalScore,
      highest_score: newHighestScore,
      previous_score: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    await setDoc(targetDocRef, initialPayload, { merge: true });
  }

  return {
    participant_id: targetDocRef.id,
    user_id: cleanUserId,
    tournament_id: resolvedTournamentId,
    score: finalScore,
    previous_score: previousScore,
    highest_score: newHighestScore
  };
}

/**
 * POST /api/tournament-participants/update
 * 
 * Updates the tournament_participants collection to include the user's score from a game.
 * Uses user_id so scores never get mixed up between players.
 * 
 * Body JSON parameters:
 * - user_id (required): Unique player identifier
 * - score (required): Numeric game score (e.g. 2234)
 * - tournament_id (recommended): Identifier of the 24-hour tournament
 * - username (optional): Display name of the player
 * - high_score_only (optional boolean): If true, preserves highest score achieved
 */
export async function POST(request) {
  try {
    if (!isFirebaseLive || !db) {
      return jsonResponse(
        { success: false, error: 'Database service is currently unavailable' },
        503
      );
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        { success: false, error: 'Invalid JSON request payload' },
        400
      );
    }

    const userId = body.user_id || body.userId;
    const scoreVal = body.score;
    const tournamentId = body.tournament_id || body.tournamentId;
    const username = body.username || body.name;
    const keepOnlyHighest = Boolean(body.high_score_only || body.keepOnlyHighest);

    // Validation
    if (!userId || typeof userId !== 'string' && typeof userId !== 'number') {
      return jsonResponse(
        { success: false, error: 'user_id is required to record participant score' },
        400
      );
    }

    if (scoreVal === undefined || scoreVal === null || isNaN(Number(scoreVal))) {
      return jsonResponse(
        { success: false, error: 'A valid numeric score is required (e.g. { "score": 2234 })' },
        400
      );
    }

    const result = await recordParticipantScore({
      userId,
      tournamentId,
      score: scoreVal,
      username,
      keepOnlyHighest
    });

    return jsonResponse({
      success: true,
      message: 'Score updated successfully in tournament_participants collection',
      data: result,
      ...result
    });
  } catch (err) {
    console.error('[API] POST /api/tournament-participants/update error:', err);
    return jsonResponse(
      { success: false, error: err.message || 'Failed to update participant score' },
      500
    );
  }
}

/**
 * PUT /api/tournament-participants/update
 * Also accept PUT for RESTful callers
 */
export const PUT = POST;

/**
 * PATCH /api/tournament-participants/update
 * Also accept PATCH for partial score updates
 */
export const PATCH = POST;

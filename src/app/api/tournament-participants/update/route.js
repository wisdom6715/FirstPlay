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
 * Helper to update or create a tournament participant score document.
 * Enforces single-play rule: each user can only play and submit their score once per tournament.
 * Subsequent attempts to submit or update a score will be rejected with HTTP 409 Conflict.
 */
async function recordParticipantScore({ userId, tournamentId, score, username }) {
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
    // If tournament_id was NOT provided, first attempt to find currently ongoing tournament
    try {
      const qOngoing = query(
        collection(db, 'tournaments'),
        where('status', '==', 'ongoing'),
        limit(1)
      );
      const ongoingSnap = await getDocs(qOngoing);
      if (!ongoingSnap.empty) {
        resolvedTournamentId = ongoingSnap.docs[0].id;
        const directRef = doc(db, 'tournament_participants', `${resolvedTournamentId}_${cleanUserId}`);
        const snap = await getDoc(directRef);
        if (snap.exists()) {
          targetDocRef = directRef;
          existingData = snap.data();
        } else {
          targetDocRef = directRef;
        }
      }
    } catch {
      // Fallback
    }

    if (!targetDocRef) {
      // Fallback: check existing participations for this user_id
      const qUser = query(
        collection(db, 'tournament_participants'),
        where('user_id', '==', cleanUserId)
      );
      const userSnap = await getDocs(qUser);

      if (!userSnap.empty) {
        const docs = userSnap.docs.map((d) => ({ ref: d.ref, data: d.data() }));
        docs.sort((a, b) => {
          const timeA = a.data.updated_at?.toMillis ? a.data.updated_at.toMillis() : 0;
          const timeB = b.data.updated_at?.toMillis ? b.data.updated_at.toMillis() : 0;
          return timeB - timeA;
        });
        targetDocRef = docs[0].ref;
        existingData = docs[0].data;
        resolvedTournamentId = existingData.tournament_id || '';
      }
    }
  }

  if (!targetDocRef || !resolvedTournamentId) {
    throw new Error('tournament_id is required to register or update score for a new tournament participant');
  }

  // Check if score has already been submitted for this user in this tournament
  const alreadyPlayed = Boolean(
    existingData && (
      existingData.has_played === true ||
      existingData.score_submitted === true ||
      existingData.played === true ||
      (existingData.score !== undefined && existingData.score !== null)
    )
  );

  if (alreadyPlayed) {
    const err = new Error('Score has already been submitted for this tournament. Each user can only play and submit their score once.');
    err.statusCode = 409;
    err.details = {
      already_played: true,
      has_played: true,
      can_play: false,
      user_id: cleanUserId,
      tournament_id: resolvedTournamentId,
      existing_score: Number(existingData.score) || 0,
      submitted_at: existingData.submitted_at?.toDate ? existingData.submitted_at.toDate().toISOString() : (existingData.submitted_at || null)
    };
    throw err;
  }

  if (existingData) {
    // User already joined/registered but hasn't submitted a score yet
    const updatePayload = {
      score: numericScore,
      highest_score: numericScore,
      has_played: true,
      played: true,
      score_submitted: true,
      submitted_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    if (cleanUsername) {
      updatePayload.username = cleanUsername;
    }
    await updateDoc(targetDocRef, updatePayload);
  } else {
    // New participation with score
    const initialPayload = {
      participant_id: targetDocRef.id,
      tournament_id: resolvedTournamentId,
      user_id: cleanUserId,
      username: cleanUsername || 'Player',
      score: numericScore,
      highest_score: numericScore,
      has_played: true,
      played: true,
      score_submitted: true,
      submitted_at: serverTimestamp(),
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    await setDoc(targetDocRef, initialPayload, { merge: true });
  }

  return {
    participant_id: targetDocRef.id,
    user_id: cleanUserId,
    tournament_id: resolvedTournamentId,
    score: numericScore,
    highest_score: numericScore,
    has_played: true,
    already_played: true,
    can_play: false
  };
}

/**
 * POST /api/tournament-participants/update
 * 
 * Updates the tournament_participants collection to include the user's score from a game.
 * Uses user_id so scores never get mixed up between players.
 * 
 * Single-Play Enforcement:
 * A player can only submit their score once per tournament. Subsequent score submissions
 * or update attempts for the same tournament will be rejected with HTTP 409 Conflict.
 * 
 * Body JSON parameters:
 * - user_id (required): Unique player identifier
 * - score (required): Numeric game score (e.g. 2234)
 * - tournament_id (recommended): Identifier of the tournament
 * - username (optional): Display name of the player
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

    // Validation
    if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
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
      username
    });

    return jsonResponse({
      success: true,
      message: 'Score submitted successfully. User has completed their single play for this tournament.',
      data: result,
      ...result
    });
  } catch (err) {
    console.error('[API] POST /api/tournament-participants/update error:', err);
    const statusCode = err.statusCode || 500;
    return jsonResponse(
      { 
        success: false, 
        error: err.message || 'Failed to update participant score',
        ...(err.details || {})
      },
      statusCode
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

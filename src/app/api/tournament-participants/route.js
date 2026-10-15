import { db, isFirebaseLive } from '../../../services/firebaseConfig.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  setDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { handleOptions, jsonResponse } from '../../../utils/apiCors.js';

export const OPTIONS = handleOptions;

/**
 * Helper to normalize a participant document into a clean JSON object
 */
function normalizeParticipant(docSnap) {
  if (!docSnap) return null;
  const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
  const docId = docSnap.id || data.id || '';

  return {
    id: docId,
    participant_id: data.participant_id || docId,
    tournament_id: data.tournament_id || '',
    user_id: data.user_id || data.userId || '',
    username: data.username || data.name || data.display_name || 'Player',
    score: Number(data.score) || 0,
    highest_score: Number(data.highest_score ?? data.score) || 0,
    created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at || null,
    updated_at: data.updated_at?.toDate ? data.updated_at.toDate().toISOString() : data.updated_at || null
  };
}

/**
 * GET /api/tournament-participants
 * 
 * Used to check whether a user has participated in a tournament or not.
 * 
 * Query Parameters:
 * - user_id (required to check user participation)
 * - tournament_id (optional: filter to a specific tournament)
 * 
 * Examples:
 * - /api/tournament-participants?user_id=123&tournament_id=LAGOS_GP
 * - /api/tournament-participants?user_id=123
 */
export async function GET(request) {
  try {
    if (!isFirebaseLive || !db) {
      return jsonResponse(
        { success: false, error: 'Database service is currently unavailable' },
        503
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = (searchParams.get('user_id') || searchParams.get('userId') || '').trim();
    const tournamentId = (searchParams.get('tournament_id') || searchParams.get('tournamentId') || '').trim();

    // Case 1: Check participation using user_id
    if (userId) {
      // 1a. If both tournament_id and user_id are provided
      if (tournamentId) {
        // Direct doc lookup by convention: `${tournament_id}_${userId}`
        const directDocId = `${tournamentId}_${userId}`;
        try {
          const directRef = doc(db, 'tournament_participants', directDocId);
          const directSnap = await getDoc(directRef);
          if (directSnap.exists()) {
            const participant = normalizeParticipant(directSnap);
            return jsonResponse({
              success: true,
              has_participated: true,
              hasParticipated: true,
              user_id: userId,
              tournament_id: tournamentId,
              score: participant.score,
              participant
            });
          }
        } catch {
          // Continue to collection query fallback
        }

        // Collection query: tournament_id + user_id
        const q = query(
          collection(db, 'tournament_participants'),
          where('tournament_id', '==', tournamentId),
          where('user_id', '==', userId),
          limit(1)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const participant = normalizeParticipant(snap.docs[0]);
          return jsonResponse({
            success: true,
            has_participated: true,
            hasParticipated: true,
            user_id: userId,
            tournament_id: tournamentId,
            score: participant.score,
            participant
          });
        }

        // Not participated in this specific tournament
        return jsonResponse({
          success: true,
          has_participated: false,
          hasParticipated: false,
          user_id: userId,
          tournament_id: tournamentId,
          score: null,
          participant: null
        });
      }

      // 1b. If only user_id is provided, fetch all tournament participations for this user
      const qUser = query(
        collection(db, 'tournament_participants'),
        where('user_id', '==', userId)
      );
      const snapUser = await getDocs(qUser);
      const records = snapUser.docs.map(normalizeParticipant);

      const hasParticipated = records.length > 0;
      return jsonResponse({
        success: true,
        has_participated: hasParticipated,
        hasParticipated: hasParticipated,
        user_id: userId,
        participations_count: records.length,
        participations: records,
        participant: records[0] || null
      });
    }

    // Case 2: If only tournament_id is provided, list participants in that tournament
    if (tournamentId) {
      const qTourney = query(
        collection(db, 'tournament_participants'),
        where('tournament_id', '==', tournamentId)
      );
      const snapTourney = await getDocs(qTourney);
      const list = snapTourney.docs.map(normalizeParticipant);
      list.sort((a, b) => (b.score || 0) - (a.score || 0));

      return jsonResponse({
        success: true,
        tournament_id: tournamentId,
        participants_count: list.length,
        participants: list
      });
    }

    // Neither provided
    return jsonResponse(
      {
        success: false,
        error: 'Missing required parameter: please provide user_id to check tournament participation status'
      },
      400
    );
  } catch (err) {
    console.error('[API] GET /api/tournament-participants error:', err);
    return jsonResponse(
      { success: false, error: err.message || 'Failed to fetch tournament participant data' },
      500
    );
  }
}

/**
 * POST /api/tournament-participants
 * 
 * Supports:
 * 1. Checking participation status via JSON body: { "user_id": "...", "tournament_id": "..." }
 * 2. Updating score directly if { "score": 2234 } is included in the body
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
      body = {};
    }

    const userId = (body.user_id || body.userId || '').toString().trim();
    const tournamentId = (body.tournament_id || body.tournamentId || '').toString().trim();
    const scoreVal = body.score;
    const username = (body.username || body.name || '').toString().trim();

    if (!userId) {
      return jsonResponse(
        { success: false, error: 'user_id is required in request body' },
        400
      );
    }

    // If score is provided, forward to update logic
    if (scoreVal !== undefined && scoreVal !== null) {
      const numericScore = Number(scoreVal);
      if (isNaN(numericScore)) {
        return jsonResponse(
          { success: false, error: 'score must be a valid number' },
          400
        );
      }

      if (!tournamentId) {
        return jsonResponse(
          { success: false, error: 'tournament_id is required to update participant score' },
          400
        );
      }

      const docId = `${tournamentId}_${userId}`;
      const docRef = doc(db, 'tournament_participants', docId);
      const existingSnap = await getDoc(docRef);

      let previousScore = 0;
      let highestScore = numericScore;

      if (existingSnap.exists()) {
        const existingData = existingSnap.data() || {};
        previousScore = Number(existingData.score) || 0;
        highestScore = Math.max(previousScore, numericScore);

        const updatePayload = {
          score: numericScore,
          highest_score: highestScore,
          previous_score: previousScore,
          updated_at: serverTimestamp()
        };
        if (username) updatePayload.username = username;

        await updateDoc(docRef, updatePayload);
      } else {
        await setDoc(docRef, {
          participant_id: docId,
          tournament_id: tournamentId,
          user_id: userId,
          username: username || 'Player',
          score: numericScore,
          highest_score: numericScore,
          previous_score: 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        }, { merge: true });
      }

      return jsonResponse({
        success: true,
        message: 'Tournament participant score updated successfully',
        user_id: userId,
        tournament_id: tournamentId,
        score: numericScore,
        previous_score: previousScore,
        highest_score: highestScore,
        participant_id: docId
      });
    }

    // Otherwise, perform participation check via POST body
    if (tournamentId) {
      const docId = `${tournamentId}_${userId}`;
      const directRef = doc(db, 'tournament_participants', docId);
      const snap = await getDoc(directRef);

      if (snap.exists()) {
        const participant = normalizeParticipant(snap);
        return jsonResponse({
          success: true,
          has_participated: true,
          hasParticipated: true,
          user_id: userId,
          tournament_id: tournamentId,
          score: participant.score,
          participant
        });
      }

      return jsonResponse({
        success: true,
        has_participated: false,
        hasParticipated: false,
        user_id: userId,
        tournament_id: tournamentId,
        score: null,
        participant: null
      });
    }

    // No tournamentId specified: query by user_id
    const qUser = query(
      collection(db, 'tournament_participants'),
      where('user_id', '==', userId)
    );
    const snapUser = await getDocs(qUser);
    const records = snapUser.docs.map(normalizeParticipant);

    return jsonResponse({
      success: true,
      has_participated: records.length > 0,
      hasParticipated: records.length > 0,
      user_id: userId,
      participations_count: records.length,
      participations: records,
      participant: records[0] || null
    });
  } catch (err) {
    console.error('[API] POST /api/tournament-participants error:', err);
    return jsonResponse(
      { success: false, error: err.message || 'Failed to process request' },
      500
    );
  }
}

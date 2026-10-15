import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db, isFirebaseLive } from './firebaseConfig';

/**
 * FirstPlay Tournament Service
 * Manages 24-hour competitive tournaments, Top 5 prize pool calculation,
 * participant scoring, and secure winner prize redemptions.
 */

/**
 * Fetch all tournaments from Firestore
 * Automatically computes live status if 24 hours have elapsed.
 */
export async function getTournaments() {
  if (!isFirebaseLive || !db) {
    return [];
  }

  try {
    const tournamentsRef = collection(db, 'tournaments');
    let snapshot;
    try {
      const q = query(tournamentsRef, orderBy('created_at', 'desc'));
      snapshot = await getDocs(q);
    } catch {
      snapshot = await getDocs(tournamentsRef);
    }

    const now = Date.now();

    const list = snapshot.docs.map((d) => {
      const data = d.data();
      const startsAtMillis = data.starts_at?.toMillis ? data.starts_at.toMillis() : (data.starts_at ? new Date(data.starts_at).getTime() : now);
      const endsAtMillis = data.ends_at?.toMillis ? data.ends_at.toMillis() : (startsAtMillis + 24 * 60 * 60 * 1000);

      let computedStatus = data.status || 'upcoming';
      if (computedStatus !== 'cancelled') {
        if (now < startsAtMillis) {
          computedStatus = 'upcoming';
        } else if (now >= startsAtMillis && now < endsAtMillis) {
          computedStatus = 'ongoing';
        } else if (now >= endsAtMillis) {
          // 24 hours elapsed - counts as completed
          computedStatus = 'completed';
        }
      }

      return {
        id: d.id,
        tournament_id: data.tournament_id || d.id,
        ...data,
        computedStatus,
        startsAtDate: new Date(startsAtMillis),
        endsAtDate: new Date(endsAtMillis)
      };
    });

    // Sort descending by startsAtDate or created_at
    list.sort((a, b) => (b.startsAtDate?.getTime() || 0) - (a.startsAtDate?.getTime() || 0));
    return list;
  } catch (err) {
    console.error('[tournamentService] Error fetching tournaments:', err);
    return [];
  }
}

/**
 * Create a new 24-Hour Tournament in Firestore
 * Top 5 prize pool: 1st (40%), 2nd (25%), 3rd (15%), 4th (10%), 5th (10%)
 */
export async function createTournamentOnAdmin({
  tournamentName,
  gameId,
  gameName,
  gameLogo,
  tournamentImgUrl,
  description,
  startsAtDate = new Date(),
  prizePoolAmount = 50000,
  maxParticipants = null
}) {
  if (!isFirebaseLive || !db) {
    throw new Error('Firebase connection not available');
  }

  if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
    throw new Error('A valid pre-existing game_id from an approved game is required.');
  }

  const tournamentsRef = collection(db, 'tournaments');
  const tournamentDoc = doc(tournamentsRef);
  const tournamentId = tournamentDoc.id;

  const startsAt = Timestamp.fromDate(startsAtDate);
  // Strictly 24 hours duration
  const endsAt = Timestamp.fromDate(
    new Date(startsAtDate.getTime() + 24 * 60 * 60 * 1000)
  );

  // Auto-compute Top 5 distribution amounts
  const pool = Number(prizePoolAmount) || 0;
  const distribution = {
    '1': `₦${Math.round(pool * 0.40).toLocaleString()}`, // 40%
    '2': `₦${Math.round(pool * 0.25).toLocaleString()}`, // 25%
    '3': `₦${Math.round(pool * 0.15).toLocaleString()}`, // 15%
    '4': `₦${Math.round(pool * 0.10).toLocaleString()}`, // 10%
    '5': `₦${Math.round(pool * 0.10).toLocaleString()}`  // 10%
  };

  const payload = {
    tournament_id: tournamentId,
    tournament_name: tournamentName.trim(),
    description: (description || '').trim(),
    game_id: gameId,
    game_name: gameName || 'FirstPlay Game',
    game_logo: gameLogo || '',
    tournament_img: tournamentImgUrl || gameLogo || '',
    status: startsAtDate > new Date() ? 'upcoming' : 'ongoing',
    starts_at: startsAt,
    ends_at: endsAt,
    duration_hours: 24,
    prize_description: `₦${pool.toLocaleString()} Prize Pool`,
    prize_pool: pool,
    prize_distribution: distribution,
    created_at: serverTimestamp()
  };

  if (maxParticipants && Number(maxParticipants) > 0) {
    payload.max_participants = Number(maxParticipants);
  }

  await setDoc(tournamentDoc, payload);
  return { success: true, tournamentId };
}

/**
 * Concluding Tournaments & Generating Winner Redemptions
 * Finalizes the Top 5 participants by highest score and issues secure prize claims.
 */
export async function concludeTournamentAndAwardPrizes(tournamentId) {
  if (!isFirebaseLive || !db) {
    throw new Error('Firebase connection not available');
  }

  // 1. Fetch Top 5 participants by highest score (with fallback for composite index)
  let winners = [];
  try {
    const top5Query = query(
      collection(db, 'tournament_participants'),
      where('tournament_id', '==', tournamentId),
      orderBy('score', 'desc'),
      limit(5)
    );
    const snapshot = await getDocs(top5Query);
    winners = snapshot.docs.map((d, index) => ({
      ...d.data(),
      rank: index + 1
    }));
  } catch (indexErr) {
    console.warn('[tournamentService] Compound index fallback for leaderboard query:', indexErr);
    const fallbackQuery = query(
      collection(db, 'tournament_participants'),
      where('tournament_id', '==', tournamentId)
    );
    const snapshot = await getDocs(fallbackQuery);
    const all = snapshot.docs.map((d) => d.data());
    all.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
    winners = all.slice(0, 5).map((w, index) => ({
      ...w,
      rank: index + 1
    }));
  }

  // 2. Fetch tournament distribution details
  const tourneyDocRef = doc(db, 'tournaments', tournamentId);
  const tourneySnap = await getDoc(tourneyDocRef);
  const tourneyData = tourneySnap.exists() ? tourneySnap.data() : null;
  const distribution = tourneyData?.prize_distribution || {};

  // 3. Issue secure prize redemption entries for the 5 winners
  for (const winner of winners) {
    if (!winner.user_id) continue;
    const redemptionId = `${tournamentId}_${winner.user_id}`;
    const redemptionRef = doc(db, 'prize_redemptions', redemptionId);

    await setDoc(redemptionRef, {
      redemption_id: redemptionId,
      tournament_id: tournamentId,
      tournament_name: tourneyData?.tournament_name || 'FirstPlay Championship',
      user_id: winner.user_id,
      username: winner.username || winner.display_name || 'Player',
      rank: winner.rank,
      prize_amount: distribution[String(winner.rank)] || 'Prize Winner',
      status: 'pending',
      created_at: serverTimestamp()
    }, { merge: true });
  }

  // 4. Mark status as 'completed' (stays visible in past tournaments!)
  await updateDoc(tourneyDocRef, {
    status: 'completed',
    updated_at: serverTimestamp()
  });

  return { success: true, winnersCount: winners.length, winners };
}

/**
 * Delete a tournament explicitly from the admin dashboard
 */
export async function deleteTournament(tournamentId) {
  if (!isFirebaseLive || !db) {
    throw new Error('Firebase connection not available');
  }

  const tourneyDocRef = doc(db, 'tournaments', tournamentId);
  await deleteDoc(tourneyDocRef);
  return { success: true };
}

/**
 * Fetch participants and scores for a tournament
 */
export async function getTournamentParticipants(tournamentId) {
  if (!isFirebaseLive || !db) return [];

  try {
    let list = [];
    try {
      const q = query(
        collection(db, 'tournament_participants'),
        where('tournament_id', '==', tournamentId),
        orderBy('score', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      list = snap.docs.map((d, idx) => ({ id: d.id, rank: idx + 1, ...d.data() }));
    } catch {
      const qFallback = query(
        collection(db, 'tournament_participants'),
        where('tournament_id', '==', tournamentId)
      );
      const snap = await getDocs(qFallback);
      list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
      list = list.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }
    return list;
  } catch (err) {
    console.error('[tournamentService] Error fetching participants:', err);
    return [];
  }
}

/**
 * Fetch prize redemptions issued for a tournament
 */
export async function getTournamentPrizeRedemptions(tournamentId) {
  if (!isFirebaseLive || !db) return [];

  try {
    const q = query(
      collection(db, 'prize_redemptions'),
      where('tournament_id', '==', tournamentId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[tournamentService] Error fetching prize redemptions:', err);
    return [];
  }
}

/**
 * Update a prize redemption status (e.g., mark as 'paid' or 'approved')
 */
export async function updatePrizeRedemptionStatus(redemptionId, newStatus) {
  if (!isFirebaseLive || !db) throw new Error('Firebase not connected');

  const refDoc = doc(db, 'prize_redemptions', redemptionId);
  const updatePayload = {
    status: newStatus,
    updated_at: serverTimestamp()
  };
  if (newStatus === 'paid') {
    updatePayload.paid_at = serverTimestamp();
  }
  await updateDoc(refDoc, updatePayload);
  return { success: true };
}

export const tournamentService = {
  getTournaments,
  createTournamentOnAdmin,
  concludeTournamentAndAwardPrizes,
  deleteTournament,
  getTournamentParticipants,
  getTournamentPrizeRedemptions,
  updatePrizeRedemptionStatus
};

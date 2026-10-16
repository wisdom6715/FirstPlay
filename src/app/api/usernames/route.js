import { db, isFirebaseLive } from '../../../services/firebaseConfig.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit 
} from 'firebase/firestore';
import { handleOptions, jsonResponse } from '../../../utils/apiCors.js';

export const OPTIONS = handleOptions;

/**
 * Helper to resolve username and user_id from a Firestore document snapshot
 */
function extractUserData(docSnap, fallbackId = '') {
  if (!docSnap || !docSnap.exists()) return null;
  const data = docSnap.data() || {};
  
  // Normalize user_id: prefer explicit field, fallback to doc ID
  const userId = (
    data.user_id || 
    data.userId || 
    data.uid || 
    data.id || 
    fallbackId || 
    docSnap.id
  ).toString().trim();

  // Normalize username: prefer explicit field, fallback to name or doc ID
  const username = (
    data.username || 
    data.user_name || 
    data.userName || 
    data.name || 
    data.display_name || 
    data.displayName || 
    docSnap.id
  ).toString().trim();

  return {
    user_id: userId,
    username,
    name: username,
    created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at || null,
    avatar_url: data.avatar_url || data.photo_url || null
  };
}

/**
 * Core resolver that finds a user in the 'usernames' collection
 * Handles document ID lookups, field queries, and graceful fallbacks.
 */
async function findUser({ userId = '', username = '' }) {
  const cleanUserId = (userId || '').trim();
  const cleanUsername = (username || '').trim();

  // 1. If searching by user_id
  if (cleanUserId) {
    // 1a. Direct doc lookup in 'usernames' where docId === userId
    try {
      const directDocRef = doc(db, 'usernames', cleanUserId);
      const directSnap = await getDoc(directDocRef);
      if (directSnap.exists()) {
        return extractUserData(directSnap, cleanUserId);
      }
    } catch (e) {
      // Continue to query fallback
    }

    // 1b. Query 'usernames' collection where user_id == cleanUserId
    try {
      const q = query(
        collection(db, 'usernames'),
        where('user_id', '==', cleanUserId),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return extractUserData(snap.docs[0], cleanUserId);
      }
    } catch (e) {
      // Continue
    }

    // 1c. Query 'usernames' collection where uid == cleanUserId
    try {
      const qUid = query(
        collection(db, 'usernames'),
        where('uid', '==', cleanUserId),
        limit(1)
      );
      const snapUid = await getDocs(qUid);
      if (!snapUid.empty) {
        return extractUserData(snapUid.docs[0], cleanUserId);
      }
    } catch (e) {
      // Continue
    }

    // 1d. Fallback: Check 'users' collection in case user profile is stored there
    try {
      const userDocRef = doc(db, 'users', cleanUserId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        return extractUserData(userSnap, cleanUserId);
      }
    } catch (e) {
      // Continue
    }
  }

  // 2. If searching by username
  if (cleanUsername) {
    // 2a. Direct doc lookup in 'usernames' where docId === username
    try {
      const directDocRef = doc(db, 'usernames', cleanUsername.toLowerCase());
      const directSnap = await getDoc(directDocRef);
      if (directSnap.exists()) {
        return extractUserData(directSnap);
      }
    } catch (e) {
      // Continue
    }

    // 2b. Query 'usernames' where username == cleanUsername
    try {
      const q = query(
        collection(db, 'usernames'),
        where('username', '==', cleanUsername),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return extractUserData(snap.docs[0]);
      }
    } catch (e) {
      // Continue
    }

    // 2c. Query case-insensitive or name match
    try {
      const qLower = query(
        collection(db, 'usernames'),
        where('username', '==', cleanUsername.toLowerCase()),
        limit(1)
      );
      const snapLower = await getDocs(qLower);
      if (!snapLower.empty) {
        return extractUserData(snapLower.docs[0]);
      }
    } catch (e) {
      // Continue
    }
  }

  return null;
}

/**
 * GET /api/usernames
 * 
 * Usage:
 * - Specific user by ID: /api/usernames?user_id=12345 (or ?userId=12345)
 * - Specific user by username: /api/usernames?username=player1
 * - List all usernames: /api/usernames?limit=50
 * 
 * Returns the unique user_id and username to seamlessly authenticate players in games
 * without requiring a separate registration or sign-in on game pages.
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
    const userId = searchParams.get('user_id') || searchParams.get('userId') || searchParams.get('id');
    const username = searchParams.get('username') || searchParams.get('name');
    const queryLimit = parseInt(searchParams.get('limit') || '100', 10);

    // If a specific user query was requested
    if (userId || username) {
      const user = await findUser({ userId, username });

      if (!user) {
        return jsonResponse(
          {
            success: false,
            error: 'User not found in usernames collection',
            user_id: userId || null,
            username: username || null
          },
          404
        );
      }

      return jsonResponse({
        success: true,
        user_id: user.user_id,
        username: user.username,
        name: user.name,
        user: {
          user_id: user.user_id,
          username: user.username
        }
      });
    }

    // Otherwise, fetch all usernames from 'usernames' collection
    const usernamesColl = collection(db, 'usernames');
    const q = query(usernamesColl, limit(Math.min(queryLimit, 500)));
    const snap = await getDocs(q);

    const users = snap.docs.map((d) => extractUserData(d, d.id)).filter(Boolean);

    return jsonResponse({
      success: true,
      count: users.length,
      users,
      usernames: users
    });
  } catch (err) {
    console.error('[API] GET /api/usernames error:', err);
    return jsonResponse(
      { success: false, error: err.message || 'Failed to fetch usernames' },
      500
    );
  }
}

/**
 * POST /api/usernames
 * 
 * Allows callers/games that prefer sending JSON bodies to fetch the user:
 * Body: { "user_id": "..." } or { "username": "..." }
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

    const userId = body.user_id || body.userId || body.id;
    const username = body.username || body.name;

    if (!userId && !username) {
      return jsonResponse(
        { success: false, error: 'user_id or username is required in the request body' },
        400
      );
    }

    const user = await findUser({ userId, username });

    if (!user) {
      return jsonResponse(
        {
          success: false,
          error: 'User not found in usernames collection',
          user_id: userId || null,
          username: username || null
        },
        404
      );
    }

    return jsonResponse({
      success: true,
      user_id: user.user_id,
      username: user.username,
      name: user.name,
      user: {
        user_id: user.user_id,
        username: user.username
      }
    });
  } catch (err) {
    console.error('[API] POST /api/usernames error:', err);
    return jsonResponse(
      { success: false, error: err.message || 'Failed to resolve user' },
      500
    );
  }
}

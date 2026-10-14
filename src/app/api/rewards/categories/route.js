import { NextResponse } from 'next/server';
import { db, isFirebaseLive } from '../../../../services/firebaseConfig';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';

/**
 * GET /api/rewards/categories
 * Returns all gift categories from the `gift_categories` collection in Firebase.
 */
export async function GET() {
  try {
    if (!isFirebaseLive || !db) {
      return NextResponse.json({ success: true, categories: [] });
    }

    const categoriesColl = collection(db, 'gift_categories');
    let snap;
    try {
      const q = query(categoriesColl, orderBy('created_at', 'desc'));
      snap = await getDocs(q);
    } catch (orderErr) {
      // Fallback if index not yet created
      snap = await getDocs(categoriesColl);
    }

    const list = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at,
        updated_at: data.updated_at?.toDate ? data.updated_at.toDate().toISOString() : data.updated_at
      };
    });

    return NextResponse.json({ success: true, categories: list });
  } catch (err) {
    console.error('[API] GET /api/rewards/categories error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch gift categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rewards/categories
 * Creates a new gift category or updates an existing one in `gift_categories`.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, description, unit, is_active } = body || {};

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name is required.' },
        { status: 400 }
      );
    }

    if (!isFirebaseLive || !db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unavailable.' },
        { status: 503 }
      );
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    const docData = {
      name: trimmedName,
      slug,
      unit: (unit || 'MB').trim(),
      description: (description || '').trim(),
      is_active: is_active !== false,
      updated_at: serverTimestamp()
    };

    if (id) {
      // Update existing category
      const docRef = doc(db, 'gift_categories', id);
      await updateDoc(docRef, docData);
      return NextResponse.json({
        success: true,
        message: 'Category updated successfully.',
        category: { id, ...docData }
      });
    } else {
      // Create new category
      docData.created_at = serverTimestamp();
      const newRef = await addDoc(collection(db, 'gift_categories'), docData);
      return NextResponse.json({
        success: true,
        message: 'Category created successfully.',
        category: { id: newRef.id, ...docData }
      });
    }
  } catch (err) {
    console.error('[API] POST /api/rewards/categories error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save gift category' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rewards/categories
 * Deletes a category from `gift_categories`.
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required.' },
        { status: 400 }
      );
    }

    if (!isFirebaseLive || !db) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 503 }
      );
    }

    const docRef = doc(db, 'gift_categories', id);
    await deleteDoc(docRef);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (err) {
    console.error('[API] DELETE /api/rewards/categories error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}

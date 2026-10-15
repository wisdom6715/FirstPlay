import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Normalizes and extracts a deduplicated pool of items suitable for banner carousels.
 * Strictly uses authentic items from the promotional collection in Firebase.
 */
export function getUniqueBannerPool(heroBanners = [], listings = [], heroItem = null) {
  const seen = new Set();
  const pool = [];

  const addItem = (item) => {
    if (!item) return;
    const key = item.id || item.url || item.name || item.banner_url || item.image_url;
    if (!key || seen.has(key)) return;
    seen.add(key);
    pool.push(item);
  };

  (heroBanners || []).forEach(addItem);
  if (heroItem) addItem(heroItem);
  // NOTE: Catalog listings are intentionally excluded.
  // Banners in this website must ONLY render images/products from the promotional collection in Firebase.

  return pool;
}

/**
 * useBannerCoordinator
 *
 * Coordinates multiple banner slots across a view:
 * 1. If there are enough items in Firebase (pool.length >= slotIds.length):
 *    - Banner 1 (e.g. top) starts on item 0.
 *    - Subsequent banners start on distinct items from the pool.
 *    - No two banners display the same item simultaneously.
 *    - Advancing or clicking any banner strictly picks an item not currently displayed elsewhere.
 * 2. If there are NOT enough items in Firebase (e.g. only 2 games in Firebase):
 *    - The mutual exclusivity rule is overridden: banners display whatever is on Firebase.
 *    - 2 banners can display the same thing.
 *    - Each banner cycles through available Firebase items cleanly.
 */
export function useBannerCoordinator(pool = [], slotIds = ['top']) {
  const validPool = useMemo(() => {
    return Array.isArray(pool) ? pool.filter(Boolean) : [];
  }, [pool]);

  const poolKey = useMemo(() => {
    return validPool.map(i => i.id || i.name).join('|');
  }, [validPool]);

  const slotIdsKey = useMemo(() => {
    return (slotIds || []).join(',');
  }, [slotIds]);

  // slotIndices maps slotId -> index in validPool
  const [slotIndices, setSlotIndices] = useState(() => {
    const initial = {};
    const count = validPool.length;
    if (count === 0) {
      (slotIds || []).forEach(id => { initial[id] = 0; });
      return initial;
    }

    const hasEnough = count >= (slotIds || []).length;
    const used = new Set();

    (slotIds || []).forEach((slotId, slotOrder) => {
      if (hasEnough) {
        if (slotOrder === 0) {
          initial[slotId] = 0;
          used.add(0);
        } else {
          const available = [];
          for (let i = 0; i < count; i++) {
            if (!used.has(i)) available.push(i);
          }
          const chosen = available.length > 0 
            ? available[Math.floor(Math.random() * available.length)]
            : slotOrder % count;
          initial[slotId] = chosen;
          used.add(chosen);
        }
      } else {
        // Not enough data in Firebase: override rule and cycle through available items
        initial[slotId] = slotOrder % count;
      }
    });

    return initial;
  });

  // Re-synchronize when validPool or slotIds changes
  useEffect(() => {
    const count = validPool.length;
    if (count === 0) return;

    setSlotIndices(prev => {
      const next = {};
      const hasEnough = count >= (slotIds || []).length;
      const used = new Set();

      (slotIds || []).forEach((slotId, slotOrder) => {
        const existingIdx = prev[slotId];

        if (hasEnough) {
          if (typeof existingIdx === 'number' && existingIdx < count && !used.has(existingIdx)) {
            next[slotId] = existingIdx;
            used.add(existingIdx);
          } else {
            const available = [];
            for (let i = 0; i < count; i++) {
              if (!used.has(i)) available.push(i);
            }
            const chosen = available.length > 0
              ? (slotOrder === 0 ? 0 : available[Math.floor(Math.random() * available.length)])
              : slotOrder % count;
            next[slotId] = chosen;
            used.add(chosen);
          }
        } else {
          // Not enough data: preserve valid index or fallback to circular slot order
          if (typeof existingIdx === 'number' && existingIdx < count) {
            next[slotId] = existingIdx;
          } else {
            next[slotId] = slotOrder % count;
          }
        }
      });

      return next;
    });
  }, [poolKey, slotIdsKey, validPool.length]);

  // Advance a specific banner slot to the next item
  const nextItem = useCallback((slotId) => {
    setSlotIndices(prev => {
      const count = validPool.length;
      if (count <= 1) return prev;

      const currentIdx = prev[slotId] ?? 0;
      const hasEnough = count >= (slotIds || []).length;

      // When there is not enough data, simply cycle to the next Firebase item
      if (!hasEnough) {
        return { ...prev, [slotId]: (currentIdx + 1) % count };
      }

      // When there are enough items, enforce strict uniqueness across all banners
      const claimedByOthers = new Set();
      Object.entries(prev).forEach(([sId, idx]) => {
        if (sId !== slotId) claimedByOthers.add(idx);
      });

      const available = [];
      for (let i = 0; i < count; i++) {
        if (!claimedByOthers.has(i) && i !== currentIdx) {
          available.push(i);
        }
      }

      if (available.length > 0) {
        const nextInOrder = available.find(i => i > currentIdx) ?? available[0];
        return { ...prev, [slotId]: nextInOrder };
      }

      // Circular fallback if tightly bounded
      const nextState = { ...prev };
      const otherSlots = (slotIds || []).filter(s => s !== slotId);
      if (otherSlots.length > 0) {
        const targetSlot = otherSlots[0];
        const targetIdx = prev[targetSlot] ?? 0;
        nextState[slotId] = targetIdx;
        nextState[targetSlot] = currentIdx;
      }
      return nextState;
    });
  }, [validPool.length, slotIds]);

  // Move a specific banner slot to the previous item
  const prevItem = useCallback((slotId) => {
    setSlotIndices(prev => {
      const count = validPool.length;
      if (count <= 1) return prev;

      const currentIdx = prev[slotId] ?? 0;
      const hasEnough = count >= (slotIds || []).length;

      if (!hasEnough) {
        return { ...prev, [slotId]: (currentIdx - 1 + count) % count };
      }

      const claimedByOthers = new Set();
      Object.entries(prev).forEach(([sId, idx]) => {
        if (sId !== slotId) claimedByOthers.add(idx);
      });

      const available = [];
      for (let i = 0; i < count; i++) {
        if (!claimedByOthers.has(i) && i !== currentIdx) {
          available.push(i);
        }
      }

      if (available.length > 0) {
        const prevInOrder = [...available].reverse().find(i => i < currentIdx) ?? available[available.length - 1];
        return { ...prev, [slotId]: prevInOrder };
      }

      const nextState = { ...prev };
      const otherSlots = (slotIds || []).filter(s => s !== slotId);
      if (otherSlots.length > 0) {
        const targetSlot = otherSlots[otherSlots.length - 1];
        const targetIdx = prev[targetSlot] ?? 0;
        nextState[slotId] = targetIdx;
        nextState[targetSlot] = currentIdx;
      }
      return nextState;
    });
  }, [validPool.length, slotIds]);

  // Direct selection of an item index (e.g. dot click)
  const selectIndex = useCallback((slotId, targetIdx) => {
    setSlotIndices(prev => {
      const count = validPool.length;
      if (targetIdx < 0 || targetIdx >= count) return prev;

      const currentIdx = prev[slotId];
      if (currentIdx === targetIdx) return prev;

      const hasEnough = count >= (slotIds || []).length;
      const nextState = { ...prev };

      if (hasEnough) {
        // Swap if another slot currently displays targetIdx
        const collisionSlot = Object.entries(prev).find(([sId, idx]) => sId !== slotId && idx === targetIdx);
        if (collisionSlot) {
          nextState[collisionSlot[0]] = currentIdx;
        }
      }

      nextState[slotId] = targetIdx;
      return nextState;
    });
  }, [validPool.length, slotIds]);

  // Build slot accessors
  const slots = useMemo(() => {
    const result = {};
    (slotIds || []).forEach(slotId => {
      const idx = slotIndices[slotId] ?? 0;
      const activeItem = validPool[idx] || validPool[0] || null;
      result[slotId] = {
        activeItem,
        activeIndex: idx,
        totalCount: validPool.length,
        pool: validPool,
        onNext: () => nextItem(slotId),
        onPrev: () => prevItem(slotId),
        onSelectIndex: (targetIdx) => selectIndex(slotId, targetIdx)
      };
    });
    return result;
  }, [slotIds, slotIndices, validPool, nextItem, prevItem, selectIndex]);

  return slots;
}

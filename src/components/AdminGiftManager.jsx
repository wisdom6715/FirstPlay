import React, { useState, useEffect, useCallback } from 'react';
import { rewardService } from '../services/rewardService';
import { 
  Gift, 
  Disc, 
  Ticket, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Copy, 
  Trophy, 
  ShieldCheck,
  Lock,
  Tag,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboardUtils';

export default function AdminGiftManager({ 
  onShowToast, 
  activeSubTab = 'categories', 
  hideTopNav = true,
  onGiftsCountChange 
}) {
  const [internalSubTab, setInternalSubTab] = useState(activeSubTab || 'categories');
  const subTab = activeSubTab || internalSubTab;

  useEffect(() => {
    if (activeSubTab) {
      setInternalSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  // ==========================================
  // 1. Gift Categories State
  // ==========================================
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    unit: 'MB',
    description: ''
  });
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  // ==========================================
  // 2. Wheel Gift (Gifts Collection) State
  // ==========================================
  const [currentGift, setCurrentGift] = useState(null);
  const [allGifts, setAllGifts] = useState([]);
  const [isLoadingGift, setIsLoadingGift] = useState(true);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState(null);
  const [isSavingGift, setIsSavingGift] = useState(false);
  const [isDeletingGift, setIsDeletingGift] = useState(false);

  // Modal form for creating/editing the active wheel gift
  const [giftForm, setGiftForm] = useState({
    gift_name: '',
    category_id: '',
    category_name: '',
    unit: 'MB',
    description: '',
    network: '',
    // 5 customizable outcomes for indices 1 through 5 (index 0 is locked at 0)
    outcome2: 100,
    outcome3: 250,
    outcome4: 500,
    outcome5: 1024,
    outcome6: 2048
  });

  // ==========================================
  // 3. Redemptions Log State
  // ==========================================
  const [redemptionsList, setRedemptionsList] = useState([]);
  const [isLoadingRedemptions, setIsLoadingRedemptions] = useState(false);
  const [redemptionCategoryFilter, setRedemptionCategoryFilter] = useState('all');
  const [redemptionStatusFilter, setRedemptionStatusFilter] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);

  // ==========================================
  // Loaders
  // ==========================================

  // Load Categories
  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const res = await rewardService.getGiftCategories();
      if (res?.success && Array.isArray(res.categories)) {
        setCategoriesList(res.categories);
      }
    } catch (err) {
      console.error('[AdminGiftManager] Error loading categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Load Active Gift from 'gifts'
  const loadGifts = useCallback(async () => {
    setIsLoadingGift(true);
    try {
      const res = await rewardService.getAdminGifts();
      if (res?.success && Array.isArray(res.gifts)) {
        setAllGifts(res.gifts);
        // Current active gift is either res.currentGift or first active in list
        const active = res.currentGift || res.gifts.find((g) => g.is_active !== false) || null;
        setCurrentGift(active);
        if (onGiftsCountChange) {
          onGiftsCountChange(res.gifts.length);
        }
      } else {
        setCurrentGift(null);
      }
    } catch (err) {
      console.error('[AdminGiftManager] Error loading gifts:', err);
      setCurrentGift(null);
    } finally {
      setIsLoadingGift(false);
    }
  }, [onGiftsCountChange]);

  // Load Redemptions Log
  const loadRedemptions = useCallback(async () => {
    setIsLoadingRedemptions(true);
    try {
      const res = await rewardService.getAdminRedemptions({
        category: redemptionCategoryFilter,
        status: redemptionStatusFilter,
        limit: 100
      });
      if (res?.success && Array.isArray(res.redemptions)) {
        setRedemptionsList(res.redemptions);
      }
    } catch (err) {
      console.error('[AdminGiftManager] Error loading redemptions:', err);
    } finally {
      setIsLoadingRedemptions(false);
    }
  }, [redemptionCategoryFilter, redemptionStatusFilter]);

  // Initial load
  useEffect(() => {
    loadCategories();
    loadGifts();
  }, [loadCategories, loadGifts]);

  useEffect(() => {
    if (subTab === 'redemptions') {
      loadRedemptions();
    }
  }, [subTab, loadRedemptions]);

  // ==========================================
  // Category Actions
  // ==========================================
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name || '',
        unit: cat.unit || 'MB',
        description: cat.description || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        unit: 'MB',
        description: ''
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!categoryForm.name.trim()) {
      onShowToast?.('Category name is required', 'error');
      return;
    }

    setIsSavingCategory(true);
    try {
      const payload = {
        id: editingCategory ? editingCategory.id : undefined,
        name: categoryForm.name.trim(),
        unit: categoryForm.unit.trim() || 'MB',
        description: categoryForm.description.trim()
      };
      const res = await rewardService.createOrUpdateGiftCategory(payload);
      if (res?.success) {
        onShowToast?.(res.message || 'Gift category saved successfully!', 'success');
        setIsCategoryModalOpen(false);
        loadCategories();
      } else {
        onShowToast?.(res?.error || 'Failed to save category', 'error');
      }
    } catch (err) {
      onShowToast?.('Network error saving category', 'error');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }
    setDeletingCategoryId(cat.id);
    try {
      const res = await rewardService.deleteGiftCategory(cat.id);
      if (res?.success) {
        setCategoriesList((prev) => prev.filter((c) => c.id !== cat.id));
        onShowToast?.(`Category "${cat.name}" deleted.`, 'info');
      } else {
        onShowToast?.(res?.error || 'Failed to delete category', 'error');
      }
    } catch (err) {
      onShowToast?.('Failed to delete category', 'error');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  // ==========================================
  // Wheel Gift Actions
  // ==========================================
  const handleOpenGiftModal = (gift = null) => {
    if (gift) {
      setEditingGift(gift);
      const outcomes = Array.isArray(gift.outcomes) ? gift.outcomes : [0, 100, 250, 500, 1024, 2048];
      setGiftForm({
        gift_name: gift.gift_name || gift.name || '',
        category_id: gift.category_id || '',
        category_name: gift.category_name || gift.gift_type || '',
        unit: gift.unit || 'MB',
        description: gift.description || '',
        network: gift.network || '',
        outcome2: outcomes[1] !== undefined ? outcomes[1] : 100,
        outcome3: outcomes[2] !== undefined ? outcomes[2] : 250,
        outcome4: outcomes[3] !== undefined ? outcomes[3] : 500,
        outcome5: outcomes[4] !== undefined ? outcomes[4] : 1024,
        outcome6: outcomes[5] !== undefined ? outcomes[5] : 2048
      });
    } else {
      setEditingGift(null);
      // Auto-select first available category if exists
      const firstCat = categoriesList[0];
      setGiftForm({
        gift_name: firstCat ? `${firstCat.name} Wheel` : 'Daily Mobile Data',
        category_id: firstCat ? firstCat.id : '',
        category_name: firstCat ? firstCat.name : 'Mobile Data',
        unit: firstCat ? (firstCat.unit || 'MB') : 'MB',
        description: 'Standard rewards wheel outcomes',
        network: '',
        outcome2: 100,
        outcome3: 250,
        outcome4: 500,
        outcome5: 1024,
        outcome6: 2048
      });
    }
    setIsGiftModalOpen(true);
  };

  const handleCategorySelectionChange = (categoryId) => {
    const selected = categoriesList.find((c) => c.id === categoryId);
    if (selected) {
      setGiftForm((prev) => ({
        ...prev,
        category_id: selected.id,
        category_name: selected.name,
        unit: selected.unit || 'MB',
        gift_name: prev.gift_name || `${selected.name} Wheel`
      }));
    }
  };

  const handleSaveGift = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!giftForm.gift_name.trim()) {
      onShowToast?.('Gift name is required', 'error');
      return;
    }

    setIsSavingGift(true);
    try {
      // Invariant: Outcome 1 is ALWAYS 0 (win nothing)
      const cleanOutcomes = [
        0,
        Number(giftForm.outcome2) || 0,
        Number(giftForm.outcome3) || 0,
        Number(giftForm.outcome4) || 0,
        Number(giftForm.outcome5) || 0,
        Number(giftForm.outcome6) || 0
      ];

      const payload = {
        gift_id: editingGift ? editingGift.id : undefined,
        gift_name: giftForm.gift_name.trim(),
        category_id: giftForm.category_id || null,
        category_name: giftForm.category_name || 'Gift',
        gift_type: (giftForm.category_name || 'data').toLowerCase().trim(),
        unit: (giftForm.unit || 'MB').trim(),
        description: (giftForm.description || '').trim(),
        network: giftForm.network ? giftForm.network.trim() : null,
        outcomes: cleanOutcomes,
        is_active: true
      };

      const res = await rewardService.createOrUpdateAdminGift(payload);
      if (res?.success) {
        onShowToast?.('Wheel gift published live to Firebase!', 'success');
        setIsGiftModalOpen(false);
        loadGifts();
      } else {
        onShowToast?.(res?.error || 'Failed to save gift', 'error');
      }
    } catch (err) {
      onShowToast?.('Error saving gift', 'error');
    } finally {
      setIsSavingGift(false);
    }
  };

  const handleDeleteGift = async (gift) => {
    if (!window.confirm(`Are you sure you want to delete "${gift.gift_name || gift.name}"? This will remove it from the spinner wheel.`)) {
      return;
    }

    setIsDeletingGift(true);
    try {
      const res = await rewardService.deleteAdminGift(gift.id);
      if (res?.success) {
        onShowToast?.('Gift deleted. The spinner wheel has been reset to zeros.', 'info');
        setCurrentGift(null);
        loadGifts();
      } else {
        onShowToast?.(res?.error || 'Failed to delete gift', 'error');
      }
    } catch (err) {
      onShowToast?.('Error deleting gift', 'error');
    } finally {
      setIsDeletingGift(false);
    }
  };

  const handleCopyCode = async (code) => {
    if (!code) return;
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Optional Top Nav Pills (if not controlled by Left Sidebar) */}
      {!hideTopNav && (
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
            <button
              type="button"
              onClick={() => setInternalSubTab('categories')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                subTab === 'categories'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Tag size={14} className={subTab === 'categories' ? 'text-[#0071e3]' : 'text-zinc-400'} />
              <span>Gift Categories ({categoriesList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setInternalSubTab('wheel')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                subTab === 'wheel'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Disc size={14} className={subTab === 'wheel' ? 'text-[#0071e3]' : 'text-zinc-400'} />
              <span>Wheel Gift</span>
            </button>

            <button
              type="button"
              onClick={() => setInternalSubTab('redemptions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                subTab === 'redemptions'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Ticket size={14} className={subTab === 'redemptions' ? 'text-[#0071e3]' : 'text-zinc-400'} />
              <span>Redemption Logs</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 1: GIFT CATEGORIES (COLLECTION: gift_categories)
          ========================================================================= */}
      {subTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
                <Tag size={18} className="text-[#0071e3]" />
                <span>Gift Categories</span>
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                Create and manage the types of gifts available in FirstPlay (e.g. Mobile Data, Airtime, Child Gift Card, Netflix Subscription).
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenCategoryModal()}
              className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Gift Category</span>
            </button>
          </div>

          {isLoadingCategories ? (
            <div className="p-10 rounded-2xl bg-white border border-zinc-200 text-center shadow-xs">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-[#0071e3] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Loading gift categories...</p>
            </div>
          ) : categoriesList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-zinc-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071e3] flex items-center justify-center mx-auto">
                <Tag size={24} />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">No Gift Categories Created Yet</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                You can create categories like <strong>Mobile Data</strong>, <strong>Airtime</strong>, <strong>Gift Card</strong>, or <strong>Netflix Subscription</strong>.
              </p>
              <button
                type="button"
                onClick={() => handleOpenCategoryModal()}
                className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer mt-2"
              >
                <Plus size={14} />
                <span>Create First Category</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriesList.map((cat) => (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0071e3] text-[11px] font-black border border-blue-200/80 uppercase">
                        Unit: {cat.unit || 'MB'}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {cat.slug || cat.id.slice(0, 8)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                      {cat.name}
                    </h3>

                    {cat.description && (
                      <p className="text-xs text-zinc-500 line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <span className="text-[10px] text-zinc-400">
                      {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : 'Active'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
                        title="Edit Category"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        disabled={deletingCategoryId === cat.id}
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                        title="Delete Category"
                      >
                        {deletingCategoryId === cat.id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: WHEEL GIFT (COLLECTION: gifts)
          Only 1 active gift configured at a time.
          If none configured -> Displays ONE BIG ADD CARD with plus icon.
          If configured -> Displays configured gift card with Edit & Delete actions.
          ========================================================================= */}
      {subTab === 'wheel' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
                <Disc size={18} className="text-[#0071e3]" />
                <span>Wheel Gift Configuration</span>
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                The active gift configured here populates the player spinner wheel. Segment 1 is permanently locked at 0 (Win Nothing / Try Again).
              </p>
            </div>
          </div>

          {isLoadingGift ? (
            <div className="p-12 rounded-2xl bg-white border border-zinc-200 text-center shadow-xs">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-[#0071e3] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Checking active wheel gift...</p>
            </div>
          ) : !currentGift ? (
            /* =============================================================
               ONE BIG ADD GIFT CARD
               User specification: "Only display one big ad. Ad icon like add card. 
               Then when I click on it, it will not be bring a modal. Then I will now add create a gift."
               ============================================================= */
            <div className="max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => handleOpenGiftModal()}
                className="w-full p-10 sm:p-14 rounded-3xl border-2 border-dashed border-zinc-300 hover:border-[#0071e3] bg-white hover:bg-blue-50/30 transition-all duration-200 cursor-pointer text-center group flex flex-col items-center justify-center space-y-4 shadow-xs"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-[#0071e3] text-[#0071e3] group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-sm">
                  <Plus size={32} className="stroke-[2.5]" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 group-hover:text-[#0071e3] transition-colors">
                    Add Spinner Gift
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    Click here to select a gift category and configure the 5 reward quantities for the 6-segment wheel.
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 group-hover:bg-[#0071e3]/10 text-zinc-700 group-hover:text-[#0071e3] text-xs font-bold transition">
                  <Plus size={13} />
                  <span>Configure New Gift</span>
                </span>
              </button>
            </div>
          ) : (
            /* =============================================================
               CURRENT CONFIGURED GIFT CARD
               With visual representation of all 6 outcomes, Edit & Delete
               ============================================================= */
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-sm space-y-6">
              {/* Header Row */}
              <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-zinc-100">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live on Spinner</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0071e3] border border-blue-200 text-[10px] font-bold uppercase">
                      Category: {currentGift.category_name || currentGift.gift_type}
                    </span>
                    {currentGift.unit && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-mono font-bold">
                        {currentGift.unit}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                    {currentGift.gift_name || currentGift.name}
                  </h3>
                  {currentGift.description && (
                    <p className="text-xs text-zinc-500">{currentGift.description}</p>
                  )}
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenGiftModal(currentGift)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil size={13} />
                    <span>Edit Gift</span>
                  </button>

                  <button
                    type="button"
                    disabled={isDeletingGift}
                    onClick={() => handleDeleteGift(currentGift)}
                    className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isDeletingGift ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* 6 Segment Outcomes Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">
                    6-Segment Wheel Outcomes
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Segment #1 is locked at 0
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Segment 1: Fixed Zero */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1 relative">
                    <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-black flex items-center justify-center mx-auto">
                      1
                    </span>
                    <div className="text-base font-black text-zinc-900 flex items-center justify-center gap-1">
                      <span>0</span>
                      <span className="text-[11px] text-zinc-500 font-bold">{currentGift.unit || 'MB'}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-zinc-600 block uppercase">
                      Win Nothing
                    </span>
                  </div>

                  {/* Segments 2 through 6 */}
                  {(currentGift.outcomes || [0, 100, 250, 500, 1024, 2048]).slice(1, 6).map((val, idx) => (
                    <div 
                      key={idx + 2}
                      className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-center space-y-1"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white text-[10px] font-black flex items-center justify-center mx-auto shadow-xs">
                        {idx + 2}
                      </span>
                      <div className="text-base font-black text-[#0071e3] flex items-center justify-center gap-1">
                        <span>{val}</span>
                        <span className="text-[11px] text-blue-700 font-bold">{currentGift.unit || 'MB'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-600 block uppercase">
                        Segment #{idx + 2}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: REDEMPTIONS LOG (COLLECTION: redemptions)
          ========================================================================= */}
      {subTab === 'redemptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
                <Ticket size={18} className="text-[#0071e3]" />
                <span>Redemption Audit Log</span>
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                Every generated redemption code with 24-hour expiration and consumption tracking.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={redemptionCategoryFilter}
                onChange={(e) => setRedemptionCategoryFilter(e.target.value)}
                className="h-8 px-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-700 outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="gift">Gift Rewards</option>
                <option value="tournament">Tournament Cash</option>
              </select>

              <select
                value={redemptionStatusFilter}
                onChange={(e) => setRedemptionStatusFilter(e.target.value)}
                className="h-8 px-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-700 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="expired">Expired</option>
              </select>

              <button
                type="button"
                onClick={loadRedemptions}
                disabled={isLoadingRedemptions}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition cursor-pointer"
                title="Refresh Redemptions"
              >
                <RefreshCw size={13} className={isLoadingRedemptions ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {isLoadingRedemptions ? (
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-[#0071e3] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Loading redemption logs...</p>
            </div>
          ) : redemptionsList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-2">
              <Ticket size={32} className="mx-auto text-zinc-300" />
              <p className="text-sm font-bold text-zinc-800">No Redemptions Logged</p>
              <p className="text-xs text-zinc-500">When users win and claim rewards, redemption records will appear here.</p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Reward Amount</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {redemptionsList.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                          <button
                            type="button"
                            onClick={() => handleCopyCode(r.redemption_code)}
                            className="inline-flex items-center gap-1.5 hover:text-[#0071e3] transition cursor-pointer"
                          >
                            <span>{r.redemption_code}</span>
                            {copiedCode === r.redemption_code ? (
                              <Check size={11} className="text-emerald-500" />
                            ) : (
                              <Copy size={11} className="text-zinc-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            r.category === 'tournament'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {r.category || 'gift'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-zinc-900">
                          {r.category === 'tournament' 
                            ? `₦${Number(r.amount || 0).toLocaleString()}` 
                            : `${r.quantity || 0} ${r.unit || 'MB'}`}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 truncate max-w-[120px]">
                          {r.user_name || r.user_id || 'Player'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            r.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : r.status === 'expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {r.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                          {r.expires_at ? new Date(r.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '24h'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: CREATE / EDIT GIFT CATEGORY
          ========================================================================= */}
      {isCategoryModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingCategory) {
              setIsCategoryModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-5 text-zinc-900 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center">
                  <Tag size={16} />
                </div>
                <h3 className="text-base font-extrabold text-zinc-900">
                  {editingCategory ? 'Edit Gift Category' : 'Create Gift Category'}
                </h3>
              </div>
              <button
                type="button"
                disabled={isSavingCategory}
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Mobile Data, Airtime, Netflix Subscription"
                  className="w-full h-10 px-3.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900 bg-white outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                  Reward Unit
                </label>
                <input
                  type="text"
                  value={categoryForm.unit}
                  onChange={(e) => setCategoryForm({ ...categoryForm, unit: e.target.value })}
                  placeholder="e.g. MB, GB, NGN, Month, USD"
                  className="w-full h-10 px-3.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900 bg-white outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                  Description <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Short description of this reward type..."
                  className="w-full p-3 rounded-xl border border-zinc-300 text-xs font-medium text-zinc-900 bg-white outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSavingCategory}
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSavingCategory ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} className="stroke-[3]" />
                      <span>Save Category</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: CREATE / EDIT WHEEL GIFT
          Allows selecting category and entering the 5 outcomes (outcome 1 locked at 0)
          ========================================================================= */}
      {isGiftModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingGift) {
              setIsGiftModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-5 text-zinc-900 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center">
                  <Disc size={16} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">
                    {editingGift ? 'Edit Wheel Gift' : 'Configure Wheel Gift'}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Defines the 6 spin wheel outcomes for players
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSavingGift}
                onClick={() => setIsGiftModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveGift} className="space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                  Select Gift Category <span className="text-red-500">*</span>
                </label>
                {categoriesList.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                    <p className="font-bold">No gift categories created yet.</p>
                    <p>Please create a gift category first (e.g. Mobile Data or Airtime) to attach this gift.</p>
                  </div>
                ) : (
                  <select
                    value={giftForm.category_id}
                    onChange={(e) => handleCategorySelectionChange(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900 bg-white outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs cursor-pointer"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.unit || 'MB'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Gift Title & Unit in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                    Gift Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={giftForm.gift_name}
                    onChange={(e) => setGiftForm({ ...giftForm, gift_name: e.target.value })}
                    placeholder="e.g. Mobile Data Rewards"
                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900 bg-white outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={giftForm.unit}
                    onChange={(e) => setGiftForm({ ...giftForm, unit: e.target.value })}
                    placeholder="MB, GB, NGN"
                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900 bg-white outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                  />
                </div>
              </div>

              {/* Network restriction (optional) */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                  Network Restriction <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={giftForm.network}
                  onChange={(e) => setGiftForm({ ...giftForm, network: e.target.value })}
                  placeholder="e.g. MTN, Airtel, Glo (leave empty for All Networks)"
                  className="w-full h-10 px-3.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900 bg-white outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                />
              </div>

              {/* =============================================================
                  THE 6 WHEEL OUTCOMES SECTION
                  Outcome 1 is permanently locked at 0.
                  Outcomes 2 through 6 are entered by the admin.
                  ============================================================= */}
              <div className="pt-2 border-t border-zinc-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-zinc-900">
                    Wheel Outcomes (6 Segments)
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    Segment #1 is locked at 0
                  </span>
                </div>

                {/* Outcome 1: Locked Zero */}
                <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-300 text-zinc-700 text-[10px] font-black flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs font-bold text-zinc-700">
                      Segment #1 (Locked: Win Nothing)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-200 text-zinc-700 text-xs font-mono font-bold">
                    <Lock size={12} className="text-zinc-500" />
                    <span>0 {giftForm.unit || 'MB'}</span>
                  </div>
                </div>

                {/* Outcomes 2 to 6: Inputs */}
                <div className="space-y-2">
                  {[
                    { key: 'outcome2', seg: 2, placeholder: '100' },
                    { key: 'outcome3', seg: 3, placeholder: '250' },
                    { key: 'outcome4', seg: 4, placeholder: '500' },
                    { key: 'outcome5', seg: 5, placeholder: '1024' },
                    { key: 'outcome6', seg: 6, placeholder: '2048' }
                  ].map(({ key, seg, placeholder }) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0071e3] text-[10px] font-black flex items-center justify-center shrink-0">
                        {seg}
                      </span>
                      <label className="text-xs font-bold text-zinc-600 shrink-0 w-24">
                        Segment #{seg}:
                      </label>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="0"
                          value={giftForm[key]}
                          onChange={(e) => setGiftForm({ ...giftForm, [key]: Number(e.target.value) })}
                          placeholder={placeholder}
                          className="w-full h-9 pl-3.5 pr-14 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900 bg-white outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-500 pointer-events-none">
                          {giftForm.unit || 'MB'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSavingGift}
                  onClick={() => setIsGiftModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingGift || categoriesList.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSavingGift ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving Gift...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} className="stroke-[3]" />
                      <span>Publish to Spinner</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

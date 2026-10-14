import React, { useState, useEffect, useCallback } from 'react';
import { rewardService } from '../services/rewardService';
import { 
  Gift, 
  Disc, 
  Ticket, 
  Plus, 
  Pencil, 
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
  RotateCcw
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboardUtils';

const DEFAULT_ZERO_SEGMENTS = [
  { id: 'seg_1', amount: 0, amountLabel: '0 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#0f172a', textColor: '#ffffff' },
  { id: 'seg_2', amount: 0, amountLabel: '0 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#0066ff', textColor: '#ffffff' },
  { id: 'seg_3', amount: 0, amountLabel: '0 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#ffffff', textColor: '#0a0a0f' },
  { id: 'seg_4', amount: 0, amountLabel: '0 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#0f172a', textColor: '#ffffff' },
  { id: 'seg_5', amount: 0, amountLabel: '0 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#0066ff', textColor: '#ffffff' },
  { id: 'seg_6', amount: 0, amountLabel: '0 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#ffffff', textColor: '#0a0a0f' }
];

export default function AdminGiftManager({ onShowToast }) {
  const [subTab, setSubTab] = useState('wheel'); // 'wheel' | 'gifts' | 'redemptions'

  // ==========================================
  // 1. Wheel Config State
  // ==========================================
  const [wheelSegments, setWheelSegments] = useState(DEFAULT_ZERO_SEGMENTS);
  const [isWheelLoading, setIsWheelLoading] = useState(true);
  const [isSavingWheel, setIsSavingWheel] = useState(false);

  // ==========================================
  // 2. Gifts Collection State
  // ==========================================
  const [giftsList, setGiftsList] = useState([]);
  const [isLoadingGifts, setIsLoadingGifts] = useState(true);
  const [giftTypeFilter, setGiftTypeFilter] = useState('all');
  const [giftStatusFilter, setGiftStatusFilter] = useState('all');
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState(null);
  const [giftForm, setGiftForm] = useState({
    gift_name: '',
    gift_type: 'data',
    description: '',
    quantity: 500,
    unit: 'MB',
    network: '',
    is_active: true
  });
  const [isSavingGift, setIsSavingGift] = useState(false);

  // ==========================================
  // 3. Redemptions Log State
  // ==========================================
  const [redemptionsList, setRedemptionsList] = useState([]);
  const [isLoadingRedemptions, setIsLoadingRedemptions] = useState(false);
  const [redemptionCategoryFilter, setRedemptionCategoryFilter] = useState('all');
  const [redemptionStatusFilter, setRedemptionStatusFilter] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);

  // Load Wheel Configuration
  const loadWheelConfig = useCallback(async () => {
    setIsWheelLoading(true);
    try {
      const res = await rewardService.getWheelConfig();
      if (res?.segments && Array.isArray(res.segments) && res.segments.length === 6) {
        setWheelSegments(res.segments);
      }
    } catch (err) {
      console.error('[AdminGiftManager] Error loading wheel config:', err);
    } finally {
      setIsWheelLoading(false);
    }
  }, []);

  // Load Gifts Collection
  const loadGifts = useCallback(async () => {
    setIsLoadingGifts(true);
    try {
      const res = await rewardService.getAdminGifts({
        type: giftTypeFilter,
        status: giftStatusFilter
      });
      if (res?.success && Array.isArray(res.gifts)) {
        setGiftsList(res.gifts);
      }
    } catch (err) {
      console.error('[AdminGiftManager] Error loading gifts:', err);
    } finally {
      setIsLoadingGifts(false);
    }
  }, [giftTypeFilter, giftStatusFilter]);

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

  useEffect(() => {
    loadWheelConfig();
    loadGifts();
  }, [loadWheelConfig, loadGifts]);

  useEffect(() => {
    if (subTab === 'redemptions') {
      loadRedemptions();
    }
  }, [subTab, loadRedemptions]);

  // Handle Wheel Segment input changes
  const handleSegmentChange = (index, field, value) => {
    setWheelSegments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-update amountLabel if amount or unit is edited
      if (field === 'amount' || field === 'unit') {
        const amt = field === 'amount' ? value : updated[index].amount;
        const un = field === 'unit' ? value : updated[index].unit;
        updated[index].amountLabel = `${amt} ${un || 'MB'}`;
      }
      return updated;
    });
  };

  // Save 6 Wheel Segments
  const handleSaveWheel = async () => {
    setIsSavingWheel(true);
    try {
      const res = await rewardService.saveWheelConfig(wheelSegments);
      if (res?.success) {
        onShowToast?.('Wheel configuration updated live in Firebase!', 'success');
      } else {
        onShowToast?.(res?.error || 'Failed to save wheel configuration', 'error');
      }
    } catch (err) {
      onShowToast?.('Network error saving wheel config', 'error');
    } finally {
      setIsSavingWheel(false);
    }
  };

  // Reset Wheel to Zero Outcomes per PRD Section 3
  const handleResetToZero = () => {
    setWheelSegments(DEFAULT_ZERO_SEGMENTS);
    onShowToast?.('Reset outcomes to 6 zeros. Click Save to publish.', 'info');
  };

  // Open Create/Edit Gift Modal
  const handleOpenGiftModal = (gift = null) => {
    if (gift) {
      setEditingGift(gift);
      setGiftForm({
        gift_name: gift.gift_name || '',
        gift_type: gift.gift_type || 'data',
        description: gift.description || '',
        quantity: gift.quantity || 0,
        unit: gift.unit || 'MB',
        network: gift.network || '',
        is_active: gift.is_active !== false
      });
    } else {
      setEditingGift(null);
      setGiftForm({
        gift_name: '',
        gift_type: 'data',
        description: '',
        quantity: 500,
        unit: 'MB',
        network: '',
        is_active: true
      });
    }
    setIsGiftModalOpen(true);
  };

  // Save Gift (Create or Edit)
  const handleSaveGift = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!giftForm.gift_name.trim()) {
      onShowToast?.('Gift name is required', 'error');
      return;
    }

    setIsSavingGift(true);
    try {
      const payload = {
        ...giftForm,
        gift_id: editingGift ? editingGift.id : undefined
      };
      const res = await rewardService.createOrUpdateAdminGift(payload);
      if (res?.success) {
        onShowToast?.(res.message || 'Gift saved successfully', 'success');
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

  // Soft Toggle Activate/Deactivate
  const handleToggleGiftStatus = async (gift) => {
    const nextState = !gift.is_active;
    try {
      const res = await rewardService.toggleAdminGift(gift.id, nextState);
      if (res?.success) {
        setGiftsList((prev) =>
          prev.map((g) => (g.id === gift.id ? { ...g, is_active: nextState } : g))
        );
        onShowToast?.(
          `Gift "${gift.gift_name}" is now ${nextState ? 'ACTIVE' : 'DEACTIVATED'}.`,
          nextState ? 'success' : 'info'
        );
      }
    } catch (err) {
      onShowToast?.('Failed to toggle gift status', 'error');
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
      
      {/* Sub-navigation Pills */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
          <button
            type="button"
            onClick={() => setSubTab('wheel')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              subTab === 'wheel'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Disc size={14} className={subTab === 'wheel' ? 'text-[#0071e3]' : 'text-zinc-400'} />
            <span>6-Segment Wheel</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('gifts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              subTab === 'gifts'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Gift size={14} className={subTab === 'gifts' ? 'text-[#0071e3]' : 'text-zinc-400'} />
            <span>Gifts Catalog ({giftsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('redemptions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              subTab === 'redemptions'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Ticket size={14} className={subTab === 'redemptions' ? 'text-[#0071e3]' : 'text-zinc-400'} />
            <span>Redemptions Log</span>
          </button>
        </div>

        {subTab === 'gifts' && (
          <button
            type="button"
            onClick={() => handleOpenGiftModal()}
            className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Create New Gift</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          TAB 1: 6-SEGMENT SPIN WHEEL CONFIGURATION
          ========================================================================= */}
      {subTab === 'wheel' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-black text-zinc-900 tracking-tight">
                Authoritative 6-Segment Wheel Outcomes
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                The spin outcomes configured here are returned to the client and authoritatively awarded in Firebase. Default is 6 zero outcomes per PRD Section 3.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetToZero}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-bold text-zinc-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset to 6 Zeros</span>
              </button>

              <button
                type="button"
                onClick={handleSaveWheel}
                disabled={isSavingWheel}
                className="px-4 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingWheel ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} className="stroke-[3]" />
                    <span>Save Wheel Outcomes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 6 Segment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wheelSegments.map((seg, idx) => (
              <div
                key={seg.id || `seg-${idx}`}
                className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0071e3] text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-black text-zinc-900">
                      Segment #{idx + 1} (60°)
                    </span>
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full border border-zinc-300"
                    style={{ backgroundColor: seg.color || '#0066ff' }}
                    title="Segment background preview"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                      Quantity (Value)
                    </label>
                    <input
                      type="number"
                      value={seg.amount}
                      onChange={(e) => handleSegmentChange(idx, 'amount', Number(e.target.value))}
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-900 outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={seg.unit || 'MB'}
                      onChange={(e) => handleSegmentChange(idx, 'unit', e.target.value)}
                      placeholder="MB, GB, NGN"
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-900 outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                      Display Label
                    </label>
                    <input
                      type="text"
                      value={seg.amountLabel || `${seg.amount} ${seg.unit || 'MB'}`}
                      onChange={(e) => handleSegmentChange(idx, 'amountLabel', e.target.value)}
                      placeholder="e.g. 500 MB"
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-900 outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                      Sub-Label
                    </label>
                    <input
                      type="text"
                      value={seg.subLabel || 'Data'}
                      onChange={(e) => handleSegmentChange(idx, 'subLabel', e.target.value)}
                      placeholder="e.g. Data, Jackpot"
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-900 outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-100">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                      Slice Color
                    </label>
                    <input
                      type="text"
                      value={seg.color || '#0066ff'}
                      onChange={(e) => handleSegmentChange(idx, 'color', e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-xs font-mono text-zinc-800 outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                      Text Color
                    </label>
                    <input
                      type="text"
                      value={seg.textColor || '#ffffff'}
                      onChange={(e) => handleSegmentChange(idx, 'textColor', e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-xs font-mono text-zinc-800 outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GIFTS CATALOG (COLLECTION: gifts)
          ========================================================================= */}
      {subTab === 'gifts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-black text-zinc-900 tracking-tight">
                Configurable Rewards Inventory
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                Manage all rewards in the <code>gifts</code> collection. Deactivating a gift preserves existing redemptions per PRD Section 2.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={giftTypeFilter}
                onChange={(e) => setGiftTypeFilter(e.target.value)}
                className="h-8 px-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-700 outline-none cursor-pointer"
              >
                <option value="all">All Gift Types</option>
                <option value="data">Data</option>
                <option value="airtime">Airtime</option>
                <option value="gift_card">Gift Card</option>
                <option value="other">Other</option>
              </select>

              <select
                value={giftStatusFilter}
                onChange={(e) => setGiftStatusFilter(e.target.value)}
                className="h-8 px-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-700 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {isLoadingGifts ? (
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-[#0071e3] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Loading gifts inventory...</p>
            </div>
          ) : giftsList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-2">
              <Gift size={32} className="mx-auto text-zinc-300" />
              <p className="text-sm font-bold text-zinc-800">No Gifts Found</p>
              <p className="text-xs text-zinc-500">Click "Create New Gift" to add your first reward.</p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Gift Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Reward Value</th>
                    <th className="py-3 px-4">Network</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {giftsList.map((gift) => (
                    <tr key={gift.id} className="hover:bg-zinc-50/70 transition">
                      <td className="py-3 px-4 font-bold text-zinc-900">
                        {gift.gift_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase border border-blue-200">
                          {gift.gift_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-800">
                        {gift.quantity} {gift.unit || 'MB'}
                      </td>
                      <td className="py-3 px-4 text-zinc-600">
                        {gift.network || 'All Networks'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleGiftStatus(gift)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                            gift.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                          }`}
                        >
                          {gift.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenGiftModal(gift)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-[11px] transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: REDEMPTIONS LOG (COLLECTION: redemptions)
          ========================================================================= */}
      {subTab === 'redemptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-black text-zinc-900 tracking-tight">
                Redemption Audit Log
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
                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-bold text-zinc-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw size={12} className={isLoadingRedemptions ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {isLoadingRedemptions ? (
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-[#0071e3] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Loading redemptions log...</p>
            </div>
          ) : redemptionsList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-2">
              <Ticket size={32} className="mx-auto text-zinc-300" />
              <p className="text-sm font-bold text-zinc-800">No Redemptions Recorded</p>
              <p className="text-xs text-zinc-500">Codes generated from user spins will appear here.</p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Reward Details</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4">Expires In / At</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {redemptionsList.map((rec) => {
                    const isCompleted = rec.status === 'completed' || rec.is_used === true;
                    const expiresAt = rec.expires_at ? new Date(rec.expires_at) : null;
                    const isExpired = expiresAt && Date.now() > expiresAt.getTime() && !isCompleted;

                    return (
                      <tr key={rec.id} className="hover:bg-zinc-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-zinc-900">
                            <span>{rec.redemption_code}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(rec.redemption_code)}
                              className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                              title="Copy code"
                            >
                              {copiedCode === rec.redemption_code ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rec.category === 'tournament'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {rec.category || 'gift'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-zinc-800">
                          {rec.category === 'tournament'
                            ? `₦${(rec.amount || 0).toLocaleString()} ${rec.currency || 'NGN'}`
                            : `${rec.quantity || 0} ${rec.unit || 'MB'} ${rec.gift_name || ''}`}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 font-mono text-[11px]">
                          {rec.user_name || rec.user_id || 'Anonymous'}
                        </td>
                        <td className="py-3 px-4 text-zinc-500 text-[11px]">
                          {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-zinc-500 text-[11px]">
                          {expiresAt ? (
                            <span className={isExpired ? 'text-red-500 font-bold' : ''}>
                              {isExpired ? 'Expired' : expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : '24 Hours'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isExpired
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {isCompleted ? 'Completed' : isExpired ? 'Expired' : rec.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE / EDIT GIFT
          ========================================================================= */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-base font-black text-zinc-900 tracking-tight">
                {editingGift ? 'Edit Gift Reward' : 'Create New Gift Reward'}
              </h3>
              <button
                type="button"
                onClick={() => setIsGiftModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGift} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[11px] font-bold text-zinc-600 uppercase block mb-1">
                  Gift Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={giftForm.gift_name}
                  onChange={(e) => setGiftForm({ ...giftForm, gift_name: e.target.value })}
                  placeholder="e.g. MTN 1 GB High-Speed Data"
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-900 outline-none focus:border-[#0071e3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 uppercase block mb-1">
                    Gift Type *
                  </label>
                  <select
                    value={giftForm.gift_type}
                    onChange={(e) => setGiftForm({ ...giftForm, gift_type: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-900 outline-none focus:border-[#0071e3] bg-white cursor-pointer"
                  >
                    <option value="data">Data Bundle</option>
                    <option value="airtime">Airtime</option>
                    <option value="gift_card">Gift Card</option>
                    <option value="other">Other Reward</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 uppercase block mb-1">
                    Network Restriction (Optional)
                  </label>
                  <input
                    type="text"
                    value={giftForm.network}
                    onChange={(e) => setGiftForm({ ...giftForm, network: e.target.value })}
                    placeholder="MTN, Airtel, Glo, 9mobile"
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-900 outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 uppercase block mb-1">
                    Reward Quantity (Value) *
                  </label>
                  <input
                    type="number"
                    required
                    value={giftForm.quantity}
                    onChange={(e) => setGiftForm({ ...giftForm, quantity: Number(e.target.value) })}
                    placeholder="e.g. 1000"
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-900 outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 uppercase block mb-1">
                    Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={giftForm.unit}
                    onChange={(e) => setGiftForm({ ...giftForm, unit: e.target.value })}
                    placeholder="MB, GB, NGN, USD"
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-900 outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 uppercase block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={giftForm.description}
                  onChange={(e) => setGiftForm({ ...giftForm, description: e.target.value })}
                  placeholder="Optional details or terms..."
                  className="w-full p-3 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-900 outline-none focus:border-[#0071e3] resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="gift-active-checkbox"
                  checked={giftForm.is_active}
                  onChange={(e) => setGiftForm({ ...giftForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="gift-active-checkbox" className="text-xs font-bold text-zinc-700 cursor-pointer">
                  Activate this gift (available for new spins)
                </label>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsGiftModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:text-zinc-900 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingGift}
                  className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingGift ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingGift ? 'Save Changes' : 'Create Gift'}</span>
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

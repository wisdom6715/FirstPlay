import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Sparkles, 
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
  ExternalLink, 
  Image as ImageIcon,
  Upload,
  Eye,
  Search,
  Tag,
  Gamepad2,
  Package,
  Layers,
  ArrowRight,
  Power
} from 'lucide-react';
import { promotionService, PRIMARY_PROMOTION_COLLECTION } from '../services/promotionService';
import { uploadPromotionAsset } from '../services/firebaseConfig';

const PRESET_BADGES = [
  'SPECIAL PROMOTION',
  'FEATURED GAME',
  'SPONSORED',
  'TRENDING NOW',
  'NEW ARRIVAL',
  'EXCLUSIVE'
];

export default function AdminPromotionManager({ 
  allGames = [], 
  onShowToast 
}) {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'disabled' | 'product' | 'game'
  const [actionInProgressId, setActionInProgressId] = useState(null);

  // View Modal State
  const [viewingPromo, setViewingPromo] = useState(null);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null); // null when creating new
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    badge_text: 'SPECIAL PROMOTION',
    category: 'game',
    target_url: '',
    banner_url: '',
    active: true,
    open_in_app: true,
    game_id: ''
  });

  // Delete Confirmation State
  const [deletingPromo, setDeletingPromo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load promotions from Firebase
  const loadPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await promotionService.getPromotions();
      setPromotions(items);
    } catch (err) {
      console.error('[AdminPromotionManager] Load error:', err);
      onShowToast?.('Failed to load promotions: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPromo(null);
    setBannerFile(null);
    setBannerPreview('');
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      badge_text: 'SPECIAL PROMOTION',
      category: 'game',
      target_url: '',
      banner_url: '',
      active: true,
      open_in_app: true,
      game_id: ''
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (promo) => {
    setEditingPromo(promo);
    setBannerFile(null);
    setBannerPreview(promo.banner_url || promo.image_url || '');
    setFormData({
      title: promo.title || '',
      subtitle: promo.subtitle || '',
      description: promo.description || '',
      badge_text: promo.badge_text || 'SPECIAL PROMOTION',
      category: promo.category || 'game',
      target_url: promo.target_url || '',
      banner_url: promo.banner_url || promo.image_url || '',
      active: promo.active !== false,
      open_in_app: promo.open_in_app !== false,
      game_id: promo.game_id || ''
    });
    setIsModalOpen(true);
  };

  // Handle Game Auto-fill Selection
  const handleSelectGame = (gameId) => {
    if (!gameId) {
      setFormData(prev => ({ ...prev, game_id: '' }));
      return;
    }
    const selected = allGames.find(g => (g.game_id || g.id) === gameId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        game_id: gameId,
        title: prev.title || selected.name || '',
        subtitle: prev.subtitle || selected.tagline || selected.description?.slice(0, 80) || '',
        target_url: prev.target_url || selected.url || `/game/${selected.id || selected.game_id}`,
        banner_url: prev.banner_url || selected.banner_url || selected.logo_url || '',
        category: 'game'
      }));
      if (!bannerPreview && (selected.banner_url || selected.logo_url)) {
        setBannerPreview(selected.banner_url || selected.logo_url);
      }
    }
  };

  // Handle Banner File Change
  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onShowToast?.('Banner image exceeds 5MB limit', 'error');
        return;
      }
      setBannerFile(file);
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  // Save Promotion (Create or Update)
  const handleSavePromotion = async (e) => {
    e?.preventDefault();

    if (!formData.title.trim()) {
      onShowToast?.('Promotion title is required', 'error');
      return;
    }

    if (!bannerFile && !formData.banner_url.trim()) {
      onShowToast?.('Please upload a banner image or provide an image URL', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Preparing promotion...');

    try {
      let finalBannerUrl = formData.banner_url.trim();

      // Upload banner file if selected
      if (bannerFile) {
        setUploadProgress('Uploading banner to Firebase Storage...');
        finalBannerUrl = await uploadPromotionAsset(bannerFile, 'banners');
      }

      const payload = {
        ...formData,
        banner_url: finalBannerUrl,
        image_url: finalBannerUrl
      };

      if (editingPromo) {
        setUploadProgress('Updating promotion in Firestore...');
        await promotionService.updatePromotion(
          editingPromo.id, 
          payload, 
          editingPromo._collection || PRIMARY_PROMOTION_COLLECTION
        );
        onShowToast?.(`Promotion "${formData.title}" updated successfully!`, 'success');
      } else {
        setUploadProgress('Publishing new promotion to Firestore...');
        await promotionService.createPromotion(payload, PRIMARY_PROMOTION_COLLECTION);
        onShowToast?.(`Promotion "${formData.title}" created successfully!`, 'success');
      }

      setIsModalOpen(false);
      await loadPromotions();
    } catch (err) {
      console.error('[AdminPromotionManager] Save error:', err);
      onShowToast?.(err.message || 'Failed to save promotion', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  // Toggle on/off
  const handleToggleActive = async (promo) => {
    const nextState = !promo.active;
    setActionInProgressId(promo.id);

    // Optimistic UI update
    setPromotions(prev => prev.map(p => 
      p.id === promo.id ? { ...p, active: nextState } : p
    ));

    try {
      await promotionService.togglePromotionActive(
        promo.id, 
        nextState, 
        promo._collection || PRIMARY_PROMOTION_COLLECTION
      );
      onShowToast?.(`Promotion "${promo.title}" is now ${nextState ? 'Active (Live)' : 'Disabled'}`, 'success');
    } catch (err) {
      console.error('[AdminPromotionManager] Toggle error:', err);
      // Revert on error
      setPromotions(prev => prev.map(p => 
        p.id === promo.id ? { ...p, active: !nextState } : p
      ));
      onShowToast?.('Failed to toggle promotion: ' + err.message, 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Confirm and Delete Promotion
  const handleDeletePromotion = async () => {
    if (!deletingPromo) return;
    setIsDeleting(true);

    try {
      await promotionService.deletePromotion(
        deletingPromo.id, 
        deletingPromo._collection || PRIMARY_PROMOTION_COLLECTION
      );
      onShowToast?.(`Promotion "${deletingPromo.title}" deleted permanently.`, 'success');
      setDeletingPromo(null);
      await loadPromotions();
    } catch (err) {
      console.error('[AdminPromotionManager] Delete error:', err);
      onShowToast?.('Failed to delete promotion: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredPromotions = useMemo(() => {
    return promotions.filter(item => {
      // Status filter
      if (statusFilter === 'active' && !item.active) return false;
      if (statusFilter === 'disabled' && item.active) return false;
      if (statusFilter === 'product' && item.category !== 'product') return false;
      if (statusFilter === 'game' && item.category !== 'game') return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const title = (item.title || '').toLowerCase();
        const subtitle = (item.subtitle || '').toLowerCase();
        const badge = (item.badge_text || '').toLowerCase();
        const url = (item.target_url || '').toLowerCase();
        return title.includes(query) || subtitle.includes(query) || badge.includes(query) || url.includes(query);
      }

      return true;
    });
  }, [promotions, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center font-bold">
                <Sparkles size={18} />
              </div>
              <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                Promotions &amp; Banners
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {promotions.length} Total
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Manage hero carousel banners, promotional spotlights, and sponsor product campaigns from <code className="text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded font-mono text-[11px]">{PRIMARY_PROMOTION_COLLECTION}</code>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadPromotions}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="Refresh promotions list"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-98"
            >
              <Plus size={15} />
              <span>New Promotion</span>
            </button>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search promotions by title, badge, or link..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-800 placeholder-zinc-400 focus:bg-white focus:border-[#0071e3] focus:outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              All ({promotions.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Active ({promotions.filter(p => p.active).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('disabled')}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'disabled'
                  ? 'bg-zinc-700 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Disabled ({promotions.filter(p => !p.active).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('game')}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'game'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Games
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('product')}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'product'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Products
            </button>
          </div>
        </div>
      </div>

      {/* Promotions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-200/80 p-4 space-y-3 animate-pulse">
              <div className="w-full h-40 bg-zinc-100 rounded-xl" />
              <div className="h-4 bg-zinc-100 rounded w-2/3" />
              <div className="h-3 bg-zinc-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-zinc-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <h3 className="text-sm font-bold text-zinc-800">No promotions found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No promotions matching "${searchQuery}". Try clearing your search filter.`
              : 'There are currently no banners in promotional_banners. Click "+ New Promotion" to add your first featured spotlight.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-[#0071e3] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Create First Promotion</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPromotions.map((promo) => (
            <div 
              key={promo.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
                promo.active 
                  ? 'border-zinc-200/90 hover:border-zinc-300 shadow-xs hover:shadow-md' 
                  : 'border-zinc-200/50 bg-zinc-50/50 opacity-75'
              }`}
            >
              {/* Card Image Banner */}
              <div>
                <div className="relative w-full aspect-[21/9] sm:aspect-[16/8] bg-zinc-900 overflow-hidden">
                  {promo.banner_url ? (
                    <img
                      src={promo.banner_url}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-1 bg-zinc-800">
                      <ImageIcon size={28} />
                      <span className="text-[10px] font-semibold">No Image Provided</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {promo.badge_text || 'PROMOTION'}
                    </span>

                    {/* Active Status Pill */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide flex items-center gap-1 shadow-xs ${
                      promo.active 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-zinc-700/80 backdrop-blur-md text-zinc-300 border border-white/10'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${promo.active ? 'bg-white' : 'bg-zinc-400'}`} />
                      <span>{promo.active ? 'Live' : 'Off'}</span>
                    </span>
                  </div>

                  {/* Bottom Image Title */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h3 className="font-extrabold text-sm leading-tight drop-shadow-md truncate">
                      {promo.title}
                    </h3>
                    {promo.subtitle && (
                      <p className="text-[11px] text-zinc-300 line-clamp-1 drop-shadow-xs font-medium">
                        {promo.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      {promo.category === 'product' ? <Package size={13} className="text-purple-500" /> : <Gamepad2 size={13} className="text-blue-500" />}
                      <span className="capitalize font-semibold text-zinc-700">{promo.category || 'Game'}</span>
                    </span>

                    <span className="text-[11px] text-zinc-400 font-mono">
                      {promo._collection || PRIMARY_PROMOTION_COLLECTION}
                    </span>
                  </div>

                  {promo.target_url && (
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 truncate bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                      <ExternalLink size={12} className="text-zinc-400 shrink-0" />
                      <a 
                        href={promo.target_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="truncate hover:text-[#0071e3] font-mono hover:underline"
                        title={promo.target_url}
                      >
                        {promo.target_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-2">
                {/* On/Off Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(promo)}
                  disabled={actionInProgressId === promo.id}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                    promo.active 
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                      : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 border border-zinc-300'
                  }`}
                  title={promo.active ? 'Click to deactivate' : 'Click to activate'}
                >
                  <Power size={12} className={actionInProgressId === promo.id ? 'animate-spin' : ''} />
                  <span>{promo.active ? 'Active' : 'Disabled'}</span>
                </button>

                {/* View, Edit, Delete Button Group */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingPromo(promo)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 transition cursor-pointer"
                    title="View preview"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(promo)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Edit promotion"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingPromo(promo)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete promotion"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          VIEW PROMOTION PREVIEW MODAL
          ========================================================================= */}
      {viewingPromo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 select-text"
          onClick={() => setViewingPromo(null)}
        >
          <div 
            className="relative w-full max-w-2xl rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner */}
            <div className="relative aspect-[21/9] bg-zinc-950 overflow-hidden">
              {viewingPromo.banner_url ? (
                <img 
                  src={viewingPromo.banner_url} 
                  alt={viewingPromo.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                  <ImageIcon size={40} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              
              <button
                type="button"
                onClick={() => setViewingPromo(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/20 mb-1 inline-block">
                  {viewingPromo.badge_text || 'PROMOTION'}
                </span>
                <h2 className="text-xl font-extrabold tracking-tight">
                  {viewingPromo.title}
                </h2>
                {viewingPromo.subtitle && (
                  <p className="text-xs text-zinc-300 font-medium">
                    {viewingPromo.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Body Details */}
            <div className="p-5 space-y-4 text-xs">
              {viewingPromo.description && (
                <div className="space-y-1">
                  <h4 className="font-bold text-zinc-700 uppercase tracking-wider text-[10px]">Description</h4>
                  <p className="text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    {viewingPromo.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Status</span>
                  <p className={`font-bold ${viewingPromo.active ? 'text-emerald-600' : 'text-zinc-500'}`}>
                    {viewingPromo.active ? 'Active (Live)' : 'Disabled'}
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Category</span>
                  <p className="font-bold text-zinc-800 capitalize">
                    {viewingPromo.category || 'Game'}
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Collection</span>
                  <p className="font-mono font-semibold text-zinc-800">
                    {viewingPromo._collection || PRIMARY_PROMOTION_COLLECTION}
                  </p>
                </div>
              </div>

              {viewingPromo.target_url && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Destination URL</span>
                  <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-100 font-mono text-[11px] text-zinc-700">
                    <span className="truncate">{viewingPromo.target_url}</span>
                    <a
                      href={viewingPromo.target_url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-[#0071e3] hover:underline flex items-center gap-1 shrink-0 font-sans font-bold"
                    >
                      <span>Test Link</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const p = viewingPromo;
                  setViewingPromo(null);
                  handleOpenEdit(p);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-black transition flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil size={13} />
                <span>Edit Promotion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE / EDIT PROMOTION MODAL
          ========================================================================= */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 select-text overflow-y-auto"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-xl my-8 rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-zinc-900 text-sm">
                    {editingPromo ? 'Edit Promotion' : 'Create New Promotion'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    Saving to <code className="font-mono text-zinc-700 bg-zinc-200/60 px-1 py-0.2 rounded">{editingPromo?._collection || PRIMARY_PROMOTION_COLLECTION}</code>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
                className="w-7 h-7 rounded-full bg-zinc-200/60 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePromotion} className="p-6 space-y-4 text-xs">
              
              {/* Optional: Auto-fill from Catalog Game */}
              {!editingPromo && allGames.length > 0 && (
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-1">
                  <label className="font-bold text-blue-900 text-[11px] flex items-center gap-1">
                    <Gamepad2 size={13} />
                    <span>Quick Autofill from Catalog Game (Optional)</span>
                  </label>
                  <select
                    value={formData.game_id}
                    onChange={(e) => handleSelectGame(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-zinc-800 text-xs focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value="">-- Or enter promotion details manually --</option>
                    {allGames.map(g => (
                      <option key={g.id || g.game_id} value={g.id || g.game_id}>
                        {g.name} ({g.category || 'Game'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">
                    Promotion Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Lagos Life: Street Empire"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-800 text-xs focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Badge Label</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={formData.badge_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, badge_text: e.target.value }))}
                      placeholder="SPECIAL PROMOTION"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-800 text-xs uppercase focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Badge Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-zinc-400">Presets:</span>
                {PRESET_BADGES.map(badge => (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, badge_text: badge }))}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      formData.badge_text === badge 
                        ? 'bg-[#0071e3] text-white' 
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>

              {/* Subtitle / Tagline */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-700">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Experience authentic Nigerian urban gameplay right in your browser"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-800 text-xs focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              {/* Target Link & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">
                    Target URL (Where clicks navigate) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.target_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                    placeholder="e.g. https://firstplay.fun/game/lagos-life"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-800 text-xs font-mono focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-800 text-xs focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value="game">Game Spotlight</option>
                    <option value="product">Product / Sponsor Item</option>
                    <option value="app">Web Application</option>
                    <option value="promotional">General Announcement</option>
                  </select>
                </div>
              </div>

              {/* Banner Image Upload & Preview */}
              <div className="space-y-2 pt-1">
                <label className="font-bold text-zinc-700 flex items-center justify-between">
                  <span>Banner Image (16:9 or 21:9 Recommended) <span className="text-rose-500">*</span></span>
                  {bannerPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview('');
                        setFormData(prev => ({ ...prev, banner_url: '' }));
                      }}
                      className="text-rose-600 hover:underline text-[11px] font-normal"
                    >
                      Clear image
                    </button>
                  )}
                </label>

                {/* Live Preview Box */}
                {bannerPreview ? (
                  <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-950">
                    <img 
                      src={bannerPreview} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 text-white">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-white/20 border border-white/20">
                        {formData.badge_text || 'PROMOTION'}
                      </span>
                      <h4 className="font-extrabold text-xs truncate mt-0.5">
                        {formData.title || 'Promotion Title Preview'}
                      </h4>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-zinc-300 rounded-xl p-4 text-center bg-zinc-50 space-y-2">
                    <ImageIcon size={28} className="mx-auto text-zinc-400" />
                    <p className="text-xs text-zinc-500">
                      Upload an image file or enter a direct image URL below
                    </p>
                  </div>
                )}

                {/* Upload File Input */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition">
                    <Upload size={14} />
                    <span>{bannerFile ? bannerFile.name : 'Choose Banner Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Direct Image URL input */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Or Direct Image URL</span>
                  <input
                    type="url"
                    value={formData.banner_url}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, banner_url: e.target.value }));
                      if (!bannerFile) setBannerPreview(e.target.value);
                    }}
                    placeholder="https://.../banner.jpg"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-800 text-xs font-mono focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              {/* Toggles: Active & Open In App */}
              <div className="pt-2 border-t border-zinc-100 grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="rounded text-[#0071e3] focus:ring-[#0071e3]"
                  />
                  <div>
                    <span className="font-bold text-zinc-800 text-xs block">Active (Live)</span>
                    <span className="text-[10px] text-zinc-500">Show in banner carousels</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.open_in_app}
                    onChange={(e) => setFormData(prev => ({ ...prev, open_in_app: e.target.checked }))}
                    className="rounded text-[#0071e3] focus:ring-[#0071e3]"
                  />
                  <div>
                    <span className="font-bold text-zinc-800 text-xs block">Open In App</span>
                    <span className="text-[10px] text-zinc-500">Launch inside FirstPlay player</span>
                  </div>
                </label>
              </div>

              {/* Upload Progress Status */}
              {uploadProgress && (
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs flex items-center gap-2 animate-pulse">
                  <RefreshCw size={13} className="animate-spin shrink-0" />
                  <span>{uploadProgress}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingPromo ? 'Save Changes' : 'Create Promotion'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION DIALOG
          ========================================================================= */}
      {deletingPromo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 select-text"
          onClick={() => !isDeleting && setDeletingPromo(null)}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 size={20} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-zinc-900 tracking-tight">
                Delete Promotion?
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-zinc-800">"{deletingPromo.title}"</strong> from <code className="font-mono text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded text-[11px]">{deletingPromo._collection || PRIMARY_PROMOTION_COLLECTION}</code>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPromo(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeletePromotion}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, uploadPromotionAsset } from '../services/firebaseConfig';
import { catalogService } from '../services/catalogService';
import { emailService } from '../services/emailService';
import { 
  Shield, 
  LogOut, 
  ExternalLink, 
  Check, 
  X, 
  Trash2, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  EyeOff,
  Gamepad2,
  Layers,
  ArrowLeft,
  Pencil,
  Upload,
  Image as ImageIcon,
  FileText,
  Globe,
  Mail,
  Gift
} from 'lucide-react';
import appLogo from '../assets/icon.png';
import AdminGiftManager from '../components/AdminGiftManager';

export default function AdminDashboardView({ onNavigateAuth, onNavigateHome }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [adminTab, setAdminTab] = useState('catalog');
  const [underReviewList, setUnderReviewList] = useState([]);
  const [allGamesList, setAllGamesList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'game',
    creator: '',
    email: '',
    url: '',
    tagline: '',
    description: '',
    logo_url: '',
    banner_url: '',
    open_in_app: true,
    active: true
  });
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSaveStep, setEditSaveStep] = useState('');
  const [editError, setEditError] = useState(null);

  // Authentication Guard: Ensure user is signed in, authorized in Firestore, AND MFA verified
  useEffect(() => {
    if (!auth) {
      onNavigateAuth?.();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        sessionStorage.removeItem('firstplay_admin_mfa_verified');
        sessionStorage.removeItem('firstplay_admin_email');
        onNavigateAuth?.();
      } else {
        const check = await catalogService.verifyAdminUser(user);
        if (!check.isAuthorized) {
          console.warn('[Admin Guard] User not authorized in Firestore admins table:', user.email);
          sessionStorage.removeItem('firstplay_admin_mfa_verified');
          sessionStorage.removeItem('firstplay_admin_email');
          await signOut(auth);
          onNavigateAuth?.();
          return;
        }

        // Verify that the current browser session completed the 6-digit MFA step
        const isMfaVerified = sessionStorage.getItem('firstplay_admin_mfa_verified') === 'true';
        if (!isMfaVerified) {
          console.warn('[Admin Guard] MFA verification required for this session.');
          onNavigateAuth?.();
          return;
        }

        setCurrentUser(user);
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, [onNavigateAuth]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load both under_review collection and all apps
  const loadDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [underReview, allApps] = await Promise.all([
        catalogService.getAdminUnderReviewGames(),
        catalogService.getAdminAllGames()
      ]);
      setUnderReviewList(underReview);
      setAllGamesList(allApps);
    } catch (err) {
      console.error('[Admin Dashboard] Error loading data:', err);
      showToast('Error refreshing database records', 'error');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser, loadDashboardData]);

  const handleSignOut = async () => {
    sessionStorage.removeItem('firstplay_admin_mfa_verified');
    sessionStorage.removeItem('firstplay_admin_email');
    if (auth) {
      await signOut(auth);
    }
    onNavigateAuth?.();
  };

  // Toggle game on/off switch
  const handleToggleGame = async (game) => {
    const nextState = !game.active;
    setActionInProgress(game.id);
    try {
      await catalogService.toggleGameActive(game.id, nextState);
      setAllGamesList((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, active: nextState, status: nextState ? 'active' : 'disabled' } : g))
      );
      showToast(
        `"${game.name}" is now ${nextState ? 'LIVE on the site' : 'HIDDEN from the site'}.`,
        nextState ? 'success' : 'info'
      );
    } catch (err) {
      console.error('Error toggling game:', err);
      showToast('Failed to update game visibility.', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Approve a game under review
  const handleApprove = async (submission) => {
    if (!window.confirm(`Approve "${submission.title || submission.name}" and publish live to FirstPlay?`)) {
      return;
    }
    setActionInProgress(submission.id);
    try {
      const targetEmail = submission.email || submission.publisher_email;
      await catalogService.approveUnderReviewGame(submission);
      showToast(`Approved "${submission.title || submission.name}"! Now live on the site.`);

      // Send Approval Notification Email to publisher
      if (targetEmail) {
        try {
          await emailService.sendApprovedEmail({
            to: targetEmail,
            gameTitle: submission.title || submission.name,
            studioName: submission.creator || submission.studioName || 'Independent Studio',
            gameUrl: submission.url,
            gameId: submission.id
          });
          console.info(`[AdminDashboard] Approval notification email sent to ${targetEmail}`);
        } catch (mailErr) {
          console.warn('[AdminDashboard] Could not send approval email notice:', mailErr);
        }
      }

      await loadDashboardData();
    } catch (err) {
      console.error('Error approving submission:', err);
      showToast('Failed to approve submission.', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Reject a game under review
  const handleReject = async (submission) => {
    if (!window.confirm(`Reject and delete submission for "${submission.title || submission.name}"?`)) {
      return;
    }
    setActionInProgress(submission.id);
    try {
      const targetEmail = submission.email || submission.publisher_email;
      await catalogService.rejectUnderReviewGame(submission.id);
      showToast(`Rejected and removed "${submission.title || submission.name}".`, 'info');

      // Send Rejection Notice Email to publisher
      if (targetEmail) {
        try {
          await emailService.sendRejectedEmail({
            to: targetEmail,
            gameTitle: submission.title || submission.name,
            studioName: submission.creator || submission.studioName || 'Independent Studio',
            gameUrl: submission.url
          });
          console.info(`[AdminDashboard] Rejection notice email sent to ${targetEmail}`);
        } catch (mailErr) {
          console.warn('[AdminDashboard] Could not send rejection email notice:', mailErr);
        }
      }

      await loadDashboardData();
    } catch (err) {
      console.error('Error rejecting submission:', err);
      showToast('Failed to reject submission.', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Delete a game from apps
  const handleDeleteGame = async (game) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${game.name}" from Firebase? This cannot be undone.`)) {
      return;
    }
    setActionInProgress(game.id);
    try {
      await catalogService.deleteGame(game.id);
      setAllGamesList((prev) => prev.filter((g) => g.id !== game.id));
      showToast(`Deleted "${game.name}" from database.`, 'info');
    } catch (err) {
      console.error('Error deleting game:', err);
      showToast('Failed to delete game.', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Open Edit Modal for a game or submission
  const handleOpenEditModal = (item, isUnderReview = false) => {
    setEditingItem({ ...item, isUnderReview });
    setEditForm({
      name: item.name || item.title || '',
      category: item.category || 'game',
      creator: item.creator || item.full_name || '',
      email: item.email || item.publisher_email || '',
      url: item.url || '',
      tagline: item.tagline || '',
      description: item.description || '',
      logo_url: item.logo_url || item.logo || '',
      banner_url: item.banner_url || item.flyer || item.banner || '',
      open_in_app: item.open_in_app !== undefined ? Boolean(item.open_in_app) : true,
      active: item.active !== undefined ? Boolean(item.active) : true
    });
    setLogoFile(null);
    setBannerFile(null);
    setLogoPreview(item.logo_url || item.logo || '');
    setBannerPreview(item.banner_url || item.flyer || item.banner || '');
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (isSavingEdit) return;
    setIsEditModalOpen(false);
    setEditingItem(null);
    setLogoFile(null);
    setBannerFile(null);
    setLogoPreview('');
    setBannerPreview('');
    setEditError(null);
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = () => setBannerPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Save changes to Firestore and upload new assets if selected
  const handleSaveEdit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingItem) return;
    setEditError(null);

    if (!editForm.name.trim()) {
      setEditError('Game/App name is required.');
      return;
    }
    if (!editForm.url.trim()) {
      setEditError('Launch URL is required.');
      return;
    }

    setIsSavingEdit(true);
    try {
      let finalLogoUrl = editForm.logo_url;
      let finalBannerUrl = editForm.banner_url;

      // 1. Upload new icon if selected
      if (logoFile) {
        setEditSaveStep('Optimizing & uploading new icon...');
        finalLogoUrl = await uploadPromotionAsset(logoFile, 'logos');
      }

      // 2. Upload new banner if selected
      if (bannerFile) {
        setEditSaveStep('Optimizing & uploading new banner...');
        finalBannerUrl = await uploadPromotionAsset(bannerFile, 'banners');
      }

      setEditSaveStep('Saving updates to Firebase...');
      const payload = {
        ...editForm,
        name: editForm.name.trim(),
        title: editForm.name.trim(),
        url: editForm.url.trim(),
        creator: editForm.creator.trim(),
        email: (editForm.email || '').trim().toLowerCase(),
        publisher_email: (editForm.email || '').trim().toLowerCase(),
        tagline: editForm.tagline.trim(),
        description: editForm.description.trim(),
        logo_url: finalLogoUrl,
        banner_url: finalBannerUrl
      };

      if (editingItem.isUnderReview) {
        await catalogService.updateUnderReviewDetails(editingItem.id, payload);
        setUnderReviewList((prev) =>
          prev.map((item) => (item.id === editingItem.id ? { ...item, ...payload } : item))
        );
        showToast(`Updated "${payload.name}" submission details!`);
      } else {
        await catalogService.updateGameDetails(editingItem.id, payload);
        setAllGamesList((prev) =>
          prev.map((item) =>
            item.id === editingItem.id ? { ...item, ...payload, active: payload.active } : item
          )
        );
        showToast(`Updated "${payload.name}" details! Live changes synced.`);
      }

      // Send Game Details Updated Notification Email to publisher
      const targetEmail = payload.email || editingItem.email || editingItem.publisher_email;
      if (targetEmail) {
        try {
          await emailService.sendUpdatedEmail({
            to: targetEmail,
            gameTitle: payload.name,
            studioName: payload.creator || 'Independent Studio',
            gameUrl: payload.url,
            category: payload.category || 'game',
            isUnderReview: Boolean(editingItem.isUnderReview)
          });
          console.info(`[AdminDashboard] Update notice email sent to ${targetEmail}`);
        } catch (mailErr) {
          console.warn('[AdminDashboard] Email update notice warning:', mailErr);
        }
      }

      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error('[Admin] Error saving game edits:', err);
      setEditError(err.message || 'Failed to save updates. Please try again.');
    } finally {
      setIsSavingEdit(false);
      setEditSaveStep('');
    }
  };

  if (authChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f7] text-zinc-900">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-[#0071e3] rounded-full animate-spin" />
      </div>
    );
  }

  const filteredGames = allGamesList.filter((g) =>
    (g.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.creator || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = allGamesList.filter((g) => g.active).length;
  const disabledCount = allGamesList.length - activeCount;

  return (
    <div className="h-screen w-full bg-[#f5f5f7] text-[#1d1d1f] flex flex-col font-sans select-none overflow-y-auto overflow-x-hidden pb-20">
      {/* Top Admin Header Bar */}
      <header className="h-16 w-full bg-white/95 backdrop-blur-xl border-b border-zinc-200/90 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateHome}
            title="Return to Public Site"
            className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <img 
              src={appLogo?.src || '/icon.png'} 
              alt="FirstPlay" 
              className="w-8 h-8 rounded-xl object-contain border border-zinc-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider text-zinc-900">FIRSTPLAY</span>
                <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-[#0071e3] text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                  ADMIN
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 block -mt-0.5 font-medium">Control & Moderation Console</span>
            </div>
          </div>
        </div>

        {/* Right Section: User & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={isLoadingData}
            title="Refresh database records"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-bold text-zinc-700 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoadingData ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-[#0071e3] transition cursor-pointer"
          >
            <ExternalLink size={13} />
            <span>View Public Site</span>
          </button>

          {currentUser?.email && (
            <span className="hidden lg:inline text-xs font-semibold text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
              {currentUser.email}
            </span>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-600 hover:text-red-700 transition cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9 pb-24">
        
        {/* Admin Navigation Pills */}
        <div className="flex items-center gap-2.5 border-b border-zinc-200/90 pb-4 flex-wrap">
          <button
            type="button"
            onClick={() => setAdminTab('catalog')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              adminTab === 'catalog'
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
            }`}
          >
            <Gamepad2 size={15} />
            <span>Game Catalog & Approvals ({underReviewList.length + allGamesList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('rewards')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              adminTab === 'rewards'
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
            }`}
          >
            <Gift size={15} />
            <span>Gifts, Wheel & Redemptions</span>
          </button>
        </div>

        {adminTab === 'rewards' ? (
          <AdminGiftManager onShowToast={showToast} />
        ) : (
          <>
            {/* Metric Badges Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm space-y-1">
            <span className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
              <Clock size={14} className="text-amber-500" />
              <span>Under Review</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              {underReviewList.length}
            </div>
            <span className="text-[11px] text-zinc-500 block font-medium">Pending admin approval</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm space-y-1">
            <span className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Live on Site</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {activeCount}
            </div>
            <span className="text-[11px] text-zinc-500 block font-medium">Visible to players</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm space-y-1">
            <span className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
              <EyeOff size={14} className="text-zinc-400" />
              <span>Hidden / Disabled</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-800">
              {disabledCount}
            </div>
            <span className="text-[11px] text-zinc-500 block font-medium">Toggled OFF</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm space-y-1">
            <span className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
              <Gamepad2 size={14} className="text-[#0071e3]" />
              <span>Total Games</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900">
              {allGamesList.length}
            </div>
            <span className="text-[11px] text-zinc-500 block font-medium">In Firebase catalog</span>
          </div>
        </div>

        {/* =========================================================================
            SECTION 1: UNDER REVIEW SUBMISSIONS (table: under_review)
            ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900">
                  Under Review Submissions ({underReviewList.length})
                </h2>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                New games uploaded via the submission hub. <strong>None of these appear in the app until an admin approves them.</strong>
              </p>
            </div>
          </div>

          {isLoadingData ? (
            <div className="p-10 rounded-2xl bg-white border border-zinc-200 text-center shadow-xs">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-[#0071e3] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Loading pending submissions...</p>
            </div>
          ) : underReviewList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-zinc-200/90 text-center space-y-2 shadow-xs">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
              <p className="text-sm font-bold text-zinc-800">Queue is Clear</p>
              <p className="text-xs text-zinc-500">There are currently no games waiting under review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {underReviewList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border-2 border-amber-300 bg-white p-5 shadow-sm space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={item.logo_url || '/icon.png'}
                      alt={item.title}
                      className="w-14 h-14 rounded-2xl object-cover bg-zinc-100 border border-zinc-200 shrink-0 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider">
                          UNDER REVIEW
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-semibold uppercase">
                          {item.category || 'GAME'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 tracking-tight truncate mt-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-600 truncate">
                        Studio: <strong className="text-zinc-800">{item.creator}</strong>
                      </p>
                      {(item.email || item.publisher_email) && (
                        <p className="text-xs text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="font-mono text-[11px] text-zinc-700">{item.email || item.publisher_email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Banner Preview if uploaded */}
                  {item.banner_url && (
                    <div className="w-full h-28 rounded-xl overflow-hidden border border-zinc-200 relative bg-zinc-100">
                      <img
                        src={item.banner_url}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-semibold text-white">
                        Landscape Banner
                      </span>
                    </div>
                  )}

                  {/* Description / Metadata */}
                  <div className="space-y-1.5 text-xs">
                    {item.tagline && (
                      <p className="text-zinc-700 font-semibold italic text-[11px]">
                        "{item.tagline}"
                      </p>
                    )}
                    <p className="text-zinc-600 line-clamp-2 leading-relaxed text-[11px]">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
                      <span className="font-semibold text-zinc-700">URL:</span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0071e3] hover:underline truncate flex items-center gap-1 font-mono"
                      >
                        <span className="truncate">{item.url}</span>
                        <ExternalLink size={11} className="shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* Approve / Reject / Edit Actions */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={actionInProgress === item.id}
                      onClick={() => handleOpenEditModal(item, true)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Pencil size={12} />
                      <span>Edit Details</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionInProgress === item.id}
                      onClick={() => handleReject(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <X size={13} />
                      <span>Reject & Delete</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionInProgress === item.id}
                      onClick={() => handleApprove(item)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {actionInProgress === item.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} className="stroke-[3]" />
                          <span>Approve & Publish</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================================================================
            SECTION 2: ALL GAMES ON FIREBASE WITH TOGGLE SWITCHES & EDIT
            ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
                <Layers size={18} className="text-[#0071e3]" />
                <span>All Games on Firebase</span>
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                Each game has its own toggle switch. <strong>Turning a game OFF immediately removes it from the website.</strong>
              </p>
            </div>

            {/* Search Box */}
            <div className="w-full sm:w-64 relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games or studio..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
              />
            </div>
          </div>

          {isLoadingData ? (
            <div className="p-10 rounded-2xl bg-white border border-zinc-200 text-center shadow-xs">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-[#0071e3] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Loading catalog games...</p>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center text-xs text-zinc-500 shadow-xs">
              No games found matching "{searchQuery}".
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200/90 bg-white overflow-hidden shadow-sm">
              <div className="divide-y divide-zinc-100">
                {filteredGames.map((game) => {
                  const isBusy = actionInProgress === game.id;
                  const isLive = Boolean(game.active);

                  return (
                    <div
                      key={game.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                        isLive ? 'hover:bg-zinc-50/70' : 'bg-zinc-50/50 opacity-75 hover:opacity-100'
                      }`}
                    >
                      {/* Left: Thumbnail & Info */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <img
                          src={game.logo_url || '/icon.png'}
                          alt={game.name}
                          className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0 shadow-xs"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-zinc-900 tracking-tight truncate">
                              {game.name}
                            </h3>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                              {game.category || 'game'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">
                            {game.creator} • <span className="font-mono text-zinc-400">{game.url}</span>
                            {(game.email || game.publisher_email) && (
                              <span className="text-zinc-500 font-mono text-[11px]"> • {game.email || game.publisher_email}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right: Live Status & Toggle Switch & Actions */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                        {/* Status Label */}
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
                              isLive
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isLive ? 'bg-emerald-500' : 'bg-zinc-400'
                              }`}
                            />
                            <span>{isLive ? 'Live on Site' : 'Hidden'}</span>
                          </span>
                        </div>

                        {/* Interactive Toggle Switch */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isLive}
                            disabled={isBusy}
                            onClick={() => handleToggleGame(game)}
                            title={isLive ? 'Turn OFF (Hide from site)' : 'Turn ON (Show on site)'}
                            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                              isLive ? 'bg-emerald-500' : 'bg-zinc-300'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isLive ? 'translate-x-6' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Edit Game Details Button */}
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleOpenEditModal(game)}
                          title="Edit game details (name, studio, images, URL)"
                          className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0071e3] hover:text-[#0077ed] flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                        >
                          <Pencil size={13} />
                        </button>

                        {/* External launch test */}
                        {game.url && (
                          <a
                            href={game.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Test Launch Game in New Tab"
                            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}

                        {/* Delete game */}
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDeleteGame(game)}
                          title="Delete game from database"
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
          </>
        )}
      </main>

      {/* =========================================================================
          EDIT GAME DETAILS MODAL
          ========================================================================= */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-text"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingEdit) {
              handleCloseEditModal();
            }
          }}
        >
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-zinc-200/90 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-zinc-200/80 bg-zinc-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 text-[#0071e3] border border-blue-200 shadow-xs">
                  <Pencil size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-900">
                      Edit Listing Details
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-zinc-200 text-zinc-800">
                      {editForm.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Update publisher name, game title, URLs, or banner images.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSavingEdit}
                onClick={handleCloseEditModal}
                className="w-8 h-8 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-600 hover:text-zinc-900 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form id="edit-game-form" onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
              {/* Error Banner */}
              {editError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-800">
                    Game / App Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Lagos Life"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-800">
                    Category *
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition cursor-pointer"
                  >
                    <option value="game">Game (HTML5 Web Game)</option>
                    <option value="app">Web Application</option>
                    <option value="product">Digital Product</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-800">
                    Studio / Publisher Name
                  </label>
                  <input
                    type="text"
                    value={editForm.creator}
                    onChange={(e) => setEditForm(prev => ({ ...prev, creator: e.target.value }))}
                    placeholder="e.g. Kola Studios"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-800">
                    Launch / Play URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={editForm.url}
                    onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-800">
                    Publisher Contact Email (For approval & update notifications)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="publisher@domain.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Tagline & Description */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-800">
                    Catchy Tagline (One sentence)
                  </label>
                  <input
                    type="text"
                    value={editForm.tagline}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="e.g. Fast-paced open world Lagos action in your browser."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-800">
                    Detailed Description
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Full gameplay overview or product details..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Media Asset Section */}
              <div className="space-y-4 pt-2 border-t border-zinc-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                  Game Images & Media Assets
                </h4>

                {/* 1. Square Logo / Icon */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800">Game Logo / Square Icon (512x512)</span>
                    <span className="text-[11px] text-zinc-500">PNG, JPG, WebP</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src={logoPreview || '/icon.png'}
                      alt="Logo preview"
                      className="w-16 h-16 rounded-2xl object-cover bg-white border border-zinc-300 shrink-0 shadow-xs"
                    />

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <label className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-xs font-bold text-zinc-800 transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                          <Upload size={13} />
                          <span>Upload New Icon</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileChange}
                            className="hidden"
                          />
                        </label>
                        {logoFile && (
                          <span className="text-xs text-emerald-600 font-semibold truncate">
                            Selected: {logoFile.name}
                          </span>
                        )}
                      </div>

                      {/* Or direct URL fallback */}
                      <input
                        type="url"
                        value={editForm.logo_url}
                        onChange={(e) => {
                          setEditForm(prev => ({ ...prev, logo_url: e.target.value }));
                          setLogoPreview(e.target.value);
                          setLogoFile(null);
                        }}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-700 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Landscape Banner / Flyer */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800">Landscape Hero Banner / Flyer (16:9)</span>
                    <span className="text-[11px] text-zinc-500">Featured across banners</span>
                  </div>

                  <div className="space-y-3">
                    {bannerPreview && (
                      <div className="w-full h-32 rounded-xl overflow-hidden border border-zinc-200 relative bg-zinc-200">
                        <img
                          src={bannerPreview}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-xs font-bold text-zinc-800 transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                        <Upload size={13} />
                        <span>Upload New Banner</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerFileChange}
                          className="hidden"
                        />
                      </label>
                      {bannerFile && (
                        <span className="text-xs text-emerald-600 font-semibold truncate">
                          Selected: {bannerFile.name}
                        </span>
                      )}
                    </div>

                    <input
                      type="url"
                      value={editForm.banner_url}
                      onChange={(e) => {
                        setEditForm(prev => ({ ...prev, banner_url: e.target.value }));
                        setBannerPreview(e.target.value);
                        setBannerFile(null);
                      }}
                      placeholder="Or paste banner image URL (https://...)"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-700 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Behavior & Visibility Settings */}
              <div className="space-y-3 pt-2 border-t border-zinc-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                  Settings & Visibility
                </h4>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">
                      Open in Sandboxed FirstPlay Player
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Enables fullscreen in-app WebView launch instead of navigating away.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editForm.open_in_app}
                    onChange={(e) => setEditForm(prev => ({ ...prev, open_in_app: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#0071e3] cursor-pointer"
                  />
                </div>

                {!editingItem?.isUnderReview && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block">
                        Live on FirstPlay Site
                      </span>
                      <span className="text-[11px] text-zinc-500 block">
                        When enabled, players can discover and play this experience.
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={editForm.active}
                      onClick={() => setEditForm(prev => ({ ...prev, active: !prev.active }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        editForm.active ? 'bg-emerald-500' : 'bg-zinc-300'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          editForm.active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-zinc-500 font-medium">
                {isSavingEdit ? editSaveStep : 'All updates sync to Firebase Firestore.'}
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  form="edit-game-form"
                  disabled={isSavingEdit}
                  className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{editSaveStep || 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} className="stroke-[3]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 select-none ${
            toastMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : toastMessage.type === 'info'
              ? 'bg-zinc-900 border-zinc-800 text-white'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}
    </div>
  );
}

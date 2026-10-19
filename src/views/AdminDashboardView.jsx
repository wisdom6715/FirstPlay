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
  Gift,
  ChevronDown,
  Disc,
  Ticket,
  Menu,
  Tag,
  Trophy,
  Sparkles
} from 'lucide-react';
import appLogo from '../assets/icon.png';
import AdminGiftManager from '../components/AdminGiftManager';
import AdminTournamentManager from '../components/AdminTournamentManager';
import AdminPromotionManager from '../components/AdminPromotionManager';

const PRESET_REJECTION_REASONS = [
  'Launch URL is broken, inaccessible, or returns an HTTP error.',
  'Game does not scale properly or lacks responsive touch controls on mobile devices.',
  'Game experiences severe freezing, infinite loading, or crashes during play.',
  'Suspected copyright, trademark, or intellectual property rights issues with assets.',
  'Inappropriate or offensive content violating FirstPlay community safety guidelines.',
  'Forced third-party account registration or a paywall required before gameplay.'
];

export default function AdminDashboardView({ onNavigateAuth, onNavigateHome }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Navigation State
  const [activeNav, setActiveNav] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('promotions') || path.includes('promotion')) return 'promotions';
      if (path.includes('tournaments') || path.includes('tournament')) return 'tournaments';
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || params.get('nav');
      if (tab && ['catalog', 'wheel', 'gifts', 'categories', 'redemptions', 'tournaments', 'promotions'].includes(tab)) {
        return tab;
      }
    }
    return 'catalog';
  });
  const [isGiftDropdownOpen, setIsGiftDropdownOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [giftsCount, setGiftsCount] = useState(0);

  const [underReviewList, setUnderReviewList] = useState([]);
  const [allGamesList, setAllGamesList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('all'); // 'all' | 'under_review' | 'live' | 'disabled'
  const [toastMessage, setToastMessage] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Rejection Feedback Modal State
  const [rejectingSubmission, setRejectingSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);

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

  // Reject Modal Handlers
  const handleOpenRejectModal = (submission) => {
    setRejectingSubmission(submission);
    setRejectionReason('');
  };

  const handleCloseRejectModal = () => {
    if (isSubmittingRejection) return;
    setRejectingSubmission(null);
    setRejectionReason('');
  };

  const handleConfirmReject = async (e) => {
    e?.preventDefault();
    if (!rejectingSubmission) return;

    const trimmedReason = rejectionReason.trim();
    if (!trimmedReason) {
      showToast('Please provide a reason for the rejection so the developer knows what to fix.', 'error');
      return;
    }

    setIsSubmittingRejection(true);
    setActionInProgress(rejectingSubmission.id);

    try {
      const targetEmail = rejectingSubmission.email || rejectingSubmission.publisher_email;
      const gameTitle = rejectingSubmission.title || rejectingSubmission.name;
      const studioName = rejectingSubmission.creator || rejectingSubmission.studioName || 'Independent Studio';
      const gameUrl = rejectingSubmission.url;

      // 1. Remove from under_review collection in Firestore
      await catalogService.rejectUnderReviewGame(rejectingSubmission.id);

      // 2. Send rejection notice with attached reason to the developer
      if (targetEmail) {
        try {
          await emailService.sendRejectedEmail({
            to: targetEmail,
            gameTitle,
            studioName,
            gameUrl,
            reason: trimmedReason
          });
          console.info(`[AdminDashboard] Rejection notice with reason dispatched to ${targetEmail}`);
        } catch (mailErr) {
          console.warn('[AdminDashboard] Could not send rejection email notice:', mailErr);
        }
      }

      showToast(`Rejected "${gameTitle}" and dispatched feedback to developer.`, 'info');
      setRejectingSubmission(null);
      setRejectionReason('');
      await loadDashboardData();
    } catch (err) {
      console.error('Error rejecting submission:', err);
      showToast('Failed to reject submission.', 'error');
    } finally {
      setIsSubmittingRejection(false);
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

  const handleFilterCardClick = (type) => {
    setCatalogFilter((prev) => (prev === type ? 'all' : type));
  };

  const filteredUnderReview = underReviewList.filter((item) =>
    (item.title || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.creator || item.studioName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGames = allGamesList
    .filter((g) => {
      if (catalogFilter === 'live') return Boolean(g.active);
      if (catalogFilter === 'disabled') return !g.active;
      return true;
    })
    .filter((g) =>
      (g.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.creator || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const activeCount = allGamesList.filter((g) => g.active).length;
  const disabledCount = allGamesList.length - activeCount;

  return (
    <div className="h-screen w-full bg-[#f5f5f7] text-[#1d1d1f] flex flex-col font-sans select-none overflow-hidden">
      {/* Top Admin Header Bar */}
      <header className="h-16 w-full bg-white/95 backdrop-blur-xl border-b border-zinc-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
            title="Toggle Navigation Menu"
            className="md:hidden w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center justify-center text-zinc-700 transition cursor-pointer"
          >
            {isMobileSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

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

      {/* Dashboard Body with Left Sidebar + Scrollable Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-150"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation Aside */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-64 sm:w-72 bg-white border-r border-zinc-200/90 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out md:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Mobile Header in Aside */}
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between md:hidden">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Navigation Menu</span>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Navigation Links Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Navigation
            </div>

            {/* Nav Button 1: Game Approval Catalogue */}
            <button
              type="button"
              onClick={() => {
                setActiveNav('catalog');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between text-left cursor-pointer group ${
                activeNav === 'catalog'
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Gamepad2 
                  size={16} 
                  className={activeNav === 'catalog' ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-800'} 
                />
                <span>Game Approval Catalogue</span>
              </div>
              {underReviewList.length > 0 ? (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeNav === 'catalog' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  {underReviewList.length}
                </span>
              ) : (
                <span className={`text-[11px] font-medium ${activeNav === 'catalog' ? 'text-white/80' : 'text-zinc-400'}`}>
                  {allGamesList.length}
                </span>
              )}
            </button>

            {/* Nav Button 2: Gift Redemption (Dropdown Accordion) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsGiftDropdownOpen((prev) => !prev);
                  if (activeNav === 'catalog') {
                    setActiveNav('categories');
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between text-left cursor-pointer group ${
                  activeNav !== 'catalog'
                    ? 'bg-blue-50/70 text-[#0071e3] border border-blue-100'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Gift 
                    size={16} 
                    className={activeNav !== 'catalog' ? 'text-[#0071e3]' : 'text-zinc-500 group-hover:text-zinc-800'} 
                  />
                  <span>Gift Redemption</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${
                      isGiftDropdownOpen ? 'rotate-0 text-[#0071e3]' : '-rotate-90 text-zinc-400'
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isGiftDropdownOpen && (
                <div className="mt-1 pl-3 space-y-1 border-l-2 border-blue-100 ml-4 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Subitem 1: Gift Categories */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveNav('categories');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 text-left cursor-pointer ${
                      activeNav === 'categories'
                        ? 'bg-[#0071e3] text-white shadow-xs font-bold'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <Tag size={14} className={activeNav === 'categories' ? 'text-white' : 'text-zinc-400'} />
                    <span>Gift Categories</span>
                  </button>

                  {/* Subitem 2: Wheel Gift */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveNav('wheel');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 text-left cursor-pointer ${
                      activeNav === 'wheel'
                        ? 'bg-[#0071e3] text-white shadow-xs font-bold'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <Disc size={14} className={activeNav === 'wheel' ? 'text-white' : 'text-zinc-400'} />
                    <span>Wheel Gift</span>
                  </button>

                  {/* Subitem 3: Redemption Logs */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveNav('redemptions');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 text-left cursor-pointer ${
                      activeNav === 'redemptions'
                        ? 'bg-[#0071e3] text-white shadow-xs font-bold'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <Ticket size={14} className={activeNav === 'redemptions' ? 'text-white' : 'text-zinc-400'} />
                    <span>Redemption Logs</span>
                  </button>
                </div>
              )}
            </div>

            {/* Nav Button 3: Tournaments */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveNav('tournaments');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between text-left cursor-pointer group ${
                  activeNav === 'tournaments'
                    ? 'bg-[#0071e3] text-white shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trophy 
                    size={16} 
                    className={activeNav === 'tournaments' ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-800'} 
                  />
                  <span>Tournaments</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeNav === 'tournaments' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  24h
                </span>
              </button>
            </div>

            {/* Nav Button 4: Promotions */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveNav('promotions');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between text-left cursor-pointer group ${
                  activeNav === 'promotions'
                    ? 'bg-[#0071e3] text-white shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles 
                    size={16} 
                    className={activeNav === 'promotions' ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-800'} 
                  />
                  <span>Promotions</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeNav === 'promotions' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  Banners
                </span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3.5 border-t border-zinc-100 bg-zinc-50/70 shrink-0 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Firebase Live</span>
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Console</span>
            </div>
            {currentUser?.email && (
              <div className="text-[11px] text-zinc-600 truncate font-semibold" title={currentUser.email}>
                {currentUser.email}
              </div>
            )}
          </div>
        </aside>

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 pb-24 min-w-0">
          {activeNav === 'catalog' ? (
            <>
              {/* Metric Badges Banner (Interactive Filter Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Filter 1: Under Review */}
                <button
                  type="button"
                  onClick={() => handleFilterCardClick('under_review')}
                  title={catalogFilter === 'under_review' ? 'Click to show all' : 'Filter by Under Review'}
                  className={`p-4 sm:p-5 rounded-2xl border shadow-sm space-y-1 transition-all duration-150 cursor-pointer text-left select-none relative overflow-hidden group ${
                    catalogFilter === 'under_review'
                      ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/60 shadow-md'
                      : 'bg-white border-zinc-200/90 hover:border-amber-300 hover:bg-amber-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-600 group-hover:text-amber-800 flex items-center gap-1.5 transition-colors">
                      <Clock size={14} className="text-amber-500" />
                      <span>Under Review</span>
                    </span>
                    {catalogFilter === 'under_review' && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-600">
                    {underReviewList.length}
                  </div>
                  <span className="text-[11px] text-zinc-500 block font-medium">Pending admin approval</span>
                </button>

                {/* Filter 2: Live on Site */}
                <button
                  type="button"
                  onClick={() => handleFilterCardClick('live')}
                  title={catalogFilter === 'live' ? 'Click to show all' : 'Filter by Live on Site'}
                  className={`p-4 sm:p-5 rounded-2xl border shadow-sm space-y-1 transition-all duration-150 cursor-pointer text-left select-none relative overflow-hidden group ${
                    catalogFilter === 'live'
                      ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/60 shadow-md'
                      : 'bg-white border-zinc-200/90 hover:border-emerald-300 hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-600 group-hover:text-emerald-800 flex items-center gap-1.5 transition-colors">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span>Live on Site</span>
                    </span>
                    {catalogFilter === 'live' && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                    {activeCount}
                  </div>
                  <span className="text-[11px] text-zinc-500 block font-medium">Visible to players</span>
                </button>

                {/* Filter 3: Hidden / Disabled */}
                <button
                  type="button"
                  onClick={() => handleFilterCardClick('disabled')}
                  title={catalogFilter === 'disabled' ? 'Click to show all' : 'Filter by Hidden / Disabled'}
                  className={`p-4 sm:p-5 rounded-2xl border shadow-sm space-y-1 transition-all duration-150 cursor-pointer text-left select-none relative overflow-hidden group ${
                    catalogFilter === 'disabled'
                      ? 'bg-zinc-100 border-zinc-400 ring-2 ring-zinc-400/60 shadow-md'
                      : 'bg-white border-zinc-200/90 hover:border-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-600 group-hover:text-zinc-900 flex items-center gap-1.5 transition-colors">
                      <EyeOff size={14} className="text-zinc-500" />
                      <span>Hidden / Disabled</span>
                    </span>
                    {catalogFilter === 'disabled' && (
                      <span className="px-1.5 py-0.5 rounded-md bg-zinc-200 text-zinc-900 text-[10px] font-black uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-zinc-800">
                    {disabledCount}
                  </div>
                  <span className="text-[11px] text-zinc-500 block font-medium">Toggled OFF</span>
                </button>

                {/* Filter 4: Total Games (All) */}
                <button
                  type="button"
                  onClick={() => handleFilterCardClick('all')}
                  title="Show all games"
                  className={`p-4 sm:p-5 rounded-2xl border shadow-sm space-y-1 transition-all duration-150 cursor-pointer text-left select-none relative overflow-hidden group ${
                    catalogFilter === 'all'
                      ? 'bg-blue-50/90 border-[#0071e3] ring-2 ring-[#0071e3]/40 shadow-md'
                      : 'bg-white border-zinc-200/90 hover:border-blue-300 hover:bg-blue-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-600 group-hover:text-[#0071e3] flex items-center gap-1.5 transition-colors">
                      <Gamepad2 size={14} className="text-[#0071e3]" />
                      <span>Total Games</span>
                    </span>
                    {catalogFilter === 'all' && (
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-[#0071e3] text-[10px] font-black uppercase tracking-wider">
                        All
                      </span>
                    )}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-zinc-900">
                    {allGamesList.length}
                  </div>
                  <span className="text-[11px] text-zinc-500 block font-medium">In Firebase catalog</span>
                </button>
              </div>

              {/* Active Filter Indicator Bar */}
              {catalogFilter !== 'all' && (
                <div className="flex items-center justify-between p-3 px-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs flex-wrap gap-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-zinc-500">Active Filter:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${
                      catalogFilter === 'under_review'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : catalogFilter === 'live'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                    }`}>
                      {catalogFilter === 'under_review' && `Under Review Submissions (${underReviewList.length})`}
                      {catalogFilter === 'live' && `Live Games on Site (${activeCount})`}
                      {catalogFilter === 'disabled' && `Hidden / Disabled Games (${disabledCount})`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCatalogFilter('all')}
                    className="text-xs font-bold text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition cursor-pointer"
                  >
                    <X size={13} />
                    <span>Clear Filter</span>
                  </button>
                </div>
              )}

        {/* =========================================================================
            SECTION 1: UNDER REVIEW SUBMISSIONS (table: under_review)
            ========================================================================= */}
        {(catalogFilter === 'all' || catalogFilter === 'under_review') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900">
                    Under Review Submissions ({filteredUnderReview.length})
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
            ) : filteredUnderReview.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-zinc-200/90 text-center space-y-2 shadow-xs">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                <p className="text-sm font-bold text-zinc-800">
                  {searchQuery ? `No submissions found matching "${searchQuery}"` : 'Queue is Clear'}
                </p>
                <p className="text-xs text-zinc-500">
                  {searchQuery ? 'Try clearing your search query.' : 'There are currently no games waiting under review.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUnderReview.map((item) => (
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
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-mono font-bold" title={`Permanent Game ID: ${item.game_id || item.id}`}>
                            ID: {item.game_id || item.id}
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
                        onClick={() => handleOpenRejectModal(item)}
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
        )}

        {/* =========================================================================
            SECTION 2: ALL GAMES ON FIREBASE WITH TOGGLE SWITCHES & EDIT
            ========================================================================= */}
        {(catalogFilter === 'all' || catalogFilter === 'live' || catalogFilter === 'disabled') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
                  <Layers size={18} className="text-[#0071e3]" />
                  <span>
                    {catalogFilter === 'live'
                      ? `Live Games on Site (${filteredGames.length})`
                      : catalogFilter === 'disabled'
                      ? `Hidden / Disabled Games (${filteredGames.length})`
                      : `All Games on Firebase (${filteredGames.length})`}
                  </span>
                </h2>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {catalogFilter === 'live'
                    ? 'Displaying active games currently published and visible to players.'
                    : catalogFilter === 'disabled'
                    ? 'Displaying games toggled off or hidden from the public player catalog.'
                    : 'Each game has its own toggle switch. Turning a game OFF immediately removes it from the website.'}
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
                {searchQuery
                  ? `No games found matching "${searchQuery}".`
                  : catalogFilter === 'live'
                  ? 'No live games currently active on site.'
                  : catalogFilter === 'disabled'
                  ? 'No disabled games found.'
                  : 'No games found.'}
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
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071e3] border border-blue-200" title={`Game ID: ${game.game_id || game.id}`}>
                              ID: {game.game_id || game.id}
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
      )}
    </>
        ) : activeNav === 'tournaments' ? (
          <AdminTournamentManager 
            allGames={allGamesList.filter(g => !g.isUnderReview && g.active !== false && g.active !== 'false' && g.status !== 'disabled')}
            onShowToast={showToast}
          />
        ) : activeNav === 'promotions' ? (
          <AdminPromotionManager 
            allGames={allGamesList.filter(g => !g.isUnderReview && g.active !== false && g.active !== 'false' && g.status !== 'disabled')}
            onShowToast={showToast}
          />
        ) : (
          <AdminGiftManager 
            activeSubTab={activeNav}
            hideTopNav={true}
            onShowToast={showToast}
            onGiftsCountChange={(count) => setGiftsCount(count)}
          />
        )}
      </main>
    </div>

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

      {/* Rejection Reason & Feedback Modal */}
      {rejectingSubmission && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmittingRejection) {
              handleCloseRejectModal();
            }
          }}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-modal-title"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-red-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h3 id="reject-modal-title" className="text-sm font-black text-zinc-900 tracking-tight">
                    Reject Game Submission
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    Attach clear feedback explaining why this entry cannot be approved
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmittingRejection}
                onClick={handleCloseRejectModal}
                className="w-8 h-8 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition cursor-pointer disabled:opacity-50"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body & Form */}
            <form id="reject-game-form" onSubmit={handleConfirmReject} className="p-6 overflow-y-auto space-y-4 text-left">
              {/* Submission Information Snapshot */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/90 flex items-center gap-3.5">
                <img
                  src={rejectingSubmission.logo_url || '/icon.png'}
                  alt={rejectingSubmission.title || rejectingSubmission.name}
                  className="w-12 h-12 rounded-xl object-cover bg-white border border-zinc-200 shrink-0 shadow-2xs"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-zinc-900 truncate">
                    {rejectingSubmission.title || rejectingSubmission.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 truncate">
                    Publisher: <strong className="text-zinc-700">{rejectingSubmission.creator || rejectingSubmission.studioName || 'Independent Studio'}</strong>
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-600">
                    <Mail size={12} className="text-zinc-400 shrink-0" />
                    <span className="font-mono text-zinc-800 truncate">
                      {rejectingSubmission.email || rejectingSubmission.publisher_email || 'No recipient email on file'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Preset Rejection Reason Chips */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-zinc-700">
                  Quick Preset Reasons (Click to append):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_REJECTION_REASONS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setRejectionReason((prev) => {
                          const trimmed = prev.trim();
                          if (!trimmed) return preset;
                          if (trimmed.includes(preset)) return trimmed;
                          return `${trimmed}\n• ${preset}`;
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 text-left transition cursor-pointer active:scale-98"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea for Rejection Reason */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="rejection-reason" className="block text-xs font-bold text-zinc-800">
                    Reason for Rejection <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {rejectionReason.length} characters
                  </span>
                </div>
                <textarea
                  id="rejection-reason"
                  rows={4}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Type the specific reason why this game is being rejected and what the developer needs to fix before resubmitting..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition resize-y leading-relaxed font-sans"
                />
                <p className="text-[11px] text-zinc-500 leading-normal">
                  This message is attached to the notification email sent to the publisher so they understand what needs correction.
                </p>
              </div>

              {/* Warning Notice Box */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Immediate action:</strong> Confirming rejection deletes the pending submission from the queue and dispatches the notice email to the developer.
                </span>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                disabled={isSubmittingRejection}
                onClick={handleCloseRejectModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="reject-game-form"
                disabled={isSubmittingRejection || !rejectionReason.trim()}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white text-xs font-bold transition shadow-sm shadow-red-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingRejection ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rejecting & Sending...</span>
                  </>
                ) : (
                  <>
                    <X size={14} className="stroke-[3]" />
                    <span>Confirm Rejection & Send Notice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200 select-none bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white border-zinc-200 dark:border-white/15 ring-1 ring-black/5 dark:ring-white/10"
        >
          {toastMessage.type === 'error' ? (
            <div className="w-6 h-6 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle size={14} className="stroke-[2.5]" />
            </div>
          ) : toastMessage.type === 'info' ? (
            <div className="w-6 h-6 rounded-full bg-blue-500/15 text-[#0071e3] dark:text-blue-400 flex items-center justify-center shrink-0">
              <Check size={14} className="stroke-[2.5]" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Check size={14} className="stroke-[2.5]" />
            </div>
          )}
          <span className="flex-1 text-zinc-900 dark:text-white font-bold tracking-normal leading-snug">
            {toastMessage.message}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="w-5 h-5 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition cursor-pointer shrink-0 ml-1"
            title="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

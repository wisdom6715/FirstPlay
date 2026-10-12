import React, { useState, useEffect, useCallback } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { catalogService } from '../services/catalogService';
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
  ArrowLeft
} from 'lucide-react';
import appLogo from '../assets/icon.png';

export default function AdminDashboardView({ onNavigateAuth, onNavigateHome }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Data states
  const [underReviewList, setUnderReviewList] = useState([]);
  const [allGamesList, setAllGamesList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

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
      await catalogService.approveUnderReviewGame(submission);
      showToast(`Approved "${submission.title || submission.name}"! Now live on the site.`);
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
      await catalogService.rejectUnderReviewGame(submission.id);
      showToast(`Rejected and removed "${submission.title || submission.name}".`, 'info');
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

  if (authChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f5f7] text-zinc-900">
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
              src={appLogo?.src || appLogo || '/icon.png'} 
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

                  {/* Approve / Reject Actions */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2.5">
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
                          <span>Approve & Publish to Site</span>
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
            SECTION 2: ALL GAMES ON FIREBASE WITH TOGGLE SWITCHES
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
                          </p>
                        </div>
                      </div>

                      {/* Right: Live Status & Toggle Switch & Actions */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
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
      </main>

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

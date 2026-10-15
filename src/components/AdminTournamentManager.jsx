import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Trophy, 
  Plus, 
  Pencil, 
  Trash2, 
  RefreshCw, 
  Clock, 
  Calendar, 
  Award, 
  Medal, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ExternalLink, 
  Upload, 
  Image as ImageIcon,
  Check,
  ChevronRight,
  Sparkles,
  Gamepad2,
  DollarSign,
  Gift,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { tournamentService } from '../services/tournamentService';
import { uploadPromotionAsset } from '../services/firebaseConfig';

export default function AdminTournamentManager({ allGames = [], onShowToast }) {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'ongoing' | 'upcoming' | 'completed'

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Form State
  const [selectedGameId, setSelectedGameId] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [description, setDescription] = useState('');
  const [tournamentImgUrl, setTournamentImgUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  
  // Date state: default to current local ISO string
  const [startsAtInput, setStartsAtInput] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  
  const [prizePoolAmount, setPrizePoolAmount] = useState(50000);
  const [maxParticipants, setMaxParticipants] = useState('');

  // Action states
  const [actionInProgressId, setActionInProgressId] = useState(null);
  
  // Leaderboard modal state
  const [selectedTournamentForLeaderboard, setSelectedTournamentForLeaderboard] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [prizeRedemptions, setPrizeRedemptions] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Load tournaments
  const loadTournaments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await tournamentService.getTournaments();
      setTournaments(data);
    } catch (err) {
      console.error('[AdminTournamentManager] Load error:', err);
      onShowToast?.('Failed to load tournaments', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  // Filter ONLY approved games from apps collection (active and not under review)
  const approvedGames = useMemo(() => {
    return (allGames || []).filter((g) => {
      if (!g || !g.id) return false;
      if (g.isUnderReview) return false;
      // Exclude disabled / inactive games
      if (g.active === false || g.active === 'false' || g.status === 'disabled') return false;
      return Boolean(g.name || g.title);
    });
  }, [allGames]);

  // Derived selected game object from approved games
  const selectedGame = useMemo(() => {
    return approvedGames.find((g) => g.id === selectedGameId);
  }, [approvedGames, selectedGameId]);

  // Auto-fill when game is picked
  const handleGameChange = (gameId) => {
    setSelectedGameId(gameId);
    const game = approvedGames.find((g) => g.id === gameId);
    if (game) {
      if (!tournamentName || tournamentName.includes('Championship') || tournamentName.includes('Grand Prix')) {
        setTournamentName(`${game.name} Grand Prix`);
      }
      if (!description) {
        setDescription(`Compete for the highest score in ${game.name} over 24 hours. The Top 5 players will win a share of the prize pool!`);
      }
      if (!tournamentImgUrl && !coverPreview) {
        const fallbackImg = game.banner_url || game.flyer_url || game.logo_url || '';
        setTournamentImgUrl(fallbackImg);
        setCoverPreview(fallbackImg);
      }
    }
  };

  // Auto-calculated ends_at preview
  const calculatedEndsAt = useMemo(() => {
    if (!startsAtInput) return null;
    const start = new Date(startsAtInput);
    if (isNaN(start.getTime())) return null;
    return new Date(start.getTime() + 24 * 60 * 60 * 1000);
  }, [startsAtInput]);

  // Dynamic Top 5 breakdown
  const prizeDistribution = useMemo(() => {
    const pool = Number(prizePoolAmount) || 0;
    return {
      '1': { percent: 40, amount: Math.round(pool * 0.40) },
      '2': { percent: 25, amount: Math.round(pool * 0.25) },
      '3': { percent: 15, amount: Math.round(pool * 0.15) },
      '4': { percent: 10, amount: Math.round(pool * 0.10) },
      '5': { percent: 10, amount: Math.round(pool * 0.10) },
    };
  }, [prizePoolAmount]);

  // File upload handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setTournamentImgUrl('');
    }
  };

  // Open creation modal
  const handleOpenCreateModal = () => {
    const firstGame = approvedGames[0];
    setSelectedGameId(firstGame?.id || '');
    setTournamentName(firstGame ? `${firstGame.name} Grand Prix` : 'FirstPlay Championship');
    setDescription(firstGame ? `Compete for the highest score in ${firstGame.name} over 24 hours. The Top 5 players will win a share of the prize pool!` : 'Compete for the highest score over 24 hours. The Top 5 players split the prize pool!');
    
    const fallbackImg = firstGame?.banner_url || firstGame?.logo_url || '';
    setTournamentImgUrl(fallbackImg);
    setCoverPreview(fallbackImg);
    setCoverFile(null);

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setStartsAtInput(now.toISOString().slice(0, 16));
    
    setPrizePoolAmount(50000);
    setMaxParticipants('');
    setIsCreateModalOpen(true);
  };

  // Close creation modal
  const handleCloseCreateModal = () => {
    if (isSubmitting) return;
    setIsCreateModalOpen(false);
  };

  // Save new tournament
  const handleSaveTournament = async (e) => {
    e?.preventDefault();
    if (!tournamentName.trim()) {
      onShowToast?.('Tournament name is required', 'error');
      return;
    }
    if (!selectedGameId) {
      onShowToast?.('Please select a game for this tournament', 'error');
      return;
    }
    if (!prizePoolAmount || Number(prizePoolAmount) <= 0) {
      onShowToast?.('Please enter a valid prize pool amount', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Preparing tournament banner...');

    try {
      let finalImgUrl = tournamentImgUrl;

      // Upload banner file if provided
      if (coverFile) {
        setUploadProgress('Uploading cover banner to Firebase Storage...');
        finalImgUrl = await uploadPromotionAsset(coverFile, 'banners');
      }

      if (!finalImgUrl && selectedGame) {
        finalImgUrl = selectedGame.banner_url || selectedGame.logo_url || '';
      }

      setUploadProgress('Publishing tournament to Firestore...');
      const startDate = new Date(startsAtInput);

      await tournamentService.createTournamentOnAdmin({
        tournamentName: tournamentName.trim(),
        gameId: selectedGameId,
        gameName: selectedGame?.name || 'FirstPlay Game',
        gameLogo: selectedGame?.logo_url || '',
        tournamentImgUrl: finalImgUrl,
        description: description.trim(),
        startsAtDate: isNaN(startDate.getTime()) ? new Date() : startDate,
        prizePoolAmount: Number(prizePoolAmount),
        maxParticipants: maxParticipants ? Number(maxParticipants) : null
      });

      onShowToast?.(`Tournament "${tournamentName}" created successfully!`, 'success');
      setIsCreateModalOpen(false);
      await loadTournaments();
    } catch (err) {
      console.error('[AdminTournamentManager] Creation failed:', err);
      onShowToast?.(err.message || 'Failed to create tournament', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  // Conclude & Award Top 5 Prizes
  const handleConcludeTournament = async (tournament) => {
    if (!window.confirm(`Finalize results for "${tournament.tournament_name}"? This will fetch the Top 5 highest scorers and issue their prize redemptions.`)) {
      return;
    }

    setActionInProgressId(tournament.id);
    try {
      const res = await tournamentService.concludeTournamentAndAwardPrizes(tournament.id);
      onShowToast?.(`Concluded "${tournament.tournament_name}" and awarded ${res.winnersCount} prize redemptions!`, 'success');
      await loadTournaments();
    } catch (err) {
      console.error('[AdminTournamentManager] Conclude error:', err);
      onShowToast?.(err.message || 'Failed to conclude tournament', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Delete Tournament
  const handleDeleteTournament = async (tournament) => {
    if (!window.confirm(`Are you sure you want to permanently delete tournament "${tournament.tournament_name}"? This cannot be undone.`)) {
      return;
    }

    setActionInProgressId(tournament.id);
    try {
      await tournamentService.deleteTournament(tournament.id);
      onShowToast?.(`Tournament "${tournament.tournament_name}" deleted.`, 'info');
      setTournaments(prev => prev.filter(t => t.id !== tournament.id));
    } catch (err) {
      console.error('[AdminTournamentManager] Delete error:', err);
      onShowToast?.('Failed to delete tournament', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // View Leaderboard Modal
  const handleOpenLeaderboard = async (tournament) => {
    setSelectedTournamentForLeaderboard(tournament);
    setIsLoadingLeaderboard(true);
    try {
      const [participants, redemptions] = await Promise.all([
        tournamentService.getTournamentParticipants(tournament.id),
        tournamentService.getTournamentPrizeRedemptions(tournament.id)
      ]);
      setLeaderboardData(participants);
      setPrizeRedemptions(redemptions);
    } catch (err) {
      console.error('[AdminTournamentManager] Leaderboard error:', err);
      onShowToast?.('Failed to load leaderboard details', 'error');
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // Filtered tournament list
  const filteredTournaments = useMemo(() => {
    if (activeFilter === 'all') return tournaments;
    return tournaments.filter(t => t.computedStatus === activeFilter);
  }, [tournaments, activeFilter]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: tournaments.length,
      ongoing: tournaments.filter(t => t.computedStatus === 'ongoing').length,
      upcoming: tournaments.filter(t => t.computedStatus === 'upcoming').length,
      completed: tournaments.filter(t => t.computedStatus === 'completed').length
    };
  }, [tournaments]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Trophy size={18} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              Tournaments
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200">
              24-Hour Windows
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            Create and manage 24-hour competitive tournaments. Top 5 players split the prize pool automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] text-white text-xs font-bold transition shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={15} className="stroke-[2.5]" />
          <span>Create Tournament</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto">
        {[
          { key: 'all', label: 'All Tournaments', count: counts.all },
          { key: 'ongoing', label: 'Ongoing', count: counts.ongoing, badgeBg: 'bg-emerald-100 text-emerald-800' },
          { key: 'upcoming', label: 'Upcoming', count: counts.upcoming, badgeBg: 'bg-amber-100 text-amber-800' },
          { key: 'completed', label: 'Completed (Visible)', count: counts.completed, badgeBg: 'bg-zinc-100 text-zinc-800' }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
              activeFilter === tab.key ? 'bg-white/20 text-white' : tab.badgeBg || 'bg-zinc-100 text-zinc-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="p-14 rounded-2xl bg-white border border-zinc-200 text-center shadow-xs">
          <div className="w-7 h-7 border-2 border-zinc-300 border-t-[#0071e3] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-zinc-500 font-medium">Loading tournaments from Firestore...</p>
        </div>
      ) : tournaments.length === 0 ? (
        /* =========================================================================
           ONE BIG ADD TOURNAMENT CARD (Following the exact gift wheel creation steps)
           ========================================================================= */
        <div className="max-w-xl mx-auto py-4">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="w-full p-10 sm:p-14 rounded-3xl border-2 border-dashed border-zinc-300 hover:border-[#0071e3] bg-white hover:bg-blue-50/30 transition-all duration-200 cursor-pointer text-center group flex flex-col items-center justify-center space-y-4 shadow-xs"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 group-hover:bg-[#0071e3] text-amber-600 group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-sm">
              <Trophy size={32} className="stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 group-hover:text-[#0071e3] transition-colors">
                Add New Tournament
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                Click here to configure a 24-hour tournament, link an approved game from your catalog, and configure the automated Top 5 prize pool.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-100 group-hover:bg-[#0071e3]/10 text-zinc-700 group-hover:text-[#0071e3] text-xs font-bold transition">
              <Plus size={14} />
              <span>Configure Tournament</span>
            </span>
          </button>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-zinc-200 text-center space-y-2">
          <Trophy size={32} className="mx-auto text-zinc-400" />
          <h4 className="text-sm font-bold text-zinc-800">No {activeFilter} tournaments found</h4>
          <p className="text-xs text-zinc-500">Try switching your filter or create a new tournament.</p>
        </div>
      ) : (
        /* =========================================================================
           TOURNAMENT CARDS GRID
           ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTournaments.map((tourney) => {
            const isOngoing = tourney.computedStatus === 'ongoing';
            const isUpcoming = tourney.computedStatus === 'upcoming';
            const isCompleted = tourney.computedStatus === 'completed';

            return (
              <div
                key={tourney.id}
                className="rounded-3xl bg-white border border-zinc-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                {/* Tournament Cover Banner */}
                <div className="relative h-44 w-full bg-zinc-900 overflow-hidden">
                  <img
                    src={tourney.tournament_img || tourney.game_logo || '/icon.png'}
                    alt={tourney.tournament_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = tourney.game_logo || '/icon.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {isOngoing && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>Ongoing</span>
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-md flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>Upcoming</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-200 shadow-md">
                        Completed (Past)
                      </span>
                    )}
                  </div>

                  {/* Linked Game Chip */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
                    {tourney.game_logo && (
                      <img
                        src={tourney.game_logo}
                        alt=""
                        className="w-4 h-4 rounded-md object-cover"
                      />
                    )}
                    <span className="truncate max-w-[140px]">{tourney.game_name || 'Game'}</span>
                  </div>

                  {/* Title & Prize Description on banner */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-black uppercase tracking-wider mb-1 inline-block">
                      {tourney.prize_description || `₦${(tourney.prize_pool || 0).toLocaleString()} Prize Pool`}
                    </span>
                    <h3 className="text-lg font-black tracking-tight drop-shadow-sm truncate">
                      {tourney.tournament_name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Timing & Description */}
                  <div className="space-y-3">
                    {tourney.description && (
                      <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                        {tourney.description}
                      </p>
                    )}

                    {/* Schedule Row */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-[11px]">
                      <div>
                        <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[9px]">
                          Starts
                        </span>
                        <span className="font-bold text-zinc-800">
                          {tourney.startsAtDate?.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) || 'Immediate'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[9px]">
                          Ends (24h)
                        </span>
                        <span className="font-bold text-zinc-800">
                          {tourney.endsAtDate?.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) || 'In 24 hours'}
                        </span>
                      </div>
                    </div>

                    {/* Top 5 Prize Distribution Table */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-700 flex items-center gap-1.5">
                          <Award size={13} className="text-amber-500" />
                          <span>Top 5 Distribution</span>
                        </span>
                        <span className="text-[11px] text-zinc-400 font-medium">Shared Pool</span>
                      </div>

                      <div className="grid grid-cols-5 gap-1 text-center">
                        {[
                          { rank: '1st', key: '1', percent: '40%', bg: 'bg-amber-50 border-amber-200 text-amber-900' },
                          { rank: '2nd', key: '2', percent: '25%', bg: 'bg-zinc-50 border-zinc-200 text-zinc-800' },
                          { rank: '3rd', key: '3', percent: '15%', bg: 'bg-orange-50 border-orange-200 text-orange-900' },
                          { rank: '4th', key: '4', percent: '10%', bg: 'bg-blue-50 border-blue-200 text-blue-900' },
                          { rank: '5th', key: '5', percent: '10%', bg: 'bg-blue-50 border-blue-200 text-blue-900' },
                        ].map(tier => {
                          const val = tourney.prize_distribution?.[tier.key] || '₦0';
                          return (
                            <div key={tier.rank} className={`p-1.5 rounded-xl border ${tier.bg} text-[10px]`}>
                              <div className="font-extrabold text-[9px] uppercase">{tier.rank} ({tier.percent})</div>
                              <div className="font-bold truncate mt-0.5">{val}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleOpenLeaderboard(tourney)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Users size={13} />
                      <span>Leaderboard</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Conclude Button */}
                      {tourney.status !== 'completed' && (
                        <button
                          type="button"
                          disabled={actionInProgressId === tourney.id}
                          onClick={() => handleConcludeTournament(tourney)}
                          title="Finalize Top 5 and issue prize redemptions"
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {actionInProgressId === tourney.id ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          <span>Conclude & Award</span>
                        </button>
                      )}

                      {/* Explicit Delete Button */}
                      <button
                        type="button"
                        disabled={actionInProgressId === tourney.id}
                        onClick={() => handleDeleteTournament(tourney)}
                        title="Delete Tournament"
                        className="p-1.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          CREATE TOURNAMENT MODAL
          ========================================================================= */}
      {isCreateModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              handleCloseCreateModal();
            }
          }}
        >
          <div className="w-full max-w-xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 bg-amber-50/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                    Create 24-Hour Tournament
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Strictly runs for 24 hours. Top 5 players split the prize pool automatically.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCloseCreateModal}
                className="w-8 h-8 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition cursor-pointer disabled:opacity-50"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Form */}
            <form id="create-tournament-form" onSubmit={handleSaveTournament} className="p-6 overflow-y-auto space-y-4 text-left">
              {/* 1. Select Approved Game from Catalog */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="select-approved-game" className="block text-xs font-bold text-zinc-800">
                    Select Approved Game <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{approvedGames.length} Approved</span>
                  </span>
                </div>

                {approvedGames.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-amber-600 shrink-0" />
                      <span>No approved games found</span>
                    </p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Only approved, live games can host tournaments. Please approve a game in the Game Approval Catalogue first.
                    </p>
                  </div>
                ) : (
                  <select
                    id="select-approved-game"
                    value={selectedGameId}
                    onChange={(e) => handleGameChange(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-blue-100 font-semibold"
                  >
                    <option value="" disabled>-- Choose an approved game --</option>
                    {approvedGames.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name} ({game.creator || 'Independent Studio'})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[11px] text-zinc-500">
                  Only games that are approved and live on FirstPlay appear in this list.
                </p>
              </div>

              {/* 2. Tournament Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-800">
                  Tournament Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder="e.g. Lagos Life Grand Prix"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-blue-100 font-medium"
                />
              </div>

              {/* 3. Cover Image (tournament_img with fallback to game_logo) */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/90">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800">
                    Tournament Cover Banner (16:9)
                  </span>
                  <span className="text-[10px] text-zinc-500">Falls back to game logo</span>
                </div>

                {coverPreview && (
                  <div className="w-full h-28 rounded-xl overflow-hidden border border-zinc-200 relative bg-zinc-200">
                    <img
                      src={coverPreview}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <label className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-xs font-bold text-zinc-800 transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                    <Upload size={13} />
                    <span>Upload Banner Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {coverFile && (
                    <span className="text-xs text-emerald-600 font-semibold truncate max-w-[200px]">
                      Selected: {coverFile.name}
                    </span>
                  )}
                </div>

                <input
                  type="url"
                  value={tournamentImgUrl}
                  onChange={(e) => {
                    setTournamentImgUrl(e.target.value);
                    setCoverPreview(e.target.value);
                    setCoverFile(null);
                  }}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-700 outline-none font-mono"
                />
              </div>

              {/* 4. Description & Rules */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-800">
                  Rules & Guidelines
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain gameplay guidelines, rules, and scoring requirements..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-blue-100 font-sans"
                />
              </div>

              {/* 5. Start Time & 24-Hour Expiration Display */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-800">
                    Starts At (Local Time) <span className="text-red-500">*</span>
                  </label>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#0071e3] text-[10px] font-black uppercase">
                    Strictly 24 Hours
                  </span>
                </div>

                <input
                  type="datetime-local"
                  required
                  value={startsAtInput}
                  onChange={(e) => setStartsAtInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 outline-none focus:border-[#0071e3] font-semibold"
                />

                {calculatedEndsAt && (
                  <div className="flex items-center gap-2 text-[11px] text-zinc-600 pt-1">
                    <Clock size={13} className="text-amber-500 shrink-0" />
                    <span>
                      Ends automatically on: <strong className="text-zinc-800">{calculatedEndsAt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* 6. Prize Pool Amount (₦) with Top 5 Distribution Preview */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-950">
                    Total Prize Pool (₦) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-black text-amber-800 font-mono">
                    ₦{Number(prizePoolAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2.5 text-zinc-400 font-bold text-xs">₦</span>
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      required
                      value={prizePoolAmount}
                      onChange={(e) => setPrizePoolAmount(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  {[25000, 50000, 100000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPrizePoolAmount(amt)}
                      className="px-2.5 py-2 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-[11px] font-bold text-amber-900 transition cursor-pointer"
                    >
                      ₦{(amt / 1000)}k
                    </button>
                  ))}
                </div>

                {/* Top 5 Dynamic Distribution Box */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                    Automated Top 5 Winner Distribution:
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    <div className="p-2 rounded-xl bg-white border border-amber-200">
                      <div className="text-[9px] font-extrabold text-amber-800">1st (40%)</div>
                      <div className="text-xs font-black text-zinc-900 truncate">₦{prizeDistribution['1'].amount.toLocaleString()}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-amber-200">
                      <div className="text-[9px] font-extrabold text-zinc-700">2nd (25%)</div>
                      <div className="text-xs font-black text-zinc-900 truncate">₦{prizeDistribution['2'].amount.toLocaleString()}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-amber-200">
                      <div className="text-[9px] font-extrabold text-orange-800">3rd (15%)</div>
                      <div className="text-xs font-black text-zinc-900 truncate">₦{prizeDistribution['3'].amount.toLocaleString()}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-amber-200">
                      <div className="text-[9px] font-extrabold text-blue-800">4th (10%)</div>
                      <div className="text-xs font-black text-zinc-900 truncate">₦{prizeDistribution['4'].amount.toLocaleString()}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-amber-200">
                      <div className="text-[9px] font-extrabold text-blue-800">5th (10%)</div>
                      <div className="text-xs font-black text-zinc-900 truncate">₦{prizeDistribution['5'].amount.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. Optional Participant Limit */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-800">
                  Max Participants (Optional)
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  placeholder="Leave empty for unlimited players"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 outline-none focus:border-[#0071e3] font-medium"
                />
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-zinc-500 font-medium">
                {uploadProgress || 'Tournament records directly into tournaments collection'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  form="create-tournament-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] text-white text-xs font-bold transition shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{uploadProgress || 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Trophy size={14} />
                      <span>Create Tournament</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LEADERBOARD & WINNERS MODAL
          ========================================================================= */}
      {selectedTournamentForLeaderboard && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedTournamentForLeaderboard(null);
            }
          }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Trophy size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900">
                    Leaderboard & Winners
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {selectedTournamentForLeaderboard.tournament_name} &bull; {selectedTournamentForLeaderboard.prize_description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTournamentForLeaderboard(null)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              {isLoadingLeaderboard ? (
                <div className="p-10 text-center">
                  <div className="w-6 h-6 border-2 border-zinc-300 border-t-[#0071e3] rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">Loading live scores & redemptions...</p>
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="p-8 text-center space-y-1">
                  <Users size={32} className="mx-auto text-zinc-300" />
                  <p className="text-sm font-bold text-zinc-800">No participants yet</p>
                  <p className="text-xs text-zinc-500">Scores will appear here in real-time as players play {selectedTournamentForLeaderboard.game_name}.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Rankings ({leaderboardData.length} Players)</span>
                    <span className="text-emerald-600">Top 5 Win Prizes</span>
                  </div>

                  <div className="space-y-1.5">
                    {leaderboardData.map((player) => {
                      const isTop5 = player.rank <= 5;
                      const redemption = prizeRedemptions.find(r => r.user_id === player.user_id);

                      return (
                        <div
                          key={player.id || player.user_id}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                            player.rank === 1
                              ? 'bg-amber-50/80 border-amber-300 shadow-2xs'
                              : isTop5
                              ? 'bg-blue-50/40 border-blue-200'
                              : 'bg-white border-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                              player.rank === 1
                                ? 'bg-amber-500 text-white shadow-xs'
                                : player.rank === 2
                                ? 'bg-zinc-400 text-white'
                                : player.rank === 3
                                ? 'bg-amber-700 text-white'
                                : isTop5
                                ? 'bg-blue-100 text-[#0071e3]'
                                : 'bg-zinc-100 text-zinc-500'
                            }`}>
                              {player.rank}
                            </span>

                            <div>
                              <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                                <span>{player.display_name || player.username || 'Player'}</span>
                                {isTop5 && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                                    Prize Winner
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                UID: {player.user_id?.slice(0, 10)}...
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-black text-zinc-900 font-mono">
                              {Number(player.score || 0).toLocaleString()} pts
                            </div>
                            {redemption && (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                redemption.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : redemption.status === 'claimed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {redemption.status} ({redemption.prize_amount})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedTournamentForLeaderboard(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { BASE_URL } from '../services/api';
import { soundManager } from '../utils/soundEffects';

const SLOT_ICONS = ['7️⃣', '💎', '🍒', '🔔', '👑', '💰', '⭐', '🍇'];

const SlotMachine = ({ campaignCode, prizes, onSpinComplete, campaign, onNeedsRegistration, onIpLimitReached }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [leverPulled, setLeverPulled] = useState(false);
    const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);
    const [reelStates, setReelStates] = useState([false, false, false]); // [spinning1, spinning2, spinning3]
    const [spinsLeft, setSpinsLeft] = useState(null);
    const [canShare, setCanShare] = useState(false);
    const [error, setError] = useState(null);
    const [jackpotHit, setJackpotHit] = useState(false);

    const safePrizes = prizes || [];
    const rollIntervals = useRef([null, null, null]);

    useEffect(() => {
        return () => {
            rollIntervals.current.forEach(i => {
                if (i) clearInterval(i);
            });
        };
    }, []);

    const triggerConfetti = () => {
        soundManager.playWinFanfare();
        const duration = 3500;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 40, spread: 360, ticks: 70, zIndex: 9999 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 60 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 200);
    };

    const handleSpinClick = async (e) => {
        if (e) e.preventDefault();
        if (isSpinning) return;

        soundManager.init();
        setError(null);
        setJackpotHit(false);

        // Pull lever animation
        setLeverPulled(true);
        soundManager.playTick(300);
        setTimeout(() => setLeverPulled(false), 500);

        try {
            const userStr = localStorage.getItem(`current_user_${campaign?.id}`);
            const response = await fetch(`${BASE_URL}/public/campaign/${campaignCode}/spin/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: userStr })
            });

            const data = await response.json();

            if (data.needs_registration) {
                if (onNeedsRegistration) onNeedsRegistration();
                return;
            }

            if (!response.ok) {
                if (data.ip_limit_reached || data.status === 'ip_limit_reached') {
                    if (onIpLimitReached) {
                        onIpLimitReached(data);
                        return;
                    }
                }
                if (data.can_unlock_with_share) {
                    setCanShare(true);
                }
                throw new Error(data.error || 'Failed to pull slot machine');
            }

            setIsSpinning(true);
            setSpinsLeft(data.spins_left);
            setReelStates([true, true, true]);

            // Continuous fast blur rolling for each reel
            [0, 1, 2].forEach((idx) => {
                rollIntervals.current[idx] = setInterval(() => {
                    setReels(prev => {
                        const copy = [...prev];
                        copy[idx] = SLOT_ICONS[Math.floor(Math.random() * SLOT_ICONS.length)];
                        return copy;
                    });
                    if (Math.random() > 0.4) {
                        soundManager.playTick(450 + idx * 60);
                    }
                }, 75);
            });

            const isWinning = data.prize?.is_winning;
            let finalIcons;

            if (isWinning) {
                const winIcon = SLOT_ICONS[Math.floor(Math.random() * 4)]; // 7, diamond, cherry, bell
                finalIcons = [winIcon, winIcon, winIcon];
            } else {
                // Non-matching mixed symbols
                const shuffled = [...SLOT_ICONS].sort(() => 0.5 - Math.random());
                finalIcons = [shuffled[0], shuffled[1], shuffled[2]];
                if (finalIcons[0] === finalIcons[1] && finalIcons[1] === finalIcons[2]) {
                    finalIcons[2] = SLOT_ICONS[(SLOT_ICONS.indexOf(finalIcons[0]) + 1) % SLOT_ICONS.length];
                }
            }

            // Staggered reel stops:
            // Reel 1 stops at 1300ms
            setTimeout(() => {
                clearInterval(rollIntervals.current[0]);
                setReels(prev => [finalIcons[0], prev[1], prev[2]]);
                setReelStates(prev => [false, prev[1], prev[2]]);
                soundManager.playReelStop(0);
            }, 1300);

            // Reel 2 stops at 1800ms
            setTimeout(() => {
                clearInterval(rollIntervals.current[1]);
                setReels(prev => [finalIcons[0], finalIcons[1], prev[2]]);
                setReelStates(prev => [false, false, prev[2]]);
                soundManager.playReelStop(1);
            }, 1800);

            // Reel 3 stops at 2300ms (climax)
            setTimeout(() => {
                clearInterval(rollIntervals.current[2]);
                setReels(finalIcons);
                setReelStates([false, false, false]);
                soundManager.playReelStop(2);
                setIsSpinning(false);

                if (isWinning) {
                    setJackpotHit(true);
                    triggerConfetti();
                } else {
                    soundManager.playLoseSound();
                }

                if (onSpinComplete) {
                    onSpinComplete(data.prize);
                }
            }, 2300);

        } catch (err) {
            console.error('Slot machine error:', err);
            setError(err.message);
            setIsSpinning(false);
            [0, 1, 2].forEach(i => clearInterval(rollIntervals.current[i]));
            setReelStates([false, false, false]);
        }
    };

    const handleShare = async () => {
        const userStr = localStorage.getItem(`current_user_${campaign?.id}`);
        const recordShareOnBackend = async () => {
            try {
                const response = await fetch(`${BASE_URL}/public/campaign/${campaignCode}/share/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user: userStr })
                });
                if (response.ok) {
                    setCanShare(false);
                    setError(null);
                }
            } catch (e) {
                console.error('Error recording share:', e);
            }
        };

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Play ${campaign?.name || 'Jackpot Reels'}!`,
                    text: 'Pull the slot machine lever for instant jackpot rewards!',
                    url: window.location.href
                });
                await recordShareOnBackend();
                return;
            } catch (err) {}
        }

        const shareUrl = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Pull the lever to win jackpot prizes!')}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        await recordShareOnBackend();
    };

    if (!safePrizes || safePrizes.length === 0) {
        return (
            <div className="w-full max-w-md mx-auto p-8 bg-amber-50 border border-amber-200 rounded-3xl text-center shadow-md">
                <div className="text-5xl mb-3">🎰</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Slot Machine Initializing</h3>
                <p className="text-sm text-gray-600">The campaign organizer is currently adding jackpot prizes. Please check back shortly!</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center px-4">
            
            {/* Error Message */}
            {error && (
                <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-2xl w-full text-center shadow-xs">
                    <p className="font-semibold text-sm">{error}</p>
                    {canShare && (
                        <button
                            onClick={handleShare}
                            className="mt-3 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md active:scale-95"
                        >
                            🚀 Share to Unlock Another Pull
                        </button>
                    )}
                </div>
            )}

            {/* Pulls Counter */}
            {spinsLeft !== null && (
                <div className="mb-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-xs rounded-full shadow-lg tracking-wider uppercase ring-2 ring-yellow-300/60">
                        ⭐ Pulls Remaining: {spinsLeft}
                    </span>
                </div>
            )}

            {/* LAS VEGAS ARCADE CABINET WRAPPER */}
            <div className="relative w-full max-w-[360px] sm:max-w-[400px] bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 p-5 sm:p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-4 border-amber-400/90 mb-6 select-none">
                
                {/* Glow Backdrop */}
                <div className={`absolute inset-0 rounded-[2.5rem] transition-opacity duration-300 pointer-events-none ${
                    jackpotHit
                        ? 'bg-amber-400/20 animate-pulse'
                        : isSpinning
                        ? 'bg-indigo-500/10'
                        : 'opacity-0'
                }`}></div>

                {/* Top Vegas Marquee Header */}
                <div className="relative bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 p-2.5 rounded-2xl text-center shadow-md mb-4 border-2 border-yellow-200">
                    <div className="flex items-center justify-between px-2 text-slate-950 font-black text-xs sm:text-sm tracking-widest uppercase">
                        <span className="animate-pulse">★ ★</span>
                        <span className="drop-shadow-xs flex items-center gap-1.5">
                            🎰 JACKPOT 777 REELS
                        </span>
                        <span className="animate-pulse">★ ★</span>
                    </div>
                </div>

                {/* 3 REELS HOUSING WINDOW */}
                <div className="relative bg-black/90 p-3 sm:p-4 rounded-3xl border-3 border-amber-500/60 shadow-[inset_0_8px_16px_rgba(0,0,0,0.9)] flex items-center justify-center gap-2.5 sm:gap-3.5 overflow-hidden">
                    
                    {/* Payline Laser Indicator */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0 z-20 pointer-events-none flex items-center justify-between px-1">
                        <span className="text-[10px] text-red-400 font-bold">▶</span>
                        <span className="text-[10px] text-red-400 font-bold">◀</span>
                    </div>

                    {/* Glass Reflection Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/40 pointer-events-none z-20 rounded-3xl"></div>

                    {/* Reel 1 */}
                    <div className={`relative flex-1 h-28 sm:h-32 bg-gradient-to-b from-slate-100 via-white to-slate-200 rounded-2xl shadow-xl border-2 border-slate-300 flex items-center justify-center text-4xl sm:text-5xl transition-all ${
                        reelStates[0] ? 'blur-[1.5px] scale-95 opacity-90' : 'scale-100 opacity-100'
                    } ${jackpotHit ? 'ring-4 ring-amber-400 bg-amber-50' : ''}`}>
                        <div className="drop-shadow-md select-none transform transition-transform duration-100">
                            {reels[0]}
                        </div>
                    </div>

                    {/* Reel 2 */}
                    <div className={`relative flex-1 h-28 sm:h-32 bg-gradient-to-b from-slate-100 via-white to-slate-200 rounded-2xl shadow-xl border-2 border-slate-300 flex items-center justify-center text-4xl sm:text-5xl transition-all ${
                        reelStates[1] ? 'blur-[1.5px] scale-95 opacity-90' : 'scale-100 opacity-100'
                    } ${jackpotHit ? 'ring-4 ring-amber-400 bg-amber-50' : ''}`}>
                        <div className="drop-shadow-md select-none transform transition-transform duration-100">
                            {reels[1]}
                        </div>
                    </div>

                    {/* Reel 3 */}
                    <div className={`relative flex-1 h-28 sm:h-32 bg-gradient-to-b from-slate-100 via-white to-slate-200 rounded-2xl shadow-xl border-2 border-slate-300 flex items-center justify-center text-4xl sm:text-5xl transition-all ${
                        reelStates[2] ? 'blur-[1.5px] scale-95 opacity-90' : 'scale-100 opacity-100'
                    } ${jackpotHit ? 'ring-4 ring-amber-400 bg-amber-50' : ''}`}>
                        <div className="drop-shadow-md select-none transform transition-transform duration-100">
                            {reels[2]}
                        </div>
                    </div>
                </div>

                {/* Cabinet Foot & Payout Rule Line */}
                <div className="mt-4 flex items-center justify-between px-3 text-amber-300 font-mono text-[11px]">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span className="font-bold">READY</span>
                    </div>
                    <span className="text-amber-200/90 font-extrabold tracking-wider uppercase text-[10px] sm:text-[11px]">
                        MATCH 3 SYMBOLS TO WIN
                    </span>
                    <span className="font-bold text-amber-400">BAR 777</span>
                </div>

                {/* 3D MECHANICAL PULL LEVER (Right Side, Desktop & Tablet) */}
                <div 
                    onClick={handleSpinClick}
                    className="absolute -right-7 top-1/2 -translate-y-1/2 cursor-pointer group select-none hidden sm:block"
                    title="Pull Mechanical Lever!"
                >
                    <div className="relative flex flex-col items-center">
                        {/* Red Grip Ball with shine */}
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-red-700 via-red-500 to-rose-300 shadow-[0_4px_10px_rgba(239,68,68,0.6)] border-2 border-red-300 group-hover:scale-110 transition-all duration-200 ${
                            leverPulled ? 'translate-y-12 scale-95' : ''
                        }`}></div>
                        
                        {/* Chrome Lever Rod */}
                        <div className={`w-3 bg-gradient-to-r from-gray-400 via-gray-100 to-gray-500 rounded-b shadow-md transition-all duration-300 origin-bottom ${
                            leverPulled ? 'h-6 rotate-12' : 'h-18'
                        }`}></div>

                        {/* Metallic Base Pivot Socket */}
                        <div className="w-7 h-7 bg-gradient-to-br from-amber-600 via-slate-800 to-amber-700 rounded-lg border-2 border-amber-400 shadow-md"></div>
                    </div>
                </div>

            </div>

            {/* Big Shiny 3D Action Button */}
            <div className="w-full max-w-xs sm:max-w-sm flex justify-center">
                <button
                    onClick={handleSpinClick}
                    disabled={isSpinning}
                    className={`w-full py-4 px-8 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider text-white transition-all select-none ${
                        isSpinning
                            ? 'bg-gray-500 cursor-not-allowed opacity-80'
                            : 'bg-gradient-to-r from-amber-500 via-red-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 shadow-xl hover:shadow-2xl border-b-4 border-red-800 active:border-b-0 active:translate-y-1 ring-4 ring-amber-400/40'
                    }`}
                >
                    {isSpinning ? '🎰 ROLLING REELS...' : '🕹️ PULL LEVER TO SPIN!'}
                </button>
            </div>

            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                <span>🍀</span> Triple match wins the grand jackpot
            </p>
        </div>
    );
};

export default SlotMachine;

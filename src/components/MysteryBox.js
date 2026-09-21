import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { BASE_URL } from '../services/api';
import { soundManager } from '../utils/soundEffects';

const BOX_DESIGNS = [
    {
        id: 1,
        title: 'Golden Vault',
        boxGradient: 'from-amber-400 via-yellow-500 to-amber-600',
        lidGradient: 'from-amber-300 via-yellow-400 to-amber-500',
        ribbonColor: 'bg-rose-500',
        ribbonBorder: 'border-rose-300',
        shadowColor: 'rgba(245, 158, 11, 0.4)',
        glow: 'from-amber-300/40 via-yellow-400/20 to-transparent',
        badge: 'Box #1',
        icon: '👑'
    },
    {
        id: 2,
        title: 'Royal Sapphire',
        boxGradient: 'from-indigo-500 via-purple-600 to-indigo-800',
        lidGradient: 'from-indigo-400 via-purple-500 to-indigo-700',
        ribbonColor: 'bg-amber-400',
        ribbonBorder: 'border-amber-200',
        shadowColor: 'rgba(99, 102, 241, 0.4)',
        glow: 'from-indigo-300/40 via-purple-400/20 to-transparent',
        badge: 'Box #2',
        icon: '💎'
    },
    {
        id: 3,
        title: 'Emerald Fortune',
        boxGradient: 'from-emerald-500 via-teal-600 to-emerald-800',
        lidGradient: 'from-emerald-400 via-teal-500 to-emerald-700',
        ribbonColor: 'bg-yellow-400',
        ribbonBorder: 'border-yellow-200',
        shadowColor: 'rgba(16, 185, 129, 0.4)',
        glow: 'from-emerald-300/40 via-teal-400/20 to-transparent',
        badge: 'Box #3',
        icon: '✨'
    }
];

const MysteryBox = ({ campaignCode, prizes, onSpinComplete, campaign, onNeedsRegistration, onIpLimitReached }) => {
    const [selectedBoxId, setSelectedBoxId] = useState(null);
    const [isOpening, setIsOpening] = useState(false);
    const [isOpened, setIsOpened] = useState(false);
    const [spinsLeft, setSpinsLeft] = useState(null);
    const [canShare, setCanShare] = useState(false);
    const [error, setError] = useState(null);
    const [wonPrize, setWonPrize] = useState(null);
    const rattleTimerRef = useRef(null);
    const openTimeoutRef = useRef(null);

    const safePrizes = prizes || [];

    useEffect(() => {
        return () => {
            if (rattleTimerRef.current) clearInterval(rattleTimerRef.current);
            if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
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

            const particleCount = 55 * (timeLeft / duration);
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
        }, 220);
    };

    const handleBoxClick = async (boxId) => {
        if (isOpening || isOpened) return;

        soundManager.init();
        soundManager.playBoxRattle();
        setError(null);
        setSelectedBoxId(boxId);

        try {
            const userStr = localStorage.getItem(`current_user_${campaign?.id}`);
            const response = await fetch(`${BASE_URL}/public/campaign/${campaignCode}/spin/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: userStr })
            });

            const data = await response.json();

            if (data.needs_registration) {
                setSelectedBoxId(null);
                if (onNeedsRegistration) onNeedsRegistration();
                return;
            }

            if (!response.ok) {
                setSelectedBoxId(null);
                if (data.ip_limit_reached || data.status === 'ip_limit_reached') {
                    if (onIpLimitReached) {
                        onIpLimitReached(data);
                        return;
                    }
                }
                if (data.can_unlock_with_share) {
                    setCanShare(true);
                }
                throw new Error(data.error || 'Failed to open mystery box');
            }

            setIsOpening(true);
            setSpinsLeft(data.spins_left);

            // 1. Shaking anticipation phase
            rattleTimerRef.current = setInterval(() => {
                soundManager.playBoxRattle();
            }, 300);

            // 2. Explode open at 1.4s
            openTimeoutRef.current = setTimeout(() => {
                if (rattleTimerRef.current) clearInterval(rattleTimerRef.current);
                setIsOpening(false);
                setIsOpened(true);
                setWonPrize(data.prize);
                soundManager.playBoxPop();

                if (data.prize.is_winning) {
                    triggerConfetti();
                } else {
                    soundManager.playLoseSound();
                }

                if (onSpinComplete) {
                    onSpinComplete(data.prize);
                }
            }, 1400);

        } catch (err) {
            console.error('Mystery box error:', err);
            if (rattleTimerRef.current) clearInterval(rattleTimerRef.current);
            if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
            setError(err.message);
            setIsOpening(false);
            setSelectedBoxId(null);
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
                    title: `Mystery Gift Boxes on ${campaign?.name || 'CofferCard'}!`,
                    text: 'Pick a mystery box to unlock amazing instant rewards!',
                    url: window.location.href
                });
                await recordShareOnBackend();
                return;
            } catch (err) {}
        }

        const shareUrl = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Unbox your lucky surprise!')}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        await recordShareOnBackend();
    };

    if (!safePrizes || safePrizes.length === 0) {
        return (
            <div className="w-full max-w-md mx-auto p-8 bg-amber-50 border border-amber-200 rounded-3xl text-center shadow-md">
                <div className="text-5xl mb-3">🎁</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Boxes Being Filled</h3>
                <p className="text-sm text-gray-600">The campaign organizer is stocking up mystery gift prizes. Please check back soon!</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center px-4">
            
            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-2xl w-full text-center shadow-xs">
                    <p className="font-semibold text-sm">{error}</p>
                    {canShare && (
                        <button
                            onClick={handleShare}
                            className="mt-3 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md active:scale-95"
                        >
                            🚀 Share to Unlock Another Box
                        </button>
                    )}
                </div>
            )}

            {/* Instruction Header Pill */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 text-indigo-900 rounded-full text-xs sm:text-sm font-extrabold shadow-sm">
                    <span className="animate-bounce">🎁</span> Tap any of the 3 lucky boxes below to unwrap your prize!
                </div>
                {spinsLeft !== null && (
                    <div className="mt-2 text-xs font-bold text-gray-500">
                        Picks Remaining: <span className="text-indigo-600 font-extrabold">{spinsLeft}</span>
                    </div>
                )}
            </div>

            {/* 3 Interactive 3D Mystery Gift Boxes */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full mb-8">
                {BOX_DESIGNS.map((box) => {
                    const isChosen = selectedBoxId === box.id;
                    const isFaded = selectedBoxId && !isChosen;

                    return (
                        <div
                            key={box.id}
                            onClick={() => handleBoxClick(box.id)}
                            onMouseEnter={() => {
                                if (!selectedBoxId) soundManager.playTick(750);
                            }}
                            className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 ${
                                isFaded ? 'opacity-35 scale-90 pointer-events-none' : ''
                            }`}
                        >
                            {/* Ambient Ground Shadow */}
                            <div className={`w-20 sm:w-28 h-5 rounded-full blur-md transition-all duration-300 -mb-2 ${
                                isChosen && isOpening
                                    ? 'scale-125 opacity-70 bg-amber-500/40'
                                    : 'scale-100 opacity-40 bg-black/40 group-hover:scale-110'
                            }`}></div>

                            {/* 3D GIFT BOX CONTAINER */}
                            <div className={`relative w-24 h-24 sm:w-32 sm:h-32 transition-all duration-300 ${
                                isChosen && isOpening
                                    ? 'animate-[bounce_0.2s_infinite] scale-110'
                                    : isChosen && isOpened
                                    ? 'scale-105'
                                    : 'group-hover:-translate-y-3 group-hover:scale-105'
                            }`}>
                                
                                {/* Radiant Sunburst Rays when opened */}
                                {isChosen && isOpened && (
                                    <div className="absolute inset-0 -top-8 -left-8 -right-8 -bottom-8 bg-[radial-gradient(circle,rgba(251,191,36,0.5)_0%,transparent_70%)] animate-spin-slow pointer-events-none z-0"></div>
                                )}

                                {/* Floating Prize Ascension when opened */}
                                {isChosen && isOpened && wonPrize && (
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 animate-bounce flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-xl border-2 border-white font-black">
                                            {wonPrize.is_winning ? '🎉' : '💨'}
                                        </div>
                                    </div>
                                )}

                                {/* SEPARATE 3D BOX LID (Flies off upon opening!) */}
                                <div className={`absolute -top-2 -left-1 -right-1 h-7 sm:h-9 rounded-xl bg-gradient-to-r ${box.lidGradient} shadow-md z-20 flex items-center justify-center border-t-2 border-white/60 transition-all duration-500 ${
                                    isChosen && isOpened
                                        ? '-translate-y-16 -rotate-12 opacity-0'
                                        : 'translate-y-0 rotate-0'
                                }`}>
                                    {/* Ribbon Loop on Lid */}
                                    <div className={`absolute -top-3 w-7 h-5 flex justify-center text-xl drop-shadow-md select-none`}>
                                        🎀
                                    </div>
                                    {/* Horizontal Ribbon on Lid */}
                                    <div className={`w-full h-2.5 ${box.ribbonColor} shadow-inner`}></div>
                                </div>

                                {/* 3D BOX BODY */}
                                <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${box.boxGradient} p-3 shadow-2xl relative flex flex-col items-center justify-center border-2 border-white/40 overflow-hidden`}>
                                    
                                    {/* Vertical Ribbon */}
                                    <div className={`absolute top-0 bottom-0 w-4 sm:w-5 ${box.ribbonColor} border-x ${box.ribbonBorder} shadow-xs`}></div>
                                    
                                    {/* Horizontal Ribbon */}
                                    <div className={`absolute left-0 right-0 h-4 sm:h-5 ${box.ribbonColor} border-y ${box.ribbonBorder} shadow-xs`}></div>

                                    {/* Center Icon Wax Seal Badge */}
                                    <div className="z-10 bg-white/90 backdrop-blur-xs w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg flex items-center justify-center text-lg sm:text-xl border-2 border-white group-hover:scale-110 transition-transform">
                                        {box.icon}
                                    </div>
                                </div>
                            </div>

                            {/* Label Tag */}
                            <div className="mt-3 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-colors shadow-xs ${
                                    isChosen
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 border border-gray-200'
                                }`}>
                                    {box.badge}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Unboxing Status Indicator */}
            {isOpening && (
                <div className="flex items-center gap-2 py-3 px-6 bg-amber-100 text-amber-900 rounded-full font-black text-sm animate-pulse shadow-md">
                    <span>✨</span> Unwrapping your mystery gift...
                </div>
            )}

            {!selectedBoxId && (
                <p className="text-xs text-gray-400 text-center mt-2 flex items-center gap-1">
                    <span>⭐</span> Pick wisely! Each box holds a unique surprise.
                </p>
            )}
        </div>
    );
};

export default MysteryBox;

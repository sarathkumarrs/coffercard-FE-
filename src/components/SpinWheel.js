import React, { useState, useEffect, useRef } from 'react';
import { Wheel } from 'react-custom-roulette';
import confetti from 'canvas-confetti';
import { BASE_URL } from '../services/api';
import { soundManager } from '../utils/soundEffects';

const CASINO_PALETTE = [
    { backgroundColor: '#4F46E5', textColor: '#FFFFFF' }, // Royal Indigo
    { backgroundColor: '#E11D48', textColor: '#FFFFFF' }, // Crimson Rose
    { backgroundColor: '#059669', textColor: '#FFFFFF' }, // Emerald Jewel
    { backgroundColor: '#D97706', textColor: '#FFFFFF' }, // Golden Amber
    { backgroundColor: '#7C3AED', textColor: '#FFFFFF' }, // Amethyst Purple
    { backgroundColor: '#0891B2', textColor: '#FFFFFF' }, // Electric Cyan
    { backgroundColor: '#EA580C', textColor: '#FFFFFF' }, // Vivid Tangerine
    { backgroundColor: '#475569', textColor: '#FFFFFF' }, // Slate Obsidian
];

const LED_COUNT = 24;

const SpinWheel = ({ campaignCode, prizes, onSpinComplete, campaign, onNeedsRegistration }) => {
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [spinsLeft, setSpinsLeft] = useState(null);
    const [canShare, setCanShare] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPrize, setSelectedPrize] = useState(null);
    const [ledOffset, setLedOffset] = useState(0);
    const tickIntervalRef = useRef(null);

    // Ensure at least 2 segments for react-custom-roulette
    const safePrizes = prizes || [];
    const displayPrizes = safePrizes.length === 1 
        ? [safePrizes[0], { ...safePrizes[0], id: `${safePrizes[0].id}_clone` }]
        : safePrizes;

    const data = displayPrizes.map((prize, index) => ({
        option: prize.name,
        style: {
            backgroundColor: CASINO_PALETTE[index % CASINO_PALETTE.length].backgroundColor,
            textColor: CASINO_PALETTE[index % CASINO_PALETTE.length].textColor
        }
    }));

    // Chasing LED bulbs animation around rim
    useEffect(() => {
        const interval = setInterval(() => {
            setLedOffset(prev => (prev + 1) % LED_COUNT);
        }, mustSpin ? 80 : 400);
        return () => clearInterval(interval);
    }, [mustSpin]);

    // Tick sound effects during spin
    useEffect(() => {
        if (mustSpin) {
            let speed = 90;
            const playSoundLoop = () => {
                soundManager.playTick(500 + Math.random() * 200);
                speed = Math.min(speed * 1.05, 400); // Decelerate tick sound
                tickIntervalRef.current = setTimeout(playSoundLoop, speed);
            };
            tickIntervalRef.current = setTimeout(playSoundLoop, speed);
        } else {
            if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
        }
        return () => {
            if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
        };
    }, [mustSpin]);

    const triggerConfetti = () => {
        soundManager.playWinFanfare();
        const duration = 3200;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
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

    const handleSpinClick = async (e) => {
        if (e) e.preventDefault();
        if (mustSpin) return;

        soundManager.init();

        try {
            setError(null);
            const userStr = localStorage.getItem(`current_user_${campaign?.id}`);
            const response = await fetch(`${BASE_URL}/public/campaign/${campaignCode}/spin/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: userStr })
            });

            const resData = await response.json();

            if (resData.needs_registration) {
                if (onNeedsRegistration) onNeedsRegistration();
                return;
            }

            if (!response.ok) {
                if (resData.can_unlock_with_share) {
                    setCanShare(true);
                }
                throw new Error(resData.error || 'Failed to spin');
            }

            let prizeIndex = safePrizes.findIndex(p => p.id === resData.prize.id);
            if (prizeIndex === -1) {
                prizeIndex = safePrizes.findIndex(p => p.name === resData.prize.name);
            }
            if (prizeIndex === -1) prizeIndex = 0;

            setPrizeNumber(prizeIndex);
            setSpinsLeft(resData.spins_left);
            setSelectedPrize(resData.prize);
            setMustSpin(true);

        } catch (err) {
            console.error('Spin error:', err);
            setError(err.message);
        }
    };

    const handleShare = async () => {
        const recordShareOnBackend = async () => {
            try {
                const userStr = localStorage.getItem(`current_user_${campaign?.id}`);
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
                    title: `Spin & Win on ${campaign?.name || 'CofferCard'}!`,
                    text: 'Spin the lucky wheel for instant discounts & rewards!',
                    url: window.location.href
                });
                await recordShareOnBackend();
                return;
            } catch (err) {}
        }

        const shareUrl = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Spin to win exclusive prizes!')}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        await recordShareOnBackend();
    };

    if (!safePrizes || safePrizes.length === 0) {
        return (
            <div className="w-full max-w-md mx-auto p-8 bg-amber-50 border border-amber-200 rounded-3xl text-center shadow-md">
                <div className="text-5xl mb-3">🎡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Prizes Being Loaded</h3>
                <p className="text-sm text-gray-600">The campaign organizer is currently setting up prizes. Check back soon!</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center px-4">
            
            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-2xl w-full max-w-md mx-auto text-center shadow-xs">
                    <p className="font-semibold text-sm">{error}</p>
                    {canShare && (
                        <button
                            onClick={handleShare}
                            className="mt-3 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md active:scale-95"
                        >
                            🚀 Share to Unlock Another Spin
                        </button>
                    )}
                </div>
            )}

            {/* Spins Counter Pill */}
            {spinsLeft !== null && (
                <div className="mb-5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-extrabold text-xs shadow-lg tracking-wider uppercase ring-2 ring-indigo-300/40">
                        ⚡ Spins Remaining: {spinsLeft}
                    </span>
                </div>
            )}

            {/* Arcade Wheel Stage with Golden Bezel & Animated LEDs */}
            <div className="relative w-full flex justify-center items-center mb-8">
                
                {/* Outer Glow Halo */}
                <div className="absolute w-[320px] sm:w-[380px] md:w-[440px] h-[320px] sm:h-[380px] md:h-[440px] rounded-full bg-gradient-to-r from-amber-400/20 via-yellow-300/30 to-amber-500/20 blur-xl pointer-events-none animate-pulse"></div>

                {/* Golden Casino Rim Frame */}
                <div className="relative w-[300px] sm:w-[360px] md:w-[420px] h-[300px] sm:h-[360px] md:h-[420px] rounded-full p-4 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 shadow-2xl flex items-center justify-center border-4 border-yellow-200/90">
                    
                    {/* Ring of Chasing LED Bulbs */}
                    {Array.from({ length: LED_COUNT }).map((_, i) => {
                        const angle = (i * (360 / LED_COUNT)) * (Math.PI / 180);
                        // Radius is ~ 47% of container
                        const r = 47.5;
                        const x = 50 + r * Math.cos(angle);
                        const y = 50 + r * Math.sin(angle);
                        const isLit = (i + ledOffset) % 2 === 0;

                        return (
                            <div
                                key={i}
                                className={`absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors duration-150 transform -translate-x-1/2 -translate-y-1/2 shadow-xs ${
                                    isLit
                                        ? 'bg-yellow-200 shadow-[0_0_8px_#FDE047]'
                                        : 'bg-amber-800 shadow-inner'
                                }`}
                                style={{ left: `${x}%`, top: `${y}%` }}
                            />
                        );
                    })}

                    {/* Wheel Component Container */}
                    <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center shadow-inner border-2 border-amber-900/30">
                        <Wheel
                            mustStartSpinning={mustSpin}
                            prizeNumber={prizeNumber}
                            data={data}
                            onStopSpinning={() => {
                                setMustSpin(false);
                                const winningPrize = selectedPrize || safePrizes[prizeNumber] || safePrizes[0];
                                if (winningPrize && winningPrize.is_winning) {
                                    triggerConfetti();
                                } else {
                                    soundManager.playLoseSound();
                                }
                                onSpinComplete(winningPrize);
                            }}
                            outerBorderWidth={0}
                            radiusLineWidth={1.5}
                            radiusLineColor="#FFFFFF"
                            fontSize={window.innerWidth < 640 ? 14 : window.innerWidth < 768 ? 16 : 18}
                            textDistance={window.innerWidth < 640 ? 54 : window.innerWidth < 768 ? 58 : 64}
                            spinDuration={0.65}
                            perpendicularText={false}
                            backgroundColors={['transparent']}
                        />

                        {/* 3D Golden Center Spin Hub */}
                        <div 
                            onClick={handleSpinClick}
                            className={`absolute z-30 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 shadow-2xl border-4 border-amber-100 flex flex-col items-center justify-center cursor-pointer select-none transition-transform active:scale-90 ${
                                mustSpin ? 'pointer-events-none' : 'hover:scale-105'
                            }`}
                        >
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-inner flex items-center justify-center border border-white/60">
                                <span className="text-[11px] sm:text-xs font-black text-amber-950 uppercase tracking-tighter drop-shadow-xs">
                                    {mustSpin ? '...' : 'SPIN'}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 3D Golden Pointer Arrow at Top */}
                <div className="absolute top-0 z-40 -translate-y-2 flex flex-col items-center filter drop-shadow-lg">
                    <div className="w-6 h-8 bg-gradient-to-b from-red-600 via-red-500 to-amber-400 clip-triangle shadow-md"
                         style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }}></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-300 border-2 border-red-700 -mt-7 shadow-xs"></div>
                </div>

            </div>

            {/* Premium 3D Action Button */}
            <div className="w-full max-w-xs sm:max-w-sm flex justify-center">
                <button
                    onClick={handleSpinClick}
                    disabled={mustSpin}
                    className={`w-full py-4 px-8 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider text-white transition-all select-none ${
                        mustSpin
                            ? 'bg-gray-400 cursor-not-allowed opacity-80'
                            : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 shadow-xl hover:shadow-2xl border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 ring-4 ring-amber-400/30'
                    }`}
                >
                    {mustSpin ? '🎡 SPINNING WHEEL...' : '⭐ TAP TO SPIN & WIN!'}
                </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                <span>🎯</span> 100% Verified Fair Random Draw
            </p>
        </div>
    );
};

export default SpinWheel;
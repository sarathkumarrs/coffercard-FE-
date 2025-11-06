import React, { useState, useEffect } from 'react';
import { Wheel } from 'react-custom-roulette';
import confetti from 'canvas-confetti';
import { BASE_URL } from '../services/api';

const SpinWheel = ({campaignCode, prizes, onSpinComplete, campaign, onNeedsRegistration }) => {
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [spinsLeft, setSpinsLeft] = useState(null);
    const [canShare, setCanShare] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPrize, setSelectedPrize] = useState(null);

    useEffect(() => {
        console.log('Available prizes:', prizes);
    }, [prizes]);

    // Clean, simple color palette
    const colorPalette = [
        { backgroundColor: '#3B82F6', textColor: '#FFFFFF' }, // Blue
        { backgroundColor: '#EF4444', textColor: '#FFFFFF' }, // Red
        { backgroundColor: '#10B981', textColor: '#FFFFFF' }, // Green
        { backgroundColor: '#F59E0B', textColor: '#FFFFFF' }, // Orange
        { backgroundColor: '#8B5CF6', textColor: '#FFFFFF' }, // Purple
        { backgroundColor: '#EC4899', textColor: '#FFFFFF' }, // Pink
        { backgroundColor: '#14B8A6', textColor: '#FFFFFF' }, // Teal
        { backgroundColor: '#F97316', textColor: '#FFFFFF' }, // Orange-red
    ];

    const data = prizes.map((prize, index) => ({
        option: prize.name,
        style: {
            backgroundColor: colorPalette[index % colorPalette.length].backgroundColor,
            textColor: colorPalette[index % colorPalette.length].textColor
        }
    }));

    // Confetti animation for winners
    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            }));
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            }));
        }, 250);
    };

    const handleSpinClick = async (e) => {
        // Prevent default to avoid touch delay
        if (e) {
            e.preventDefault();
        }

        if (!mustSpin) {
            try {
                console.log('Sending spin request to:', `${BASE_URL}/public/campaign/${campaignCode}/spin/`);
                console.log('Current user details:', localStorage.getItem(`current_user_${campaign.id}`));
                console.log('Starting spin for campaign:', campaignCode);

                const response = await fetch(`${BASE_URL}/public/campaign/${campaignCode}/spin/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: localStorage.getItem(`current_user_${campaign.id}`)
                    })
                });

                const data = await response.json();
                console.log('Spin response:', data);

                if (data.needs_registration) {
                    // Trigger parent component to show registration
                    if (onNeedsRegistration) {
                        onNeedsRegistration();
                    }
                    return;
                }

                if (!response.ok) {
                    if (data.can_unlock_with_share) {
                        setCanShare(true);
                    }
                    throw new Error(data.error);
                }

                const prizeIndex = prizes.findIndex(p => p.id === data.prize.id);
                console.log('Selected prize index:', prizeIndex);

                if (prizeIndex === -1) {
                    throw new Error('Prize not found in available prizes');
                }

                setPrizeNumber(prizeIndex);
                setSpinsLeft(data.spins_left);
                setSelectedPrize(data.prize);
                setMustSpin(true);
            } catch (err) {
                console.error('Spin error:', err);
                setError(err.message);
            }
        }
    };

    const handleShare = async () => {
        // Open share dialog
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this prize wheel!',
                    text: 'Spin the wheel to win amazing prizes!',
                    url: window.location.href
                });

                // Record share
                const response = await fetch(`${BASE_URL}/public/campaign/${campaignCode}/share/`, {
                    method: 'POST'
                });

                if (response.ok) {
                    setCanShare(false);
                    setError(null);
                }
            } catch (err) {
                console.log('Share failed:', err);
            }
        } else {
            // Fallback for browsers that don't support navigator.share
            window.open(`https://twitter.com/intent/tweet?text=Check%20out%20this%20prize%20wheel!&url=${encodeURIComponent(window.location.href)}`);
            
            // Record share anyway
            await fetch(`${BASE_URL}/public/campaign/${campaignCode}/share/`, {
                method: 'POST'
            });
            
            setCanShare(false);
            setError(null);
        }
    };

    return (
        <div className="w-full flex flex-col items-center px-4">
            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg w-full max-w-md mx-auto">
                    <p className="font-medium">{error}</p>
                    {canShare && (
                        <button
                            onClick={handleShare}
                            className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Share to Unlock Another Spin
                        </button>
                    )}
                </div>
            )}

            {/* Spins Counter */}
            {spinsLeft !== null && (
                <div className="mb-6 text-center w-full">
                    <div className="inline-block px-6 py-2 bg-blue-500 text-white rounded-full font-semibold shadow-md">
                        Spins Remaining: {spinsLeft}
                    </div>
                </div>
            )}

            {/* Wheel Container - Mobile Optimized */}
            <div className="w-full flex justify-center items-center mb-8">
                <div className="relative max-w-[280px] sm:max-w-[340px] md:max-w-[400px] flex justify-center items-center w-full">
                    <Wheel
                        mustStartSpinning={mustSpin}
                        prizeNumber={prizeNumber}
                        data={data}
                        onStopSpinning={() => {
                            setMustSpin(false);
                            // Trigger confetti if prize is winning
                            if (prizes[prizeNumber].is_winning) {
                                triggerConfetti();
                            }
                            onSpinComplete(prizes[prizeNumber]);
                            console.log('spin wheel', prizes);
                        }}
                        outerBorderWidth={4}
                        outerBorderColor="#1F2937"
                        radiusLineWidth={1}
                        radiusLineColor="#FFFFFF"
                        fontSize={window.innerWidth < 640 ? 16 : window.innerWidth < 768 ? 18 : 20}
                        textDistance={window.innerWidth < 640 ? 55 : window.innerWidth < 768 ? 60 : 65}
                        spinDuration={0.6}
                        perpendicularText={false}
                        backgroundColors={['transparent']}
                    />
                </div>
            </div>

            {/* Spin Button - Mobile Optimized */}
            <div className="w-full flex justify-center px-0">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        handleSpinClick(e);
                    }}
                    disabled={mustSpin}
                    className={`w-full max-w-sm px-8 sm:px-12 py-4 rounded-xl text-white font-bold text-lg transition-all
                        ${mustSpin
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-lg'
                        }`}
                    style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        userSelect: 'none'
                    }}
                >
                    {mustSpin ? 'Spinning...' : 'SPIN THE WHEEL'}
                </button>
            </div>
        </div>
    );
};

export default SpinWheel;
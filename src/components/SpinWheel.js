import React, { useState, useEffect } from 'react';
import { Wheel } from 'react-custom-roulette';
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

    const data = prizes.map(prize => ({
        option: prize.name,
        style: { backgroundColor: getRandomColor() }
    }));

    // Function to get random colors for wheel segments
    function getRandomColor() {
        const colors = ['#FF8F8F', '#91B3FA', '#88D4AB', '#FFB677', '#98B7DB'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

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
        <div className="flex flex-col items-center px-2 sm:px-4">
            {error && (
                <div className="mb-4 p-3 sm:p-4 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base w-full max-w-md">
                    {error}
                    {canShare && (
                        <button
                            onClick={handleShare}
                            className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
                        >
                            Share to Unlock Another Spin
                        </button>
                    )}
                </div>
            )}

            {spinsLeft !== null && (
                <div className="mb-3 sm:mb-4 text-gray-600 text-sm sm:text-base font-medium">
                    Spins remaining: <span className="font-bold text-blue-600">{spinsLeft}</span>
                </div>
            )}

            <div className="mb-6 sm:mb-8 w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px]"
                 style={{
                     transform: 'translateZ(0)',
                     willChange: 'transform',
                     backfaceVisibility: 'hidden'
                 }}>
                <Wheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={data}
                    onStopSpinning={() => {
                        setMustSpin(false);
                        onSpinComplete(prizes[prizeNumber]);
                        console.log('spin wheel', prizes);
                    }}
                    outerBorderWidth={3}
                    radiusLineWidth={1}
                    fontSize={window.innerWidth < 640 ? 12 : 15}
                    textDistance={60}
                    spinDuration={0.5}
                    perpendicularText={false}
                />
            </div>

            <button
                onTouchStart={(e) => {
                    e.preventDefault();
                    if (!mustSpin) {
                        handleSpinClick(e);
                    }
                }}
                onClick={handleSpinClick}
                disabled={mustSpin}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-white font-bold text-base sm:text-lg shadow-lg transition-transform active:scale-95
                    ${mustSpin
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 animate-pulse'
                    }`}
                style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    userSelect: 'none'
                }}
            >
                {mustSpin ? 'Spinning...' : 'SPIN!'}
            </button>
        </div>
    );
};

export default SpinWheel;
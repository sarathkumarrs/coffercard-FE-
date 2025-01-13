import React, { useState, useEffect } from 'react';
import { Wheel } from 'react-custom-roulette';
import { BASE_URL } from '../services/api';
import UserRegistrationModal from './UserRegistrationModal';


const SpinWheel = ({campaignCode, prizes, onSpinComplete, campaign }) => {
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);

    const [spinsLeft, setSpinsLeft] = useState(null);
    const [canShare, setCanShare] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPrize, setSelectedPrize] = useState(null);
    const [showRegistration, setShowRegistration] = useState(false);

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

    // const handleSpinClick = () => {
    //     if (!mustSpin) {
    //         // Generate random prize number - in production this should come from backend
    //         const newPrizeNumber = Math.floor(Math.random() * prizes.length);
    //         setPrizeNumber(newPrizeNumber);
    //         setMustSpin(true);
    //     }
    // };

    const handleSpinClick = async () => {
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
                        user: localStorage.getItem(`current_user_${campaign.id}`) // Store current user temporarily
                    })
                });
                const data = await response.json();
                console.log('Spin response:', data);
                if (data.needs_registration) {
                    setShowRegistration(true);
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

    const handleRegistrationSubmit = async (userData) => {
        try {
            const response = await fetch(`${BASE_URL}/public/campaign/${campaignCode}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            setShowRegistration(false);
            // Try spinning again after successful registration
            handleSpinClick();
        } catch (err) {
            console.error('Registration error:', err);
            setError('Registration failed. Please try again.');
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
            await fetch(`http://192.168.1.5:8000/api/public/campaign/${campaignCode}/share/`, {
                method: 'POST'
            });
        }
    };

//     return (
//         <div className="flex flex-col items-center">
//             <div className="mb-8">
//                 <Wheel
//                     mustStartSpinning={mustSpin}
//                     prizeNumber={prizeNumber}
//                     data={data}
//                     onStopSpinning={() => {
//                         setMustSpin(false);
//                         onSpinComplete(prizes[prizeNumber]);
//                     }}
//                     backgroundColors={['#ff8f43', '#70bbe0', '#0b3351', '#f9dd50']}
//                     textColors={['#ffffff']}
//                     outerBorderColor={'#eeeeee'}
//                     outerBorderWidth={3}
//                     innerBorderColor={'#30261a'}
//                     radiusLineColor={'#eeeeee'}
//                     radiusLineWidth={1}
//                 />
//             </div>
//             <button
//                 onClick={handleSpinClick}
//                 disabled={mustSpin}
//                 className={`px-6 py-3 rounded-full text-white font-bold text-lg
//                     ${mustSpin 
//                         ? 'bg-gray-400 cursor-not-allowed' 
//                         : 'bg-blue-500 hover:bg-blue-600 animate-pulse'
//                     }`}
//             >
//                 {mustSpin ? 'Spinning...' : 'SPIN!'}
//             </button>
//         </div>
//     );
// };

// export default SpinWheel;

return (
    <div className="flex flex-col items-center">
        {showRegistration ? (
                <UserRegistrationModal 
                    onSubmit={handleRegistrationSubmit}
                    onClose={() => setShowRegistration(false)}
                />
            ) : (
                <>
        {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {error}
                {canShare && (
                    <button
                        onClick={handleShare}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Share to Unlock Another Spin
                    </button>
                )}
            </div>
        )}

        {spinsLeft !== null && (
            <div className="mb-4 text-gray-600">
                Spins remaining: {spinsLeft}
            </div>
        )}

        <div className="mb-8">
            <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={data}
                onStopSpinning={() => {
                    setMustSpin(false);
                    onSpinComplete(prizes[prizeNumber]);
                    console.log('spin wheel', prizes)
                }}
            />
        </div>

        <button
            onClick={handleSpinClick}
            disabled={mustSpin}
            className={`px-6 py-3 rounded-full text-white font-bold text-lg
                ${mustSpin 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 animate-pulse'
                }`}
        >
            {mustSpin ? 'Spinning...' : 'SPIN!'}
        </button>
        </>
            )}
    </div>
);
};

export default SpinWheel;
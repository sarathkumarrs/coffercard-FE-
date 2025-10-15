import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SpinWheel from '../components/SpinWheel';
import { BASE_URL } from '../services/api';
import ScratchCard from '../components/ScratchCard';
import SocialGuidelines from '../components/SocialGuidelines';
import UserRegistrationModal from '../components/UserRegistrationModal';



const PublicCampaignPage = () => {
    const { code } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wonPrize, setWonPrize] = useState(null);
    const [needsRegistration, setNeedsRegistration] = useState(false);
    const [scratchPrize, setScratchPrize] = useState(null);

    const [showSocialPage, setShowSocialPage] = useState(true);
    const [needsUserDetails, setNeedsUserDetails] = useState(false);

    const shouldShowSocialPage = campaign?.show_social_page && showSocialPage;


    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await fetch(`${BASE_URL}/public/campaign/${code}/`);
                if (!response.ok) throw new Error('Campaign not found');
                const data = await response.json();
                setCampaign(data.campaign);

                if (data.campaign.is_in_store || !localStorage.getItem(`campaign_user_${data.campaign.id}`)) {
                    setNeedsUserDetails(true);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [code]);

    const handleUserSubmit = async (userDetails) => {
        try {
            localStorage.setItem(`current_user_${campaign.id}`, JSON.stringify(userDetails));
            // Send registration request to backend
            const response = await fetch(`${BASE_URL}/public/campaign/${code}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userDetails)
            });
    
            if (!response.ok) {
                throw new Error('Registration failed');
            }
    
            // Only store in localStorage if not in-store
            if (!campaign.is_in_store) {
                localStorage.setItem(`campaign_user_${campaign.id}`, JSON.stringify(userDetails));
            }
            
            setNeedsUserDetails(false);
            setNeedsRegistration(false); // Add this to ensure state is cleared
        } catch (error) {
            console.error('Registration error:', error);
            alert('Failed to register user');
        }
    };

    const handleSpinComplete = (prize) => {
        setWonPrize(prize);
        if (campaign.is_in_store) {
            // Reset for next customer in in-store mode
            localStorage.removeItem(`current_user_${campaign.id}`);
            setTimeout(() => {
                setNeedsUserDetails(true);
                setWonPrize(null);
                setNeedsRegistration(true); // Add this
            }, 3000); // Wait 3 seconds after showing prize
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        </div>
    );
    if (!campaign) return <div>Campaign not found</div>;


    const handleRegistration = async (userData) => {
        console.log('superb')
        try {
            const response = await fetch(`${BASE_URL}/public/campaign/${code}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            setNeedsRegistration(false);
            // Optionally refresh campaign data or show the wheel
        } catch (error) {
            console.error('Registration error:', error);
            // Handle error
        }
    };

    const handleScratchStart = async () => {
        try {
            const response = await fetch(`${BASE_URL}/public/campaign/${code}/spin/`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.needs_registration) {
                setNeedsRegistration(true);
                return;
            }

            setScratchPrize(data.prize);
        } catch (err) {
            console.error('Scratch error:', err);
            setError(err.message);
        }
    };


    return (
        <>
            {needsUserDetails ? (
                <UserRegistrationModal 
                    onSubmit={handleUserSubmit}
                    onClose={() => campaign.is_in_store ? null : setNeedsUserDetails(false)} // Prevent closing in in-store mode
                />
            ) : shouldShowSocialPage ? (
                <SocialGuidelines 
                    campaign={campaign}
                    onComplete={() => setShowSocialPage(false)}
                />
            ) : (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {campaign.name}
                    </h1>
                    <p className="text-gray-600">
                        {campaign.campaign_type === 'spin'
                            ? 'Spin the wheel to win amazing prizes!' 
                            : 'Scratch to reveal your prize!'}
                    </p>
                </div>

                {campaign.campaign_type === 'spin' ? (
                    <div>
                        {needsRegistration ? (
                            <UserRegistrationModal onRegister={handleRegistration} />
                        ) : (
                            <SpinWheel 
                                campaignCode={code}
                                prizes={campaign.prizes}
                                onSpinComplete={handleSpinComplete}
                                campaign={campaign}
                                onNeedsRegistration={() => setNeedsRegistration(true)}
                            />
                        )}
                    </div>
                ) : (
                    // Scratch card section
                    <div>
                        {needsRegistration ? (
                            <UserRegistrationModal onRegister={handleRegistration} />
                        ) : (
                            <div className="flex flex-col items-center">
                                {!scratchPrize ? (
                                    <button
                                        onClick={handleScratchStart}
                                        className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-blue-600"
                                    >
                                        Get Your Scratch Card
                                    </button>
                                ) : (
                                    <ScratchCard
                                        campaignCode={code}
                                        prize={scratchPrize}
                                        onReveal={() => setWonPrize(scratchPrize)}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}

                {wonPrize && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> {/* Added z-50 */}
                        <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold text-center mb-4">  
                                {wonPrize.is_winning ? '🎉 Congratulations! 🎉' : '🎲 Result'}
                            </h2>
                            <p className="text-xl text-center mb-6">
                            {wonPrize.is_winning ? (
                                <>You won: <span className="font-bold text-blue-600">{wonPrize.name}</span></>
                             ) : (
                                <span className="text-gray-700">{wonPrize.name}</span>
                            )}
                            </p>
                            <p className="text-gray-600 text-center mb-6">
                                {wonPrize.description}
                            </p>
                            <button
                            onClick={() => {
                                if (campaign.is_in_store) {
                                    setWonPrize(null);
                                    setNeedsUserDetails(true);
                                    setNeedsRegistration(true);
                                } else {
                                    window.location.reload();
                                }
                            }}
                            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                        >
                            {campaign.is_in_store ? 'Next Customer' : 'Play Again'}
                        </button>
                        </div>
                    </div>
                )}

                
            </div>
            <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t">
    <div className="max-w-3xl mx-auto px-4 py-1">
        <div className="flex flex-col items-center justify-center">
            <div className="mt-1 text-xs text-gray-500">
                <span>Powered by </span>
                <a 
                    href="https://coffercard.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700"
                >
                    coffercard.com
                </a>
            </div>
        </div>
    </div>
</footer>
        </div>
            )}
        </>
    );
};

export default PublicCampaignPage;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
    const [campaignStatus, setCampaignStatus] = useState(null);
    const [wonPrize, setWonPrize] = useState(null);
    const [scratchPrize, setScratchPrize] = useState(null);
    const [showSocialPage, setShowSocialPage] = useState(true);
    const [needsUserDetails, setNeedsUserDetails] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isGettingScratchCard, setIsGettingScratchCard] = useState(false);

    const shouldShowSocialPage = campaign?.show_social_page && showSocialPage && isRegistered;

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await fetch(`${BASE_URL}/public/campaign/${code}/`);
                const data = await response.json();

                // Handle campaign status (not started or ended)
                if (!response.ok) {
                    if (data.status === 'not_started' || data.status === 'ended') {
                        setCampaignStatus({
                            status: data.status,
                            message: data.message,
                            campaign_name: data.campaign_name,
                            start_date: data.start_date,
                            end_date: data.end_date
                        });
                        setLoading(false);
                        return;
                    }
                    throw new Error(data.message || 'Campaign not found');
                }

                setCampaign(data.campaign);

                // Check if user needs to register
                const isInStore = data.campaign.is_in_store;
                const hasStoredUser = localStorage.getItem(`campaign_user_${data.campaign.id}`);

                if (isInStore || !hasStoredUser) {
                    setNeedsUserDetails(true);
                    setIsRegistered(false);
                } else {
                    setIsRegistered(true);
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Registration failed');
            }
    
            // Only store in localStorage if not in-store
            if (!campaign.is_in_store) {
                localStorage.setItem(`campaign_user_${campaign.id}`, JSON.stringify(userDetails));
            }
            
            // Clear registration state and mark as registered
            setNeedsUserDetails(false);
            setIsRegistered(true);
            
        } catch (error) {
            console.error('Registration error:', error);
            // Re-throw the error so the modal can display it
            throw error;
        }
    };

    const handleSpinComplete = (prize) => {
        setWonPrize(prize);
        if (campaign.is_in_store) {
            // Reset for next customer in in-store mode
            localStorage.removeItem(`current_user_${campaign.id}`);
            setTimeout(() => {
                setNeedsUserDetails(true);
                setIsRegistered(false);
                setWonPrize(null);
            }, 3000);
        }
    };

    const handleScratchStart = async () => {
        if (isGettingScratchCard) return; // Prevent double clicks

        setIsGettingScratchCard(true);
        setError(null); // Clear any previous errors
        try {
            const response = await fetch(`${BASE_URL}/public/campaign/${code}/spin/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: localStorage.getItem(`current_user_${campaign.id}`)
                })
            });
            const data = await response.json();

            if (data.needs_registration) {
                setNeedsUserDetails(true);
                setIsRegistered(false);
                setIsGettingScratchCard(false);
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get scratch card');
            }

            setScratchPrize(data.prize);
        } catch (err) {
            console.error('Scratch error:', err);
            setError(err.message);
        } finally {
            setIsGettingScratchCard(false);
        }
    };

    const handlePlayAgain = () => {
        if (campaign.is_in_store) {
            setWonPrize(null);
            setScratchPrize(null);
            setNeedsUserDetails(true);
            setIsRegistered(false);
            setShowSocialPage(true);
        } else {
            window.location.reload();
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

    // Display friendly message if campaign hasn't started or has ended
    if (campaignStatus) {
        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                    {campaignStatus.status === 'not_started' ? (
                        <>
                            <div className="text-center mb-6">
                                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Campaign Coming Soon!
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    {campaignStatus.campaign_name}
                                </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-700 mb-2">
                                    This campaign hasn't started yet. Please check back later!
                                </p>
                                <div className="text-sm">
                                    <p className="font-semibold text-blue-900">Start Date:</p>
                                    <p className="text-blue-700">{formatDate(campaignStatus.start_date)}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Campaign Ended
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    {campaignStatus.campaign_name}
                                </p>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-700 mb-2">
                                    This campaign has ended. Thank you for your interest!
                                </p>
                                <div className="text-sm">
                                    <p className="font-semibold text-red-900">Ended On:</p>
                                    <p className="text-red-700">{formatDate(campaignStatus.end_date)}</p>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Please contact the campaign organizer for more information.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!campaign) return <div>Campaign not found</div>;

    // Generate dynamic meta description
    const metaTitle = `${campaign.name} - Win Amazing Prizes!`;
    const metaDescription = campaign.campaign_type === 'spin'
        ? `Spin the wheel and win amazing prizes in ${campaign.name}! Join now for a chance to win exclusive rewards.`
        : `Scratch and reveal your prize in ${campaign.name}! Play now and win exciting rewards.`;
    const campaignUrl = `${window.location.origin}/campaign/${code}`;

    // Render logic with proper state checks
    return (
        <>
            <Helmet>
                {/* Primary Meta Tags */}
                <title>{metaTitle}</title>
                <meta name="title" content={metaTitle} />
                <meta name="description" content={metaDescription} />

                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={campaignUrl} />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:image" content="https://coffercard.com/og-campaign.jpg" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={campaignUrl} />
                <meta property="twitter:title" content={metaTitle} />
                <meta property="twitter:description" content={metaDescription} />
                <meta property="twitter:image" content="https://coffercard.com/og-campaign.jpg" />
            </Helmet>

            {needsUserDetails ? (
                <UserRegistrationModal
                    onSubmit={handleUserSubmit}
                    onClose={() => campaign.is_in_store ? null : setNeedsUserDetails(false)}
                />
            ) : shouldShowSocialPage ? (
                <SocialGuidelines 
                    campaign={campaign}
                    onComplete={() => setShowSocialPage(false)}
                />
            ) : (
                <div className="min-h-screen bg-white flex flex-col">
                    <div className="w-full mx-auto py-6 sm:py-8 pb-24">
                        {/* Header Section */}
                        <div className="text-center mb-8 sm:mb-10 px-4">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                {campaign.name}
                            </h1>
                            <p className="text-base sm:text-lg text-gray-600">
                                {campaign.type === 'spin'
                                    ? 'Spin the wheel to win amazing prizes!'
                                    : 'Scratch to reveal your prize!'}
                            </p>
                        </div>

                        {/* Game Section */}
                        <div className="w-full flex justify-center">
                            {campaign.type === 'spin' ? (
                                <SpinWheel
                                    campaignCode={code}
                                    prizes={campaign.prizes}
                                    onSpinComplete={handleSpinComplete}
                                    campaign={campaign}
                                    onNeedsRegistration={() => {
                                        setNeedsUserDetails(true);
                                        setIsRegistered(false);
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center max-w-lg mx-auto px-4">
                                    {/* Error Message for Scratch Card */}
                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg w-full max-w-md mx-auto">
                                            <p className="font-medium">{error}</p>
                                        </div>
                                    )}

                                    {!scratchPrize ? (
                                        <button
                                            onClick={handleScratchStart}
                                            disabled={isGettingScratchCard}
                                            className={`w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-lg transition-all shadow-lg
                                                ${isGettingScratchCard
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
                                                }`}
                                            style={{
                                                WebkitTapHighlightColor: 'transparent',
                                                touchAction: 'manipulation',
                                                userSelect: 'none'
                                            }}
                                        >
                                            {isGettingScratchCard ? 'Getting Card...' : 'Get Your Scratch Card'}
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

                        {/* Prize Modal - Mobile Responsive */}
                        {wonPrize && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                                <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
                                    <div className="p-5 sm:p-6 md:p-8">
                                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-4">
                                            {wonPrize.is_winning ? '🎉 Congratulations! 🎉' : '🎲 Result'}
                                        </h2>
                                        <div className="text-center mb-4 sm:mb-6">
                                            {wonPrize.is_winning && (
                                                <p className="text-base sm:text-lg md:text-xl mb-2">
                                                    You won:
                                                </p>
                                            )}
                                            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 leading-tight">
                                                {wonPrize.name}
                                            </p>
                                        </div>
                                        <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6">
                                            {wonPrize.description}
                                        </p>

                                        {wonPrize.is_winning && (
                                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-3 sm:p-4 mb-4 sm:mb-6">
                                                <p className="text-sm sm:text-base text-blue-900 font-semibold mb-2">
                                                    📧 Check your email!
                                                </p>
                                                <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                                                    We've sent you an email with prize details and redemption instructions.
                                                    Please check your inbox, promotions, or spam folder.
                                                </p>
                                            </div>
                                        )}

                                        {campaign.is_in_store && (
                                            <button
                                                onClick={handlePlayAgain}
                                                className="w-full bg-blue-500 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-blue-600 text-base sm:text-lg font-bold transition-all active:scale-95"
                                            >
                                                Next Customer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
                        <div className="w-full px-4 py-3">
                            <div className="text-center">
                                <p className="text-xs text-gray-500">
                                    Powered by{' '}
                                    <a
                                        href="https://coffercard.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        coffercard.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};

export default PublicCampaignPage;
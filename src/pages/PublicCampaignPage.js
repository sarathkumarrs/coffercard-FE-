import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SpinWheel from '../components/SpinWheel';
import ScratchCard from '../components/ScratchCard';
import SlotMachine from '../components/SlotMachine';
import MysteryBox from '../components/MysteryBox';
import { BASE_URL } from '../services/api';
import SocialGuidelines from '../components/SocialGuidelines';
import UserRegistrationModal from '../components/UserRegistrationModal';
import { soundManager } from '../utils/soundEffects';
import { Volume2, VolumeX, Sparkles, Trophy, ExternalLink, Copy, Check, Gift, Store, ShieldAlert } from 'lucide-react';

const RECENT_WINNERS = [
    { name: 'Alex M.', prize: '25% OFF Voucher', time: '2m ago' },
    { name: 'Sarah K.', prize: 'VIP Gift Card', time: '4m ago' },
    { name: 'David L.', prize: 'Mystery Gift Box', time: '6m ago' },
    { name: 'Elena R.', prize: '10% Discount Code', time: '8m ago' },
    { name: 'Michael T.', prize: 'Free Shipping Code', time: '11m ago' },
];

const THEMES = [
    // ☀️ CLEAN LIGHT PRESETS
    {
        id: 'modern',
        category: 'light',
        name: 'Studio Minimalist',
        primary: '#2563EB',
        secondary: '#F59E0B',
        bgHex: '#FFFFFF',
        bgClass: 'bg-white text-slate-900',
    },
    {
        id: 'emerald',
        category: 'light',
        name: 'Nordic Botanical',
        primary: '#059669',
        secondary: '#D97706',
        bgHex: '#F0FDF4',
        bgClass: 'bg-[#F0FDF4] text-slate-900',
    },
    {
        id: 'sunset',
        category: 'light',
        name: 'Sunset Rose',
        primary: '#E11D48',
        secondary: '#F59E0B',
        bgHex: '#FFF1F2',
        bgClass: 'bg-[#FFF1F2] text-slate-900',
    },
    {
        id: 'champagne',
        category: 'light',
        name: 'Champagne Alabaster',
        primary: '#B45309',
        secondary: '#F59E0B',
        bgHex: '#FAF8F5',
        bgClass: 'bg-[#FAF8F5] text-stone-900',
    },

    // 🌙 LUXURY DARK PRESETS
    {
        id: 'luxury',
        category: 'dark',
        name: 'Obsidian 24K Gold',
        primary: '#F59E0B',
        secondary: '#FCD34D',
        bgHex: '#090A0F',
        bgClass: 'bg-[#090A0F] text-white',
    },
    {
        id: 'midnight',
        category: 'dark',
        name: 'Midnight Executive',
        primary: '#6366F1',
        secondary: '#38BDF8',
        bgHex: '#0B0F19',
        bgClass: 'bg-[#0B0F19] text-white',
    },
    {
        id: 'cyberpunk',
        category: 'dark',
        name: 'Cyberpunk Neon',
        primary: '#D946EF',
        secondary: '#06B6D4',
        bgHex: '#0D051D',
        bgClass: 'bg-[#0D051D] text-white',
    },
    {
        id: 'stealth',
        category: 'dark',
        name: 'Stealth Onyx',
        primary: '#FFFFFF',
        secondary: '#94A3B8',
        bgHex: '#000000',
        bgClass: 'bg-black text-white',
    }
];

const isColorLight = (hexColor) => {
    if (!hexColor || typeof hexColor !== 'string') return false;
    const hex = hexColor.replace('#', '');
    if (hex.length !== 6 && hex.length !== 3) return false;
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6;
};

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
    const [claimedReward, setClaimedReward] = useState(null);
    const [copiedCode, setCopiedCode] = useState(false);
    const [showInStoreBarcode, setShowInStoreBarcode] = useState(false);
    const [isMuted, setIsMuted] = useState(soundManager.isMuted());
    const [recentWinnerIndex, setRecentWinnerIndex] = useState(0);

    const shouldShowSocialPage = campaign?.show_social_page && showSocialPage && isRegistered;
    const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true';

    useEffect(() => {
        const ticker = setInterval(() => {
            setRecentWinnerIndex(prev => (prev + 1) % RECENT_WINNERS.length);
        }, 4000);
        return () => clearInterval(ticker);
    }, []);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await fetch(`${BASE_URL}/public/campaign/${code}/`);
                let data;
                try {
                    data = await response.json();
                } catch (jsonErr) {
                    if (!response.ok) {
                        throw new Error(`Server error (${response.status}). Please check backend status.`);
                    }
                    throw jsonErr;
                }

                // Handle campaign status (not started, ended, or ip limit reached)
                if (!response.ok) {
                    if (data && (data.status === 'not_started' || data.status === 'ended' || data.status === 'ip_limit_reached')) {
                        setCampaignStatus({
                            status: data.status,
                            message: data.message || data.error,
                            campaign_name: data.campaign_name,
                            start_date: data.start_date,
                            end_date: data.end_date,
                            max_spins_per_ip: data.max_spins_per_ip,
                            total_ip_plays: data.total_ip_plays,
                            design_settings: data.design_settings || {},
                            vendor_name: data.vendor_name,
                            vendor_logo: data.vendor_logo,
                        });
                        setLoading(false);
                        return;
                    }
                    throw new Error((data && data.message) || (data && data.error) || 'Campaign not found');
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

                // Restore active claimed reward if user previously won
                const savedReward = localStorage.getItem(`claimed_reward_${data.campaign.id}`);
                if (savedReward) {
                    try {
                        setClaimedReward(JSON.parse(savedReward));
                    } catch (e) {}
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
                let errorMsg = errorData.error || errorData.detail || errorData.message;
                if (!errorMsg && typeof errorData === 'object') {
                    const firstKey = Object.keys(errorData)[0];
                    if (firstKey) {
                        const val = errorData[firstKey];
                        errorMsg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val);
                    }
                }
                throw new Error(errorMsg || 'Registration failed');
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
        if (prize && prize.is_winning) {
            setClaimedReward(prize);
            if (!campaign?.is_in_store) {
                localStorage.setItem(`claimed_reward_${campaign.id}`, JSON.stringify(prize));
            }
        }
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

    const handleIpLimitReached = (limitData) => {
        setCampaignStatus({
            status: 'ip_limit_reached',
            message: limitData?.message || limitData?.error || 'Maximum play limit reached for your network / IP address.',
            campaign_name: campaign?.name,
            max_spins_per_ip: limitData?.max_spins_per_ip || campaign?.max_spins_per_ip || 50,
            total_ip_plays: limitData?.total_ip_plays,
            design_settings: campaign?.design_settings || {},
            vendor_name: campaign?.vendor_name,
            vendor_logo: campaign?.vendor_logo,
        });
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
                if (data.ip_limit_reached || data.status === 'ip_limit_reached') {
                    handleIpLimitReached(data);
                    return;
                }
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

    // Display friendly message if campaign hasn't started, has ended, or network IP limit is reached
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

        if (campaignStatus.status === 'ip_limit_reached') {
            const statusDesign = campaignStatus.design_settings || campaign?.design_settings || {};
            const statusBgStyle = statusDesign.bg_style || 'theme_default';
            const statusBgSolid = statusDesign.bg_solid_color || '#0f172a';
            const statusBgImage = statusDesign.bg_image_url || '';
            const statusFont = statusDesign.font_family || 'sans';
            const statusTheme = THEMES.find(t => t.id === (statusDesign.theme_style || 'modern')) || THEMES[0];
            const statusIsLight = 
                statusBgStyle === 'mesh_light' ||
                (statusBgStyle === 'theme_default' && statusTheme.category === 'light') ||
                (statusBgStyle === 'custom_solid' && isColorLight(statusBgSolid));

            const fontCls = 
                statusFont === 'serif' ? 'font-brand-serif' :
                statusFont === 'display' ? 'font-brand-display' :
                statusFont === 'outfit' ? 'font-brand-outfit' : 'font-brand-sans';

            const bgStyleObj = statusBgStyle === 'custom_image' && statusBgImage ? {
                backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.84), rgba(10, 15, 29, 0.90)), url(${statusBgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundColor: '#0F172A'
            } : statusBgStyle === 'custom_solid' ? {
                backgroundColor: statusBgSolid
            } : {
                backgroundColor: statusTheme.bgHex
            };

            const bgCls = statusBgStyle === 'mesh_dark' ? 'bg-mesh-aurora text-white' :
                statusBgStyle === 'mesh_light' ? 'bg-mesh-light text-slate-900' :
                statusBgStyle === 'custom_image' ? 'text-white' :
                statusIsLight ? 'text-slate-900' : 'text-white';

            return (
                <div className={`min-h-screen flex flex-col justify-between py-8 sm:py-12 px-4 transition-colors ${bgCls} ${fontCls}`} style={bgStyleObj}>
                    {/* Floating sound toggle */}
                    <button
                        type="button"
                        onClick={() => {
                            const nextMuted = soundManager.toggleMute();
                            setIsMuted(nextMuted);
                        }}
                        className="fixed top-4 right-4 z-40 px-3 py-1.5 rounded-full shadow-md border backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold bg-white/90 text-gray-800 border-gray-200"
                    >
                        {isMuted ? <VolumeX size={15} className="text-rose-500" /> : <Volume2 size={15} className="text-emerald-500" />}
                        <span className="text-[11px] uppercase tracking-wider hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
                    </button>

                    <div className="w-full max-w-md mx-auto my-auto relative z-10">
                        {/* Vendor Logo */}
                        {campaignStatus.vendor_logo && (
                            <div className="mb-4 flex justify-center">
                                <img
                                    src={campaignStatus.vendor_logo}
                                    alt={campaignStatus.vendor_name || 'Brand Logo'}
                                    className="h-12 w-auto object-contain rounded-xl drop-shadow-md"
                                />
                            </div>
                        )}

                        <div className={`rounded-3xl p-6 sm:p-8 border backdrop-blur-xl shadow-2xl text-center ${
                            statusIsLight 
                                ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50' 
                                : 'bg-slate-900/90 border-white/15 text-white shadow-black/60'
                        }`}>
                            {/* Shield Icon Pill */}
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-4 text-amber-400 shadow-inner">
                                <ShieldAlert size={32} />
                            </div>

                            <span className="inline-block text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-3">
                                Play Limit Reached
                            </span>

                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                                Maximum Plays Reached
                            </h2>

                            <p className={`text-sm sm:text-base leading-relaxed mb-6 ${statusIsLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                {campaignStatus.message || `This campaign allows a maximum of ${campaignStatus.max_spins_per_ip || 50} plays per network / IP address. All plays for this network have been completed.`}
                            </p>

                            {/* If visitor already claimed/won a reward, showcase it! */}
                            {claimedReward && claimedReward.is_winning ? (
                                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 text-left">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                            <Trophy size={14} /> You Already Won
                                        </span>
                                        <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                                            VOUCHER ACTIVE
                                        </span>
                                    </div>
                                    <h3 className="text-base font-black mb-1">
                                        {claimedReward.name}
                                    </h3>
                                    {claimedReward.coupon_code && (
                                        <div className="mt-2.5 flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/10 font-mono text-amber-300 text-xs font-bold">
                                            <span className="flex-1 tracking-wider">{claimedReward.coupon_code}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(claimedReward.coupon_code);
                                                    setCopiedCode(true);
                                                    setTimeout(() => setCopiedCode(false), 2000);
                                                }}
                                                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                            >
                                                {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                                                {copiedCode ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {/* Storefront redirect link if available */}
                            {statusDesign.store_url && (
                                <a
                                    href={statusDesign.store_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:brightness-110 shadow-lg transition-all mb-4"
                                >
                                    <Store size={18} />
                                    <span>Visit Store & Redeem Voucher</span>
                                    <ExternalLink size={16} />
                                </a>
                            )}

                            <div className="p-3 bg-black/20 rounded-xl text-left border border-white/5 text-[11px] opacity-75 space-y-1">
                                <p className="font-semibold">💡 Why am I seeing this?</p>
                                <p>To ensure fair distribution of prizes, this campaign sets a play limit per network. If you are connected to shared Wi-Fi (office, cafe, school), other users on your network may have used the plays.</p>
                            </div>
                        </div>
                    </div>

                    <div className="py-4 text-center text-xs opacity-60">
                        <span>Powered by </span>
                        <a href="https://coffercard.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                            coffercard.com
                        </a>
                    </div>
                </div>
            );
        }

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
    const metaDescription = campaign.type === 'spin'
        ? `Spin the wheel and win amazing prizes in ${campaign.name}! Join now for a chance to win exclusive rewards.`
        : campaign.type === 'slot'
        ? `Pull the lever and hit the jackpot in ${campaign.name}! Win exclusive discounts and prizes.`
        : campaign.type === 'box'
        ? `Open a lucky mystery gift box in ${campaign.name} for an instant surprise!`
        : `Scratch the card to reveal your secret reward in ${campaign.name}!`;
    const campaignUrl = `${window.location.origin}/campaign/${code}`;

    // Custom Design & Branding Configuration
    const design = campaign.design_settings || {};
    const primaryColor = design.primary_color || '#4f46e5';
    const secondaryColor = design.secondary_color || '#f59e0b';
    const bgStyle = design.bg_style || 'theme_default';
    const bgSolidColor = design.bg_solid_color || '#0f172a';
    const bgImageUrl = design.bg_image_url || '';
    const fontFamily = design.font_family || 'sans';
    const logoUrl = design.logo_url || campaign.vendor_logo;
    const logoSize = design.logo_size || 'md';
    const badgeText = design.badge_text || (campaign.vendor_name ? `${campaign.vendor_name} Presents` : 'VIP Reward');
    const cardStyle = design.card_style || 'glass';

    const fontClass = 
        fontFamily === 'serif' ? 'font-brand-serif' :
        fontFamily === 'display' ? 'font-brand-display' :
        fontFamily === 'outfit' ? 'font-brand-outfit' : 'font-brand-sans';

    const currentTheme = THEMES.find(t => t.id === (design.theme_style || 'modern')) || THEMES[0];
    const isLightMode = 
        bgStyle === 'mesh_light' ||
        (bgStyle === 'theme_default' && currentTheme.category === 'light') ||
        (bgStyle === 'custom_solid' && isColorLight(bgSolidColor));

    const getBgConfig = () => {
        if (bgStyle === 'custom_solid') {
            return {
                className: `min-h-screen flex flex-col transition-colors duration-300 ${isLightMode ? 'text-slate-900' : 'text-white'} ${fontClass}`,
                style: { backgroundColor: bgSolidColor }
            };
        }
        if (bgStyle === 'custom_image' && bgImageUrl) {
            return {
                className: `min-h-screen flex flex-col transition-colors duration-300 text-white ${fontClass}`,
                style: {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url(${bgImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    backgroundColor: '#0F172A'
                }
            };
        }
        if (bgStyle === 'mesh_dark') {
            return {
                className: `min-h-screen flex flex-col transition-colors duration-300 bg-mesh-aurora text-white ${fontClass}`,
                style: { backgroundColor: '#07090E' }
            };
        }
        if (bgStyle === 'mesh_light') {
            return {
                className: `min-h-screen flex flex-col transition-colors duration-300 bg-mesh-light text-slate-900 ${fontClass}`,
                style: { backgroundColor: '#FFFFFF' }
            };
        }
        // Default theme gradients with guaranteed solid base
        return {
            className: `min-h-screen flex flex-col transition-colors duration-300 ${currentTheme.bgClass} ${fontClass}`,
            style: { backgroundColor: currentTheme.bgHex }
        };
    };

    const bgConfig = getBgConfig();

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
                <div className={bgConfig.className} style={bgConfig.style}>
                    {/* Sound Effects Floating Button */}
                    <button
                        onClick={() => {
                            const nextMuted = soundManager.toggleMute();
                            setIsMuted(nextMuted);
                        }}
                        className="fixed top-4 right-4 z-40 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-200/80 backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                        title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
                    >
                        {isMuted ? <VolumeX size={15} className="text-rose-500" /> : <Volume2 size={15} className="text-emerald-600 animate-pulse" />}
                        <span className="text-[11px] uppercase tracking-wider hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
                    </button>

                    <div className={`w-full max-w-4xl mx-auto py-6 sm:py-10 px-4 ${isEmbed ? 'pb-6' : 'pb-28'}`}>
                        
                        {/* Vendor Logo & Branding Header */}
                        <div className="text-center mb-6 sm:mb-8">
                            {logoUrl && (
                                <div className="mb-3 flex justify-center">
                                    <img 
                                        src={logoUrl} 
                                        alt={campaign.vendor_name || 'Brand Logo'} 
                                        className={`w-auto object-contain rounded-xl drop-shadow-md transition-all ${
                                            logoSize === 'sm' ? 'h-8 sm:h-9' : logoSize === 'lg' ? 'h-14 sm:h-16' : 'h-11 sm:h-12'
                                        }`}
                                    />
                                </div>
                            )}

                            {badgeText && (
                                <div className="flex justify-center mb-2">
                                    <span 
                                        style={{ 
                                            borderColor: isLightMode ? primaryColor + '40' : primaryColor + '50', 
                                            color: primaryColor,
                                            backgroundColor: isLightMode ? primaryColor + '10' : primaryColor + '15'
                                        }}
                                        className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border backdrop-blur-md shadow-xs"
                                    >
                                        <Sparkles size={13} style={{ color: secondaryColor }} />
                                        {badgeText}
                                    </span>
                                </div>
                            )}

                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2 sm:mb-3">
                                {campaign.design_settings?.headline || campaign.name}
                            </h1>
                            
                            <p className="text-sm sm:text-base md:text-lg opacity-85 max-w-xl mx-auto leading-relaxed">
                                {campaign.design_settings?.subheadline || (
                                    campaign.type === 'spin'
                                        ? 'Spin the lucky wheel for instant discounts, store credit, and prizes!'
                                        : campaign.type === 'slot'
                                        ? 'Pull the lever and line up the jackpot reels to win exclusive rewards!'
                                        : campaign.type === 'box'
                                        ? 'Select a mystery lucky gift box to reveal your instant surprise!'
                                        : 'Scratch the card to uncover your secret discount code!'
                                )}
                            </p>

                            {/* Live Winner Social Proof Ticker */}
                            <div className="flex justify-center mt-4">
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full shadow-xs border backdrop-blur-xs text-[11px] font-medium transition-all duration-300 ${
                                    isLightMode 
                                        ? 'bg-white/95 border-slate-200 text-slate-900' 
                                        : 'bg-slate-900/90 border-white/10 text-white'
                                }`}>
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                                        {RECENT_WINNERS[recentWinnerIndex].name}
                                    </span>
                                    <span className={isLightMode ? 'text-slate-500' : 'text-gray-400'}>won</span>
                                    <span className="font-black" style={{ color: primaryColor }}>
                                        {RECENT_WINNERS[recentWinnerIndex].prize}
                                    </span>
                                    <span className={`text-[10px] ${isLightMode ? 'text-slate-400' : 'text-gray-400'}`}>
                                        • {RECENT_WINNERS[recentWinnerIndex].time}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Games Stage with Ambient Spotlight */}
                        <div className="relative w-full flex justify-center py-2">
                            
                            {/* Ambient Stage Spotlight matching brand colors */}
                            <div 
                                style={{
                                    background: `radial-gradient(circle, ${primaryColor}25 0%, ${secondaryColor}15 45%, transparent 70%)`
                                }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[580px] h-[340px] sm:h-[580px] rounded-full blur-3xl pointer-events-none"
                            />

                            {/* 1. SPIN WHEEL (Default & for 'spin') */}
                            {(campaign.type === 'spin' || (campaign.type !== 'slot' && campaign.type !== 'box' && campaign.type !== 'scratch')) && (
                                <SpinWheel
                                    campaignCode={code}
                                    prizes={campaign.prizes}
                                    onSpinComplete={handleSpinComplete}
                                    campaign={campaign}
                                    onNeedsRegistration={() => {
                                        setNeedsUserDetails(true);
                                        setIsRegistered(false);
                                    }}
                                    onIpLimitReached={handleIpLimitReached}
                                />
                            )}

                            {/* 2. SLOT MACHINE */}
                            {campaign.type === 'slot' && (
                                <SlotMachine
                                    campaignCode={code}
                                    prizes={campaign.prizes}
                                    onSpinComplete={handleSpinComplete}
                                    campaign={campaign}
                                    onNeedsRegistration={() => {
                                        setNeedsUserDetails(true);
                                        setIsRegistered(false);
                                    }}
                                    onIpLimitReached={handleIpLimitReached}
                                />
                            )}

                            {/* 3. MYSTERY GIFT BOX */}
                            {campaign.type === 'box' && (
                                <MysteryBox
                                    campaignCode={code}
                                    prizes={campaign.prizes}
                                    onSpinComplete={handleSpinComplete}
                                    campaign={campaign}
                                    onNeedsRegistration={() => {
                                        setNeedsUserDetails(true);
                                        setIsRegistered(false);
                                    }}
                                    onIpLimitReached={handleIpLimitReached}
                                />
                            )}

                            {/* 6. SCRATCH CARD */}
                            {campaign.type === 'scratch' && (
                                <div className="flex flex-col items-center max-w-lg mx-auto px-4 w-full">
                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg w-full max-w-md mx-auto">
                                            <p className="font-medium">{error}</p>
                                        </div>
                                    )}

                                    {!scratchPrize ? (
                                        <button
                                            onClick={handleScratchStart}
                                            disabled={isGettingScratchCard}
                                            className={`w-full sm:w-auto px-10 py-4 rounded-2xl text-white font-black text-lg transition-all shadow-xl active:scale-95 ${
                                                isGettingScratchCard
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                                            }`}
                                        >
                                            {isGettingScratchCard ? '✨ Preparing Card...' : '🎟️ Scratch Card Now'}
                                        </button>
                                    ) : (
                                        <ScratchCard
                                            campaignCode={code}
                                            prize={scratchPrize}
                                            onReveal={() => handleSpinComplete(scratchPrize)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Interactive Celebration & Voucher Redemption Modal */}
                        {wonPrize && (
                            <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                                
                                {/* Rotating Golden Sunburst Rays */}
                                {wonPrize.is_winning && (
                                    <div className="absolute w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] bg-[radial-gradient(circle,rgba(251,191,36,0.4)_0%,transparent_70%)] animate-spin-slow pointer-events-none z-0"></div>
                                )}

                                <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl border-2 border-amber-400/40 relative z-10 animate-in zoom-in-95 duration-200">
                                    
                                    {/* Close Button */}
                                    <button
                                        onClick={() => setWonPrize(null)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-base transition-colors z-20"
                                        aria-label="Close"
                                    >
                                        ✕
                                    </button>

                                    <div className="p-6 sm:p-8">
                                        <div className="text-center mb-4">
                                            <span className="text-5xl sm:text-6xl inline-block mb-2 animate-bounce">
                                                {wonPrize.is_winning ? '🎉' : '🎲'}
                                            </span>
                                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                                {wonPrize.is_winning ? 'YOU WON!' : 'Good Try!'}
                                            </h2>
                                            <p className="text-xs font-black text-amber-600 uppercase tracking-widest mt-1">
                                                {wonPrize.is_winning ? '★ Verified Reward Unlocked ★' : 'Result Recorded'}
                                            </p>
                                        </div>

                                        {/* Prize Banner */}
                                        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4 rounded-2xl border border-amber-200 text-center mb-5 shadow-xs">
                                            <p className="text-xl sm:text-2xl font-black text-amber-950 leading-tight">
                                                {wonPrize.name}
                                            </p>
                                            {wonPrize.description && (
                                                <p className="text-xs sm:text-sm text-amber-800/80 mt-1 leading-relaxed">
                                                    {wonPrize.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* PERFORATED GOLDEN VOUCHER CARD FOR WINNING PRIZES */}
                                        {wonPrize.is_winning && (
                                            <div className="space-y-4 mb-6">
                                                
                                                {/* Voucher Ticket with Notched Edges */}
                                                <div className="relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-0.5 rounded-2xl shadow-xl overflow-hidden">
                                                    <div className="bg-slate-950 rounded-[14px] p-5 relative overflow-hidden text-white">
                                                        
                                                        {/* Left and Right Perforated Notches */}
                                                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white z-10 border-r border-amber-300/40"></div>
                                                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white z-10 border-l border-amber-300/40"></div>

                                                        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold mb-2">
                                                            <span>OFFICIAL VOUCHER</span>
                                                            <span>100% VALID</span>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-3 pt-1">
                                                            <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-wider">
                                                                {wonPrize.coupon_code || `WIN-${wonPrize.id || 'OFF'}`}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    const codeToCopy = wonPrize.coupon_code || `WIN-${wonPrize.id || 'OFF'}`;
                                                                    navigator.clipboard.writeText(codeToCopy);
                                                                    setCopiedCode(true);
                                                                    setTimeout(() => setCopiedCode(false), 2500);
                                                                }}
                                                                className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 active:scale-95 shadow-md ${
                                                                    copiedCode
                                                                        ? 'bg-emerald-500 text-white'
                                                                        : 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 hover:brightness-110'
                                                                }`}
                                                            >
                                                                {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                                                                {copiedCode ? 'COPIED!' : 'COPY CODE'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action 1: Redeem & Shop Now Button with Dynamic Brand Gradient */}
                                                {(campaign.design_settings?.store_url || wonPrize.store_url) && (
                                                    <a
                                                        href={campaign.design_settings?.store_url || wonPrize.store_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                                        }}
                                                        className="w-full py-4 text-white font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-center tracking-wide ring-4 ring-white/20 hover:brightness-105"
                                                    >
                                                        🛍️ {campaign.design_settings?.cta_text || 'Redeem & Shop Now'} ↗
                                                    </a>
                                                )}

                                                {/* Action 2: In-Store Barcode Toggle */}
                                                <button
                                                    onClick={() => setShowInStoreBarcode(!showInStoreBarcode)}
                                                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                                                >
                                                    {showInStoreBarcode ? '▲ Hide Cashier Voucher' : '🏪 Show In-Store Barcode'}
                                                </button>

                                                {showInStoreBarcode && (
                                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center animate-in fade-in">
                                                        <p className="text-[11px] text-gray-500 mb-2">Show this barcode at store counter to redeem:</p>
                                                        <div className="font-mono text-xl tracking-widest font-black text-slate-800 bg-white py-2 px-4 rounded border border-gray-300 inline-block mb-1">
                                                            ||| | || |||| | |||
                                                        </div>
                                                        <p className="text-xs font-mono font-bold text-gray-700">
                                                            {wonPrize.coupon_code || `CC-${campaign.id}-${wonPrize.id}`}
                                                        </p>
                                                    </div>
                                                )}

                                                <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                                                    📧 Your voucher code is permanently saved below and ready to redeem anytime.
                                                </p>
                                            </div>
                                        )}

                                        {/* Share Button to Unlock Spins */}
                                        <button
                                            onClick={async () => {
                                                const shareUrl = window.location.href;
                                                const shareText = `Check out ${campaign.name} - Play and win amazing rewards!`;

                                                if (navigator.share) {
                                                    try {
                                                        await navigator.share({
                                                            title: campaign.name,
                                                            text: shareText,
                                                            url: shareUrl
                                                        });
                                                    } catch (err) {}
                                                } else {
                                                    navigator.clipboard.writeText(shareUrl);
                                                    alert('Campaign link copied! Share with friends to unlock more plays.');
                                                }
                                            }}
                                            className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 mb-2"
                                        >
                                            🚀 Share with Friends
                                        </button>

                                        {campaign.is_in_store && (
                                            <button
                                                onClick={handlePlayAgain}
                                                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 text-sm font-bold transition-all mt-2"
                                            >
                                                Next Customer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Persistent Won Prize Tray (Stays on screen after winning) */}
                        {claimedReward && claimedReward.is_winning && !wonPrize && (
                            <div 
                                style={{ borderColor: primaryColor + '90' }}
                                className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto bg-slate-950/95 text-white backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-2xl border-2 z-40 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-2xl sm:text-3xl flex-shrink-0">🎁</span>
                                    <div className="truncate">
                                        <span 
                                            style={{ color: secondaryColor }}
                                            className="text-[10px] uppercase tracking-widest font-black block"
                                        >
                                            Your Claimed Reward
                                        </span>
                                        <p className="font-bold text-xs sm:text-sm text-white truncate">
                                            {claimedReward.name}
                                        </p>
                                        <span 
                                            style={{ color: secondaryColor }}
                                            className="font-mono text-xs font-black tracking-wider"
                                        >
                                            {claimedReward.coupon_code || `WIN-${claimedReward.id}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => {
                                            const code = claimedReward.coupon_code || `WIN-${claimedReward.id}`;
                                            navigator.clipboard.writeText(code);
                                            setCopiedCode(true);
                                            setTimeout(() => setCopiedCode(false), 2000);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                            copiedCode ? 'bg-emerald-500 text-white' : 'bg-white text-slate-950 hover:bg-gray-100'
                                        }`}
                                    >
                                        {copiedCode ? '✅ Copied' : '📋 Copy'}
                                    </button>

                                    {(campaign.design_settings?.store_url || claimedReward.store_url) ? (
                                        <a
                                            href={campaign.design_settings?.store_url || claimedReward.store_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ backgroundColor: primaryColor }}
                                            className="px-3.5 py-1.5 hover:opacity-90 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1"
                                        >
                                            <span>Redeem</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => setWonPrize(claimedReward)}
                                            style={{ backgroundColor: primaryColor }}
                                            className="px-3 py-1.5 text-white font-bold text-xs rounded-xl transition-all"
                                        >
                                            Voucher
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer */}
                    {!isEmbed && (
                        <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200/80 z-20">
                            <div className="w-full px-4 py-2.5">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">
                                        Powered by{' '}
                                        <a
                                            href="https://coffercard.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-800 font-bold"
                                        >
                                            coffercard.com
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </footer>
                    )}
                </div>
            )}
        </>
    );
};

export default PublicCampaignPage;
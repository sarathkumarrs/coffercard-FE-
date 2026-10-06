import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PrizeModal from '../components/PrizeModal';
import CampaignQR from '../components/CampaignQR';
import CampaignIntegrationModal from '../components/CampaignIntegrationModal';
import CampaignDesignModal from '../components/CampaignDesignModal';
import { BASE_URL, fetchWithAuth } from '../services/api';
import { 
    Trash2, 
    Palette, 
    Sparkles, 
    Plus, 
    Edit3, 
    Gift, 
    QrCode, 
    Calendar, 
    Shield, 
    Instagram, 
    Facebook, 
    CheckCircle2, 
    AlertCircle, 
    X,
    Store
} from 'lucide-react';

// Countdown Timer Component
const CountdownTimer = ({ scheduledTime, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        let expired = false;
        const updateTimer = () => {
            if (expired) return;
            const now = new Date();
            const target = new Date(scheduledTime);
            const diff = target - now;

            if (diff <= 0) {
                expired = true;
                setTimeLeft('Deleting...');
                if (onExpire) onExpire();
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => {
            expired = true;
            clearInterval(interval);
        };
    }, [scheduledTime, onExpire]);

    return (
        <span className="font-mono text-rose-600 font-bold">
            {timeLeft}
        </span>
    );
};

const CampaignsPage = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [selectedCampaignForQR, setSelectedCampaignForQR] = useState(null);
    const [selectedCampaignForDesign, setSelectedCampaignForDesign] = useState(null);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        campaign_type: 'spin',
        start_date: '',
        end_date: '',
        max_claims: 0,
        max_spins_per_ip: 50,
        show_social_page: true,
        instagram_link: '',
        facebook_link: '',
        guidelines: '',
        is_in_store: false
    });

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const convertUTCToLocal = (utcDateString) => {
        if (!utcDateString) return '';
        const date = new Date(utcDateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const fetchCampaigns = useCallback(async () => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/campaigns/`);
            const data = await response.json();
            const sortedData = [...data].sort((a, b) => b.id - a.id);
            setCampaigns(sortedData);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        }
    }, []);

    const handleEditCampaign = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const campaignData = {
                ...editingCampaign,
                instagram_link: editingCampaign.instagram_link || '',
                facebook_link: editingCampaign.facebook_link || '',
                guidelines: editingCampaign.guidelines || '',
                start_date: new Date(editingCampaign.start_date).toISOString(),
                end_date: new Date(editingCampaign.end_date).toISOString()
            };

            const response = await fetchWithAuth(`${BASE_URL}/campaigns/${editingCampaign.id}/`, {
                method: 'PUT',
                body: JSON.stringify(campaignData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                let errorMessage = 'Failed to update campaign';
                if (errorData) {
                    if (errorData.detail) errorMessage = errorData.detail;
                    else if (errorData.message) errorMessage = errorData.message;
                    else {
                        const errors = Object.entries(errorData)
                            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                            .join('\n');
                        if (errors) errorMessage = errors;
                    }
                }
                throw new Error(errorMessage);
            }

            await fetchCampaigns();
            setEditModalOpen(false);
            setEditingCampaign(null);
        } catch (error) {
            console.error('Error updating campaign:', error);
            alert(error.message || 'Failed to update campaign');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const campaignData = {
                ...newCampaign,
                start_date: new Date(newCampaign.start_date).toISOString(),
                end_date: new Date(newCampaign.end_date).toISOString()
            };

            const response = await fetchWithAuth(`${BASE_URL}/campaigns/`, {
                method: 'POST',
                body: JSON.stringify(campaignData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || 'Failed to create campaign');
            }

            await fetchCampaigns();
            setIsCreateModalOpen(false);
            setNewCampaign({
                name: '',
                campaign_type: 'spin',
                start_date: '',
                end_date: '',
                max_claims: 0,
                max_spins_per_ip: 50,
                show_social_page: true,
                instagram_link: '',
                facebook_link: '',
                guidelines: '',
                is_in_store: false
            });
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert(error.message || 'Failed to create campaign');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCampaign = async (id) => {
        if (!window.confirm('Are you sure you want to delete this campaign? It will be permanently removed after the countdown.')) {
            return;
        }

        try {
            const response = await fetchWithAuth(`${BASE_URL}/campaigns/${id}/`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to schedule campaign deletion');
            }

            fetchCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            alert('Failed to delete campaign');
        }
    };

    const handleCancelDeletion = async (campaignId) => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/campaigns/${campaignId}/cancel_deletion/`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to cancel deletion');
            }

            fetchCampaigns();
        } catch (error) {
            console.error('Error cancelling deletion:', error);
            alert('Failed to cancel deletion');
        }
    };

    const handleManagePrizes = (campaign) => {
        setSelectedCampaign(campaign);
    };

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const getGameBadge = (type) => {
        switch (type) {
            case 'slot': return { label: 'Slot Machine', icon: '🎰', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
            case 'box': return { label: 'Mystery Box', icon: '🎁', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
            case 'scratch': return { label: 'Scratch Card', icon: '🎟️', bg: 'bg-amber-50 text-amber-900 border-amber-200' };
            case 'spin':
            default: return { label: 'Spin & Win', icon: '🎡', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
        }
    };

    if (!campaigns) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-brand-sans font-medium text-sm">
                    Loading campaigns...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-brand-sans pb-12">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black font-brand-outfit text-slate-900 tracking-tight">
                        Reward Campaigns
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Create, customize, and manage customer games and in-store QR standees.
                    </p>
                </div>

                <div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm font-brand-outfit transition-all shadow-md hover:shadow-amber-500/20 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Create New Campaign
                    </button>
                </div>
            </div>

            {/* Campaign Cards Grid */}
            {campaigns.length === 0 ? (
                <div className="bg-white rounded-[32px] p-12 text-center border-2 border-dashed border-slate-200 shadow-sm max-w-lg mx-auto">
                    <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                        <Gift className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black font-brand-outfit text-slate-900 mb-2">
                        No campaigns found
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm mb-6">
                        You haven't created any reward campaigns yet. Set up a Spin & Win or Scratch Card campaign to start rewarding customers!
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm font-brand-outfit transition-colors shadow-md"
                    >
                        Create Your First Campaign
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign) => {
                        const badge = getGameBadge(campaign.campaign_type);
                        const isExpired = new Date(campaign.end_date) < new Date();

                        return (
                            <div
                                key={campaign.id}
                                className={`bg-white rounded-[32px] p-6 shadow-supercard border transition-all flex flex-col justify-between ${
                                    campaign.scheduled_for_deletion
                                        ? 'border-rose-400 bg-rose-50/40'
                                        : 'border-slate-100 hover:shadow-supercard-hover'
                                }`}
                            >
                                <div>
                                    {/* Top Status & Game Type row */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                                            <span>{badge.icon}</span> {badge.label}
                                        </span>

                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            isExpired ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-900'
                                        }`}>
                                            {isExpired ? 'Ended' : 'Active'}
                                        </span>
                                    </div>

                                    {/* Campaign Name */}
                                    <h3 className="text-xl font-black font-brand-outfit text-slate-900 tracking-tight mb-2">
                                        {campaign.name}
                                    </h3>

                                    {campaign.scheduled_for_deletion && (
                                        <div className="mb-3 p-3 bg-rose-100/70 border border-rose-300 rounded-2xl flex items-center justify-between text-xs text-rose-800">
                                            <span>Deleting in:</span>
                                            <CountdownTimer
                                                scheduledTime={campaign.scheduled_for_deletion}
                                                onExpire={fetchCampaigns}
                                            />
                                        </div>
                                    )}

                                    {/* Metadata Details */}
                                    <div className="space-y-1.5 text-xs text-slate-500 py-3 border-y border-slate-100 my-4">
                                        <div className="flex justify-between">
                                            <span>Duration:</span>
                                            <span className="font-semibold text-slate-700">
                                                {new Date(campaign.start_date).toLocaleDateString()} – {new Date(campaign.end_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Max Claims:</span>
                                            <span className="font-semibold text-slate-700">
                                                {campaign.max_claims || 'Unlimited'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Plays / IP Limit:</span>
                                            <span className="font-semibold text-slate-700">
                                                {campaign.max_spins_per_ip ?? 50}
                                            </span>
                                        </div>
                                        {campaign.is_in_store && (
                                            <div className="flex justify-between text-amber-800 font-bold">
                                                <span>Mode:</span>
                                                <span>🏬 In-Store Counter</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons Toolbar */}
                                <div className="space-y-2 pt-2">
                                    {campaign.scheduled_for_deletion ? (
                                        <button
                                            onClick={() => handleCancelDeletion(campaign.id)}
                                            className="w-full py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs font-brand-outfit transition-colors shadow-sm"
                                        >
                                            Cancel Deletion
                                        </button>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handleManagePrizes(campaign)}
                                                    className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-amber-50 text-slate-800 hover:text-amber-800 font-bold text-xs font-brand-outfit transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <Gift className="w-3.5 h-3.5" /> Manage Prizes
                                                </button>
                                                <button
                                                    onClick={() => setSelectedCampaignForDesign(campaign)}
                                                    className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-purple-50 text-slate-800 hover:text-purple-700 font-bold text-xs font-brand-outfit transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <Palette className="w-3.5 h-3.5" /> Studio Themes
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => setSelectedCampaignForQR(campaign)}
                                                    className="col-span-2 py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs font-brand-outfit transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                                >
                                                    <QrCode className="w-3.5 h-3.5" /> Standee & QR
                                                </button>
                                                <div className="flex gap-1.5 justify-end">
                                                    <button
                                                        onClick={() => {
                                                            setEditingCampaign({
                                                                ...campaign,
                                                                start_date: convertUTCToLocal(campaign.start_date),
                                                                end_date: convertUTCToLocal(campaign.end_date)
                                                            });
                                                            setEditModalOpen(true);
                                                        }}
                                                        className="flex-1 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                                                        title="Edit details"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCampaign(campaign.id)}
                                                        className="flex-1 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors"
                                                        title="Delete campaign"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CREATE CAMPAIGN MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-brand-sans">
                    <div className="bg-white rounded-[36px] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-black font-brand-outfit text-slate-900">
                                    Create New Campaign
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Set up your in-store game and start rewarding shoppers.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-5">
                            <form id="createCampaignForm" onSubmit={handleCreateCampaign} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Campaign Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newCampaign.name}
                                        onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                        placeholder="e.g. Summer Lucky Spin & Win"
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                {/* VISUAL GAME SELECTOR CARDS */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Select Game Experience
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'spin', title: 'Spin the Wheel', icon: '🎡', desc: 'Classic lucky wheel' },
                                            { id: 'scratch', title: 'Scratch Card', icon: '🎟️', desc: 'Instant scratch-off' },
                                            { id: 'slot', title: 'Slot Machine', icon: '🎰', desc: '3-reel casino reels' },
                                            { id: 'box', title: 'Mystery Box', icon: '🎁', desc: 'Tap to unbox gift' },
                                        ].map(game => (
                                            <div
                                                key={game.id}
                                                onClick={() => setNewCampaign({ ...newCampaign, campaign_type: game.id })}
                                                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                                    newCampaign.campaign_type === game.id
                                                        ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-500/20'
                                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                                }`}
                                            >
                                                <div className="text-2xl mb-1">{game.icon}</div>
                                                <div className="font-extrabold text-xs text-slate-900 font-brand-outfit">{game.title}</div>
                                                <div className="text-[11px] text-slate-400">{game.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Controls */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Start Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={newCampaign.start_date}
                                            onChange={e => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            End Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={newCampaign.end_date}
                                            onChange={e => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>

                                {/* Play Limits */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Max Claims (0 for unlimited)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={newCampaign.max_claims}
                                            onChange={e => setNewCampaign({ ...newCampaign, max_claims: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Max Plays Per IP
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={newCampaign.max_spins_per_ip ?? 50}
                                            onChange={e => setNewCampaign({ ...newCampaign, max_spins_per_ip: parseInt(e.target.value) || 50 })}
                                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>

                                {/* In-Store Mode Switch */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newCampaign.is_in_store}
                                            onChange={e => setNewCampaign({ ...newCampaign, is_in_store: e.target.checked })}
                                            className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                                        />
                                        <div>
                                            <span className="font-bold text-xs sm:text-sm text-slate-800 font-brand-outfit">
                                                Enable In-Store Checkout Mode
                                            </span>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Recommended for retail counters. Allows different shoppers on the store's Wi-Fi / devices to register independently.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {/* Social Unlock Toggle */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newCampaign.show_social_page}
                                            onChange={e => setNewCampaign({ ...newCampaign, show_social_page: e.target.checked })}
                                            className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                                        />
                                        <div>
                                            <span className="font-bold text-xs sm:text-sm text-slate-800 font-brand-outfit">
                                                Require Social Media Follow to Unlock
                                            </span>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Customers must follow your Instagram or Facebook page before spinning.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {newCampaign.show_social_page && (
                                    <div className="space-y-4 pl-4 border-l-2 border-amber-500">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                Instagram Profile URL
                                            </label>
                                            <input
                                                type="url"
                                                value={newCampaign.instagram_link}
                                                onChange={e => setNewCampaign({ ...newCampaign, instagram_link: e.target.value })}
                                                placeholder="https://instagram.com/yourstore"
                                                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                Facebook Page URL
                                            </label>
                                            <input
                                                type="url"
                                                value={newCampaign.facebook_link}
                                                onChange={e => setNewCampaign({ ...newCampaign, facebook_link: e.target.value })}
                                                placeholder="https://facebook.com/yourstore"
                                                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="p-4 sm:p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-5 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs font-brand-outfit transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                form="createCampaignForm"
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs font-brand-outfit transition-colors shadow-md disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Campaign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT CAMPAIGN MODAL */}
            {editModalOpen && editingCampaign && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-brand-sans">
                    <div className="bg-white rounded-[36px] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-black font-brand-outfit text-slate-900">
                                    Edit Campaign
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Update dates, limits, and settings.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setEditModalOpen(false);
                                    setEditingCampaign(null);
                                }}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-5">
                            <form id="editCampaignForm" onSubmit={handleEditCampaign} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Campaign Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editingCampaign.name}
                                        onChange={e => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                {/* VISUAL GAME SELECTOR CARDS */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Game Format
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'spin', title: 'Spin the Wheel', icon: '🎡' },
                                            { id: 'scratch', title: 'Scratch Card', icon: '🎟️' },
                                            { id: 'slot', title: 'Slot Machine', icon: '🎰' },
                                            { id: 'box', title: 'Mystery Box', icon: '🎁' },
                                        ].map(game => (
                                            <div
                                                key={game.id}
                                                onClick={() => setEditingCampaign({ ...editingCampaign, campaign_type: game.id })}
                                                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                                    editingCampaign.campaign_type === game.id
                                                        ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-500/20'
                                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                                }`}
                                            >
                                                <div className="text-2xl mb-1">{game.icon}</div>
                                                <div className="font-extrabold text-xs text-slate-900 font-brand-outfit">{game.title}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Start Date
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={editingCampaign.start_date}
                                            onChange={e => setEditingCampaign({ ...editingCampaign, start_date: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            End Date
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={editingCampaign.end_date}
                                            onChange={e => setEditingCampaign({ ...editingCampaign, end_date: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Max Claims
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editingCampaign.max_claims}
                                            onChange={e => setEditingCampaign({ ...editingCampaign, max_claims: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Max Plays Per IP
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={editingCampaign.max_spins_per_ip ?? 50}
                                            onChange={e => setEditingCampaign({ ...editingCampaign, max_spins_per_ip: parseInt(e.target.value) || 50 })}
                                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingCampaign.is_in_store || false}
                                            onChange={e => setEditingCampaign({ ...editingCampaign, is_in_store: e.target.checked })}
                                            className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                                        />
                                        <div>
                                            <span className="font-bold text-xs sm:text-sm text-slate-800 font-brand-outfit">
                                                In-Store Checkout Mode
                                            </span>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Allows multiple store visitors to play on common store devices.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingCampaign.show_social_page || false}
                                            onChange={e => setEditingCampaign({ ...editingCampaign, show_social_page: e.target.checked })}
                                            className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                                        />
                                        <div>
                                            <span className="font-bold text-xs sm:text-sm text-slate-800 font-brand-outfit">
                                                Require Social Media Follow
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {editingCampaign.show_social_page && (
                                    <div className="space-y-4 pl-4 border-l-2 border-amber-500">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                Instagram Link
                                            </label>
                                            <input
                                                type="url"
                                                value={editingCampaign.instagram_link || ''}
                                                onChange={e => setEditingCampaign({ ...editingCampaign, instagram_link: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                Facebook Link
                                            </label>
                                            <input
                                                type="url"
                                                value={editingCampaign.facebook_link || ''}
                                                onChange={e => setEditingCampaign({ ...editingCampaign, facebook_link: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="p-4 sm:p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditModalOpen(false);
                                    setEditingCampaign(null);
                                }}
                                className="px-5 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs font-brand-outfit transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                form="editCampaignForm"
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs font-brand-outfit transition-colors shadow-md disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prized Management Modal */}
            {selectedCampaign && (
                <PrizeModal 
                    campaign={selectedCampaign} 
                    onClose={() => setSelectedCampaign(null)}
                />
            )}

            {/* In-Store Standee & QR Integration Modal */}
            {selectedCampaignForQR && (
                <CampaignIntegrationModal
                    campaign={selectedCampaignForQR}
                    onClose={() => setSelectedCampaignForQR(null)}
                />
            )}

            {/* Brand Design Studio Modal */}
            {selectedCampaignForDesign && (
                <CampaignDesignModal
                    campaign={selectedCampaignForDesign}
                    onClose={() => setSelectedCampaignForDesign(null)}
                    onUpdated={() => {
                        fetchCampaigns();
                        setSelectedCampaignForDesign(null);
                    }}
                />
            )}
        </div>
    );
};

export default CampaignsPage;
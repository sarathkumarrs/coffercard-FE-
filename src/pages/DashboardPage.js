import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BASE_URL, fetchWithAuth } from '../services/api';
import { 
    Layers, 
    Gift, 
    Sparkles, 
    Clock, 
    CheckCircle2, 
    Search, 
    Download, 
    ArrowRight, 
    Filter, 
    Calendar, 
    User, 
    Mail, 
    Plus,
    X,
    ExternalLink,
    Store,
    AlertCircle
} from 'lucide-react';

const DashboardPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'redeemed'
    const [downloadModal, setDownloadModal] = useState({
        isOpen: false,
        campaignId: null,
        campaignName: ''
    });

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const campaignsResponse = await fetchWithAuth(`${BASE_URL}/campaigns/`);
            if (!campaignsResponse.ok) {
                throw new Error('Failed to fetch campaigns');
            }
            const campaignsData = await campaignsResponse.json();
            if (!Array.isArray(campaignsData)) {
                throw new Error('Invalid response format for campaigns');
            }
            const sortedCampaigns = [...campaignsData].sort((a, b) => b.id - a.id);

            const claimsResponse = await fetchWithAuth(`${BASE_URL}/claims/`);
            if (!claimsResponse.ok) {
                throw new Error('Failed to fetch claims');
            }
            const claimsData = await claimsResponse.json();
            if (!Array.isArray(claimsData)) {
                throw new Error('Invalid response format for claims');
            }

            setCampaigns(sortedCampaigns);
            setClaims(claimsData);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleMarkRedeemed = async (claimId) => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/claims/${claimId}/mark_redeemed/`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to mark claim as redeemed');
            }

            setClaims(claims.map(claim =>
                claim.id === claimId
                    ? { ...claim, is_redeemed: true }
                    : claim
            ));
        } catch (err) {
            console.error('Error marking claim as redeemed:', err);
            alert('Failed to mark claim as redeemed');
        }
    };

    const handleDownload = async (dateRange) => {
        try {
            const queryParams = new URLSearchParams({
                ...(dateRange.startDate && { start_date: dateRange.startDate }),
                ...(dateRange.endDate && { end_date: dateRange.endDate })
            });

            const response = await fetchWithAuth(
                `${BASE_URL}/campaigns/${downloadModal.campaignId}/download-claims/?${queryParams}`
            );

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `campaign_claims_${downloadModal.campaignName}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setDownloadModal({ isOpen: false, campaignId: null, campaignName: '' });
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download claims data');
        }
    };

    // Filter calculations
    const activeCampaigns = Array.isArray(campaigns)
        ? campaigns.filter(c => new Date(c.end_date) > new Date()).length
        : 0;

    const pendingClaimsCount = Array.isArray(claims)
        ? claims.filter(c => !c.is_redeemed).length
        : 0;

    const redeemedClaimsCount = Array.isArray(claims)
        ? claims.filter(c => c.is_redeemed).length
        : 0;

    const filteredClaims = Array.isArray(claims) ? claims.filter(claim => {
        const matchesSearch =
            claim.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.user_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.prize_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.coupon_code?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCampaign = selectedCampaign === null || claim.campaign_id === selectedCampaign;

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'pending' && !claim.is_redeemed) ||
            (statusFilter === 'redeemed' && claim.is_redeemed);

        return matchesSearch && matchesCampaign && matchesStatus;
    }) : [];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-brand-sans font-medium text-sm">
                    Loading store performance data...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 max-w-xl mx-auto my-12 text-center">
                <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg font-brand-outfit">Unable to load dashboard</h3>
                <p className="text-sm text-rose-600 mt-1 mb-4">{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="px-5 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-brand-sans pb-12">
            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black font-brand-outfit text-slate-900 tracking-tight">
                        Welcome back, {user?.company_name || 'Store Manager'} 👋
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Track live player engagement, issue customer vouchers, and verify redemptions.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/campaigns')}
                        className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm font-brand-outfit transition-all shadow-md hover:shadow-amber-500/20 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Create Campaign
                    </button>
                </div>
            </div>

            {/* 4 KPI METRIC SUPERCARD TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* 1. Total Campaigns */}
                <div className="bg-white rounded-[28px] p-6 shadow-supercard border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Total Campaigns
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Layers className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl sm:text-4xl font-black font-brand-outfit text-slate-900 tracking-tight">
                            {campaigns.length}
                        </span>
                        <span className="block text-xs font-bold text-amber-700 mt-1">
                            {activeCampaigns} active currently
                        </span>
                    </div>
                </div>

                {/* 2. Total Customer Claims */}
                <div className="bg-white rounded-[28px] p-6 shadow-supercard border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Total Claims
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Gift className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl sm:text-4xl font-black font-brand-outfit text-slate-900 tracking-tight">
                            {claims.length}
                        </span>
                        <span className="block text-xs font-bold text-slate-400 mt-1">
                            Prizes awarded
                        </span>
                    </div>
                </div>

                {/* 3. Pending Redemptions */}
                <div className="bg-white rounded-[28px] p-6 shadow-supercard border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Pending In-Store
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl sm:text-4xl font-black font-brand-outfit text-amber-600 tracking-tight">
                            {pendingClaimsCount}
                        </span>
                        <span className="block text-xs font-bold text-amber-600 mt-1">
                            Awaiting cashier verification
                        </span>
                    </div>
                </div>

                {/* 4. Redeemed Success */}
                <div className="bg-white rounded-[28px] p-6 shadow-supercard border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Redeemed
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl sm:text-4xl font-black font-brand-outfit text-slate-900 tracking-tight">
                            {redeemedClaimsCount}
                        </span>
                        <span className="block text-xs font-bold text-amber-700 mt-1">
                            Completed vouchers
                        </span>
                    </div>
                </div>
            </div>

            {/* ACTIVE CAMPAIGNS SPOTLIGHT */}
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-supercard border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black font-brand-outfit text-slate-900 tracking-tight">
                            Campaign Hub
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                            Select a campaign to filter customer redemptions below.
                        </p>
                    </div>

                    {selectedCampaign && (
                        <button
                            onClick={() => setSelectedCampaign(null)}
                            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                        >
                            Clear Filter
                        </button>
                    )}
                </div>

                {campaigns.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
                        <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-700 font-brand-outfit">No campaigns active yet</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                            Launch your first interactive reward campaign to start collecting store visits.
                        </p>
                        <button
                            onClick={() => navigate('/campaigns')}
                            className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs font-brand-outfit transition-colors shadow-md"
                        >
                            + Create Campaign
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {campaigns.map((camp) => {
                            const isSelected = selectedCampaign === camp.id;
                            const isExpired = new Date(camp.end_date) < new Date();
                            const campClaims = claims.filter(c => c.campaign_id === camp.id).length;
                            const progressPercent = camp.max_claims > 0 ? Math.min(100, Math.round((campClaims / camp.max_claims) * 100)) : 0;

                            return (
                                <div
                                    key={camp.id}
                                    onClick={() => setSelectedCampaign(isSelected ? null : camp.id)}
                                    className={`rounded-3xl p-5 border transition-all cursor-pointer relative ${
                                        isSelected
                                            ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20'
                                            : 'border-slate-200 hover:border-amber-300 hover:shadow-sm bg-white'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div>
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                isExpired
                                                    ? 'bg-slate-100 text-slate-500'
                                                    : 'bg-amber-100 text-amber-900'
                                            }`}>
                                                {isExpired ? 'Ended' : 'Active'}
                                            </span>
                                            <h3 className="font-extrabold text-base font-brand-outfit text-slate-900 mt-1 truncate max-w-[200px]">
                                                {camp.name}
                                            </h3>
                                        </div>

                                        <span className="text-xs font-bold text-slate-500 capitalize bg-slate-100 px-2.5 py-1 rounded-xl">
                                            {camp.campaign_type}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1.5 my-3">
                                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                                            <span>Claims</span>
                                            <span>{campClaims} / {camp.max_claims || '∞'}</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                                style={{ width: `${camp.max_claims > 0 ? progressPercent : 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                                        <span className="text-slate-400">
                                            Ends {new Date(camp.end_date).toLocaleDateString()}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDownloadModal({
                                                    isOpen: true,
                                                    campaignId: camp.id,
                                                    campaignName: camp.name
                                                });
                                            }}
                                            className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Export
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* LIVE CLAIMS TABLE & VERIFICATION FEED */}
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-supercard border border-slate-100">
                {/* Search & Filter Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-black font-brand-outfit text-slate-900 tracking-tight">
                            Customer Claims & Redemptions
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                            {selectedCampaign 
                                ? `Showing claims for "${campaigns.find(c => c.id === selectedCampaign)?.name}"`
                                : 'All store customer claims'
                            }
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Status Filter Tabs */}
                        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold font-brand-outfit">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-xl transition-all ${
                                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                                }`}
                            >
                                All ({claims.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('pending')}
                                className={`px-3 py-1.5 rounded-xl transition-all ${
                                    statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500'
                                }`}
                            >
                                Pending ({pendingClaimsCount})
                            </button>
                            <button
                                onClick={() => setStatusFilter('redeemed')}
                                className={`px-3 py-1.5 rounded-xl transition-all ${
                                    statusFilter === 'redeemed' ? 'bg-white text-slate-900 font-black shadow-xs' : 'text-slate-500'
                                }`}
                            >
                                Redeemed ({redeemedClaimsCount})
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search customer, code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-60 pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 focus:bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    {filteredClaims.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            No claims match your search filters.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                    <th className="py-3 px-4">Customer</th>
                                    <th className="py-3 px-4">Prize Won</th>
                                    <th className="py-3 px-4">Coupon Code</th>
                                    <th className="py-3 px-4">Claimed At</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Cashier Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                {filteredClaims.map((claim) => (
                                    <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                                                    {claim.user_name ? claim.user_name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-900 block">
                                                        {claim.user_name || 'Anonymous Visitor'}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {claim.user_phone || claim.user_email || 'No phone'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 font-bold text-slate-800">
                                            <div className="flex items-center gap-1.5">
                                                <Gift className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                                <span>{claim.prize_name}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 font-mono font-bold text-amber-800">
                                            {claim.coupon_code || '—'}
                                        </td>

                                        <td className="py-4 px-4 text-slate-500">
                                            {new Date(claim.claimed_at).toLocaleDateString()}
                                            <span className="block text-[11px] text-slate-400">
                                                {new Date(claim.claimed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>

                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                claim.is_redeemed
                                                    ? 'bg-slate-100 text-slate-700'
                                                    : 'bg-amber-100 text-amber-900'
                                            }`}>
                                                {claim.is_redeemed ? (
                                                    <>
                                                        <CheckCircle2 className="w-3 h-3 text-slate-500" /> Redeemed
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="w-3 h-3 text-amber-600" /> Pending
                                                    </>
                                                )}
                                            </span>
                                        </td>

                                        <td className="py-4 px-4 text-right">
                                            {!claim.is_redeemed ? (
                                                <button
                                                    onClick={() => handleMarkRedeemed(claim.id)}
                                                    className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs font-brand-outfit transition-all shadow-sm"
                                                >
                                                    Mark Redeemed ✓
                                                </button>
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-400">
                                                    Completed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* DOWNLOAD SPREADSHEET MODAL */}
            {downloadModal.isOpen && (
                <DownloadModal
                    isOpen={downloadModal.isOpen}
                    onClose={() => setDownloadModal({ isOpen: false, campaignId: null, campaignName: '' })}
                    onDownload={handleDownload}
                    campaignName={downloadModal.campaignName}
                />
            )}
        </div>
    );
};

const DownloadModal = ({ isOpen, onClose, onDownload, campaignName }) => {
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-brand-sans">
            <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-left relative">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                    <Download className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold font-brand-outfit text-slate-900">
                    Export Claims Data
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
                    Download customer claim logs for <strong>{campaignName}</strong> as an Excel spreadsheet.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Start Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            End Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-full bg-slate-100 text-slate-700 font-bold text-xs font-brand-outfit hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => onDownload(dateRange)}
                            className="flex-1 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs font-brand-outfit transition-colors shadow-md"
                        >
                            Download Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
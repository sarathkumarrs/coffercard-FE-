import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    AlertCircle, 
    Phone, 
    Settings, 
    Menu, 
    X, 
    Sparkles, 
    LayoutDashboard, 
    Layers, 
    LogOut, 
    Clock, 
    CheckCircle2
} from 'lucide-react';
import Logo from './Logo';

const RenewalModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center relative font-brand-sans">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
                    <Phone className="w-7 h-7" />
                </div>

                <h3 className="text-xl sm:text-2xl font-black font-brand-outfit text-slate-900 mb-2">
                    Renew Your Subscription
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                    Contact your dedicated account executive to extend your access and keep your in-store rewards running.
                </p>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                        Executive Hotline
                    </p>
                    <a
                        href="tel:7034714831"
                        className="text-2xl font-black font-brand-outfit text-amber-600 hover:text-amber-700 block transition-colors"
                    >
                        7034714831
                    </a>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                        Mon – Sat, 9:00 AM – 6:00 PM
                    </span>
                </div>

                <div className="flex gap-3">
                    <a
                        href="tel:7034714831"
                        className="flex-1 py-3 px-4 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm font-brand-outfit transition-colors shadow-md text-center flex items-center justify-center gap-1.5"
                    >
                        <Phone className="w-4 h-4" /> Call Now
                    </a>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-full bg-slate-100 text-slate-700 font-bold text-sm font-brand-outfit hover:bg-slate-200 transition-colors text-center"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const ExpiredAccessOverlay = ({ accessStatus, onRenewClick, onLogout }) => {
    const isTrial = accessStatus?.status === 'trial_expired';
    const isExpired = accessStatus?.status === 'expired';

    if (!isTrial && !isExpired) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 font-brand-sans">
            <div className="bg-white rounded-[36px] p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-5 border border-rose-100">
                    <AlertCircle className="w-8 h-8" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-black font-brand-outfit text-slate-900 mb-2">
                    {isTrial ? 'Trial Period Ended' : 'Subscription Expired'}
                </h2>

                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    {isTrial
                        ? 'Your 7-day merchant trial has concluded. Activate your active subscription to resume customer games, claims, and analytics.'
                        : 'Your subscription has expired. Please renew to keep your customer QR codes active and maintain live game access.'
                    }
                </p>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                        Executive Hotline
                    </p>
                    <a
                        href="tel:7034714831"
                        className="text-3xl font-black font-brand-outfit text-amber-600 hover:text-amber-700 block mb-1"
                    >
                        7034714831
                    </a>
                    <p className="text-xs text-slate-400">
                        Available Mon–Sat, 9 AM – 6 PM
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onRenewClick}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 py-3.5 px-4 rounded-full transition-colors font-extrabold text-sm font-brand-outfit shadow-md flex items-center justify-center gap-2"
                    >
                        <Phone className="w-4 h-4" />
                        Call to Renew
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex-1 bg-slate-100 text-slate-700 py-3.5 px-4 rounded-full hover:bg-slate-200 transition-colors font-bold text-sm font-brand-outfit"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const shouldShowRenewalWarning = () => {
        if (!user?.access_status) return false;
        const daysLeft = user.access_status.days_left;
        return daysLeft !== null && daysLeft !== undefined && daysLeft < 10 && daysLeft >= 0;
    };

    const getDaysLeftDisplay = () => {
        const daysLeft = user?.access_status?.days_left;
        if (daysLeft === 0) return 'Expires today';
        if (daysLeft === 1) return '1 day left';
        return `${daysLeft} days left`;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-brand-sans text-slate-900 flex flex-col selection:bg-amber-200 selection:text-amber-900">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Left Side: Logo & Main Navigation Pills */}
                        <div className="flex items-center gap-6 sm:gap-8">
                            <Link to="/dashboard">
                                <Logo size="md" />
                            </Link>

                            {/* Desktop Navigation Links */}
                            <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/50">
                                <Link
                                    to="/dashboard"
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold font-brand-outfit transition-all flex items-center gap-1.5 ${
                                        isActive('/dashboard')
                                            ? 'bg-white text-slate-900 shadow-xs font-black'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/campaigns"
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold font-brand-outfit transition-all flex items-center gap-1.5 ${
                                        isActive('/campaigns')
                                            ? 'bg-white text-slate-900 shadow-xs font-black'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                                    Campaigns
                                </Link>
                                <Link
                                    to="/settings"
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold font-brand-outfit transition-all flex items-center gap-1.5 ${
                                        isActive('/settings')
                                            ? 'bg-white text-slate-900 shadow-xs font-black'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <Settings className="w-3.5 h-3.5 text-amber-500" />
                                    Settings
                                </Link>
                            </nav>
                        </div>

                        {/* Right Side: Status Badge, Store Chip & Logout */}
                        <div className="hidden md:flex items-center gap-4">
                            {/* Renewal Warning Pill */}
                            {shouldShowRenewalWarning() && (
                                <button
                                    onClick={() => setIsRenewalModalOpen(true)}
                                    className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-1.5 rounded-full hover:bg-amber-100 transition-colors text-xs font-bold"
                                >
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>{getDaysLeftDisplay()}</span>
                                    <span className="bg-amber-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        Renew
                                    </span>
                                </button>
                            )}

                            {/* Store Profile Badge */}
                            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full">
                                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black uppercase font-brand-outfit">
                                    {user?.company_name ? user.company_name.charAt(0) : 'S'}
                                </div>
                                <span className="text-xs font-bold text-slate-800 max-w-[140px] truncate">
                                    {user?.company_name || 'My Store'}
                                </span>
                            </div>

                            {/* Logout Pill */}
                            <button
                                onClick={handleLogout}
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors"
                                title="Sign out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Mobile Hamburger Button */}
                        <div className="flex md:hidden items-center gap-2">
                            {shouldShowRenewalWarning() && (
                                <button
                                    onClick={() => setIsRenewalModalOpen(true)}
                                    className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold"
                                >
                                    {getDaysLeftDisplay()}
                                </button>
                            )}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2">
                        <Link
                            to="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold font-brand-outfit ${
                                isActive('/dashboard') ? 'bg-amber-50 text-amber-900 font-black' : 'text-slate-700'
                            }`}
                        >
                            <LayoutDashboard className="w-4 h-4 text-amber-600" /> Dashboard
                        </Link>
                        <Link
                            to="/campaigns"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold font-brand-outfit ${
                                isActive('/campaigns') ? 'bg-amber-50 text-amber-900 font-black' : 'text-slate-700'
                            }`}
                        >
                            <Layers className="w-4 h-4 text-amber-600" /> Campaigns
                        </Link>
                        <Link
                            to="/settings"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold font-brand-outfit ${
                                isActive('/settings') ? 'bg-amber-50 text-amber-900 font-black' : 'text-slate-700'
                            }`}
                        >
                            <Settings className="w-4 h-4 text-amber-600" /> Settings
                        </Link>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">
                                {user?.company_name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-xs font-bold text-rose-600 flex items-center gap-1"
                            >
                                <LogOut className="w-3.5 h-3.5" /> Sign out
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Viewport */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <Outlet />
            </main>

            {/* Expired Access Guard Overlay */}
            <ExpiredAccessOverlay
                accessStatus={user?.access_status}
                onRenewClick={() => setIsRenewalModalOpen(true)}
                onLogout={handleLogout}
            />

            {/* Renewal Phone Modal */}
            <RenewalModal
                isOpen={isRenewalModalOpen}
                onClose={() => setIsRenewalModalOpen(false)}
            />
        </div>
    );
};

export default Layout;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    QrCode, 
    Gift, 
    Sparkles, 
    ArrowRight, 
    CheckCircle2, 
    Play, 
    Users, 
    TrendingUp, 
    Heart, 
    Sliders, 
    Share2, 
    Gamepad2, 
    Ticket, 
    ChevronRight,
    Zap,
    Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import Logo, { CoffeeCupIcon } from '../components/Logo';

// Live Demo Games that users can experience directly on their phone or browser
const DEMO_GAMES = [
    {
        id: 'spin-demo',
        code: 'f9b71223-965b-43a2-9879-1534b39c2f98',
        name: 'Summer Lucky Spin & Win',
        type: 'spin',
        tagline: 'Spin the lucky wheel for instant prizes and store discounts'
    },
    {
        id: 'scratch-demo',
        code: '098d6769-7565-471f-b406-12b45b4d7817',
        name: 'Mystery Scratch & Save',
        type: 'scratch',
        tagline: 'Scratch to reveal your instant reward voucher'
    }
];

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [selectedGameIndex, setSelectedGameIndex] = useState(0);

    // Dynamic Live Demo Game
    const activeDemo = DEMO_GAMES[selectedGameIndex];
    const liveDemoUrl = `${window.location.origin}/campaign/${activeDemo.code}`;

    // Switch between random demo games
    const switchRandomGame = () => {
        setSelectedGameIndex((prev) => (prev + 1) % DEMO_GAMES.length);
    };

    const handlePlayLiveGame = () => {
        window.open(`/campaign/${activeDemo.code}`, '_blank');
    };

    // Redirect logged-in users to dashboard
    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-brand-sans font-medium">Loading CofferCard...</p>
                </div>
            </div>
        );
    }

    const featureItems = [
        {
            id: 'qr',
            title: 'QR Code Integration',
            description: 'Generate QR codes for offline campaigns. Bridge physical and digital marketing seamlessly.',
            icon: QrCode,
            badge: 'In-Store Scan',
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-100'
        },
        {
            id: 'instore',
            title: 'In-Store Mode',
            description: 'Perfect for retail locations. Collect customer data with every interaction for better insights.',
            icon: Users,
            badge: 'Point of Sale',
            bg: 'bg-orange-50',
            text: 'text-orange-700',
            border: 'border-orange-100'
        },
        {
            id: 'analytics',
            title: 'Real-Time Analytics',
            description: 'Track engagement, claims, and conversions. Make data-driven decisions with detailed insights.',
            icon: TrendingUp,
            badge: 'Live Insights',
            bg: 'bg-sky-50',
            text: 'text-sky-700',
            border: 'border-sky-100'
        },
        {
            id: 'probability',
            title: 'Smart Probability',
            description: 'Control win rates with precision. Balance excitement with budget using probability-based distribution.',
            icon: Sliders,
            badge: 'Algorithmic',
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            border: 'border-purple-100'
        },
        {
            id: 'prizes',
            title: 'Prize Management',
            description: 'Easily configure prizes, track redemptions, and manage inventory all in one place.',
            icon: Gift,
            badge: 'Inventory Control',
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            border: 'border-rose-100'
        },
        {
            id: 'social',
            title: 'Social Integration',
            description: 'Unlock extra plays with social sharing. Grow your social media presence organically.',
            icon: Share2,
            badge: 'Organic Growth',
            bg: 'bg-indigo-50',
            text: 'text-indigo-700',
            border: 'border-indigo-100'
        }
    ];

    return (
        <div className="min-h-screen bg-[#FAF8F5] font-brand-sans text-slate-900 selection:bg-amber-200 selection:text-amber-950">
            {/* AMBIENT BACKGROUND GLOW (SOFT HONEY & WARM ALABASTER LIGHT) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-32 right-1/4 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-amber-50/50 rounded-full blur-3xl" />
            </div>

            {/* TOP NAVIGATION BAR */}
            <header className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Steaming Coffee Cup with Star Logo */}
                    <div onClick={() => navigate('/')}>
                        <Logo theme="light" size="md" />
                    </div>

                    {/* Middle Nav Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
                            How It Works
                        </a>
                        <a href="#games" className="hover:text-slate-900 transition-colors">
                            Game Formats
                        </a>
                        <a href="#features" className="hover:text-slate-900 transition-colors">
                            Features
                        </a>
                        <a href="#live-experience" className="hover:text-slate-900 transition-colors">
                            Live Game Demo
                        </a>
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl btn-soft-dark text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
                        >
                            <span>Create Campaign</span> <ArrowRight className="w-3.5 h-3.5 text-amber-300 hidden xs:inline" />
                        </button>
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-16 lg:pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* LEFT COLUMN: HERO HEADLINE & CTAS */}
                    <div className="lg:col-span-5 text-left">
                        {/* Pill Badge */}
                        <div className="inline-flex items-center gap-2 bg-amber-50/80 border border-amber-200/60 px-3.5 py-1.5 rounded-full text-amber-900 text-xs font-bold mb-6 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            Gamified In-Store Marketing Platform
                        </div>

                        {/* Title with Soft Amber Highlight on "Winning Moments." */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-brand-outfit tracking-tight leading-[1.08] text-slate-900">
                            Turn Customer<br />
                            Engagement Into<br />
                            <span className="text-[#D97706]">Winning Moments.</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="mt-6 text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                            Create interactive scratch cards, spin-the-wheel campaigns, and instant vouchers that captivate customers, grow your audience, and boost repeat store visits.
                        </p>

                        {/* Action Buttons with Soft Linear Gradient */}
                        <div className="mt-8 flex flex-wrap items-center gap-3.5">
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-8 py-3.5 rounded-full btn-soft-amber font-black text-sm sm:text-base font-brand-outfit flex items-center gap-2.5"
                            >
                                <span>Create Campaign</span>
                                <ArrowRight className="w-4 h-4 stroke-[2.5] text-slate-900" />
                            </button>
                            <button
                                onClick={handlePlayLiveGame}
                                className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm sm:text-base font-brand-outfit transition-all shadow-xs hover:border-slate-300 flex items-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-slate-800 text-slate-800" /> Play Live Demo ({activeDemo.name.split(' ')[0]})
                            </button>
                        </div>

                        {/* Trust Checkmarks */}
                        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-slate-600">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                                <span>Takes 2 minutes to set up</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                                <span>Works on any mobile device</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: 3D PERSPECTIVE DASHBOARD PREVIEW + FLOATING CARDS */}
                    <div className="lg:col-span-7 relative">
                        {/* 1. TOP-LEFT FLOATING CARD: SCRATCH & WIN */}
                        <div className="absolute -top-6 -left-4 sm:-left-8 z-30 animate-float-tilt-left">
                            <div className="bg-white rounded-2xl p-3.5 shadow-sticker border border-purple-100 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[11px] font-black font-brand-outfit text-slate-800 uppercase tracking-wider">
                                        Scratch & Win
                                    </span>
                                    <div className="mt-1 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 font-bold text-[10px] flex items-center gap-1">
                                        🎁 You Won!
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. BOTTOM-LEFT FLOATING CARD: TOTAL CLAIMS METRIC */}
                        <div className="absolute -bottom-8 left-4 sm:left-10 z-30 animate-float-gentle">
                            <div className="bg-white rounded-2xl p-4 shadow-sticker border border-slate-100 text-left w-44">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Total Claims
                                </span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-black font-brand-outfit text-slate-900">
                                        18
                                    </span>
                                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                                        +28%
                                    </span>
                                </div>
                                {/* Mini Bar Chart */}
                                <div className="flex items-end gap-1.5 h-6 mt-2 pt-1 border-t border-slate-100">
                                    <div className="flex-1 bg-amber-200 rounded-t h-2" />
                                    <div className="flex-1 bg-amber-300 rounded-t h-3.5" />
                                    <div className="flex-1 bg-amber-400 rounded-t h-4" />
                                    <div className="flex-1 bg-amber-500 rounded-t h-5" />
                                    <div className="flex-1 bg-amber-600 rounded-t h-6" />
                                </div>
                            </div>
                        </div>

                        {/* 3. RIGHT FLOATING CARD: SPIN & WIN WHEEL */}
                        <div className="absolute -top-4 -right-4 sm:-right-6 z-30 animate-float-tilt-right">
                            <div className="bg-white rounded-2xl p-3.5 shadow-sticker border border-blue-100 text-center w-36">
                                <div className="flex items-center gap-1.5 mb-2 justify-center">
                                    <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                        <TrendingUp className="w-3 h-3" />
                                    </div>
                                    <span className="text-[11px] font-black font-brand-outfit text-slate-800">
                                        Spin & Win
                                    </span>
                                </div>
                                {/* Mini Multi-Color Wheel */}
                                <div className="relative w-20 h-20 mx-auto my-1">
                                    <div className="w-full h-full rounded-full bg-conic-spin shadow-sm border-2 border-white animate-spin-slow" />
                                    <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px]">
                                        🎁
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. BOTTOM-RIGHT FLOATING CARD: ₹100 OFF COUPON */}
                        <div className="absolute -bottom-6 -right-2 sm:-right-6 z-30 animate-float-tilt-left">
                            <div className="bg-white rounded-2xl p-3 shadow-sticker border border-amber-200 text-center w-36">
                                <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-black text-xs font-brand-outfit flex items-center justify-center gap-1">
                                    🎟️ ₹100 OFF
                                </div>
                                <span className="block text-[10px] font-bold text-slate-400 mt-1">
                                    Discount Coupon
                                </span>
                            </div>
                        </div>

                        {/* MAIN DASHBOARD WINDOW MOCKUP */}
                        <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-left">
                            {/* Browser Top Window Bar */}
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                </div>

                                {/* Simulated Mini Navigation */}
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <div className="w-5 h-5 rounded-md border border-slate-300 p-0.5">
                                            <CoffeeCupIcon className="w-full h-full" />
                                        </div>
                                        <span className="font-brand-outfit font-black text-slate-900 text-xs">coffercard</span>
                                    </div>
                                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">Dashboard</span>
                                    <span className="hidden sm:inline-block text-[10px]">Campaigns</span>
                                    <span className="hidden sm:inline-block text-[10px]">Settings</span>
                                </div>

                                <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white px-2 py-1 rounded-full border border-slate-200">
                                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[8px]">D</div>
                                    <span className="hidden sm:inline">Demo_vendor Store</span>
                                </div>
                            </div>

                            {/* Simulated Dashboard Content */}
                            <div className="p-5 sm:p-7 bg-[#FDFBF7] space-y-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black font-brand-outfit text-slate-900">
                                            Welcome back, Demo_vendor Store 👋
                                        </h3>
                                        <p className="text-[11px] text-slate-400">
                                            Track customer engagement and grow your business with gamification.
                                        </p>
                                    </div>
                                    <div className="px-3 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                                        + Create Campaign
                                    </div>
                                </div>

                                {/* 4 Stat Pills */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                                        <span className="text-[10px] font-bold text-slate-400 block">Total Campaigns</span>
                                        <span className="text-lg font-black text-slate-900 font-brand-outfit">5</span>
                                        <span className="text-[9px] text-amber-600 font-bold block">2 active currently</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                                        <span className="text-[10px] font-bold text-slate-400 block">Total Claims</span>
                                        <span className="text-lg font-black text-slate-900 font-brand-outfit">18</span>
                                        <span className="text-[9px] text-rose-500 font-bold block">Prizes awarded</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                                        <span className="text-[10px] font-bold text-slate-400 block">Pending In-Store</span>
                                        <span className="text-lg font-black text-amber-600 font-brand-outfit">13</span>
                                        <span className="text-[9px] text-amber-600 font-bold block">Awaiting verification</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                                        <span className="text-[10px] font-bold text-slate-400 block">Redeemed</span>
                                        <span className="text-lg font-black text-purple-600 font-brand-outfit">5</span>
                                        <span className="text-[9px] text-purple-600 font-bold block">Completed vouchers</span>
                                    </div>
                                </div>

                                {/* Campaign Hub Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold font-brand-outfit text-slate-800">Campaign Hub</span>
                                        <span className="text-[10px] text-slate-400">Select a campaign to manage or view performance</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        <div className="bg-white p-3 rounded-xl border border-amber-400 ring-1 ring-amber-400/20 shadow-xs">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">ACTIVE</span>
                                                <span className="text-slate-400">Scratch</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-900 font-brand-outfit block mt-1">Mystery Scratch & Save</span>
                                            <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
                                                <span>Claims</span>
                                                <span>4 / 500</span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-100 rounded-full mt-1">
                                                <div className="w-1/4 h-full bg-amber-500 rounded-full" />
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">ENDED</span>
                                                <span className="text-slate-400">Spin</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-900 font-brand-outfit block mt-1">Summer Lucky Spin</span>
                                            <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
                                                <span>Claims</span>
                                                <span>13 / 1000</span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-100 rounded-full mt-1">
                                                <div className="w-1/2 h-full bg-indigo-500 rounded-full" />
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hidden sm:block">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">ACTIVE</span>
                                                <span className="text-slate-400">Box</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-900 font-brand-outfit block mt-1">Festival Mystery Box</span>
                                            <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
                                                <span>Claims</span>
                                                <span>25 / 500</span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-100 rounded-full mt-1">
                                                <div className="w-1/3 h-full bg-orange-500 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* "HOW IT WORKS" HORIZONTAL 4-STEP PROCESS (AS SEEN IN MOCKUP) */}
            <section id="how-it-works" className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-3xl sm:rounded-[36px] p-6 sm:p-10 border border-slate-100 shadow-supercard">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Title Col */}
                        <div className="lg:col-span-3 text-left">
                            <h2 className="text-2xl sm:text-3xl font-black font-brand-outfit text-slate-900 tracking-tight">
                                How it works
                            </h2>
                            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                                Launch your campaign in minutes and turn everyday customers into winners.
                            </p>
                        </div>

                        {/* 4 Connected Steps */}
                        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
                            {/* Step 1 */}
                            <div className="flex items-start gap-3 relative">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                                    <QrCode className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-sm font-brand-outfit text-slate-900">1. Scan</h4>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                                        Customers scan a QR code at your store or online.
                                    </p>
                                </div>
                                <ChevronRight className="hidden lg:block w-4 h-4 text-slate-300 absolute -right-2 top-3" />
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start gap-3 relative">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                                    <Gamepad2 className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-sm font-brand-outfit text-slate-900">2. Play</h4>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                                        They play a scratch card, spin the wheel or open a box.
                                    </p>
                                </div>
                                <ChevronRight className="hidden lg:block w-4 h-4 text-slate-300 absolute -right-2 top-3" />
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-start gap-3 relative">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-sm font-brand-outfit text-slate-900">3. Win</h4>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                                        Instantly discover rewards and special offers.
                                    </p>
                                </div>
                                <ChevronRight className="hidden lg:block w-4 h-4 text-slate-300 absolute -right-2 top-3" />
                            </div>

                            {/* Step 4 */}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                                    <Ticket className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-sm font-brand-outfit text-slate-900">4. Redeem</h4>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                                        Use rewards in-store or online checkout.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4 GAME FORMATS ROW (AS SEEN IN MOCKUP) */}
            <section id="games" className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider bg-amber-50/80 px-3.5 py-1.5 rounded-full border border-amber-200/80">
                        Interactive Experiences
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-brand-outfit text-slate-900 tracking-tight mt-3">
                        Choose Your Game Format
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Every game works instantly in mobile browsers without requiring any app install.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
                    {/* 1. Scratch & Win */}
                    <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-supercard hover:shadow-supercard-hover transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div className="w-12 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-xs">
                                    🎟️
                                </div>
                            </div>
                            <h3 className="font-black text-base font-brand-outfit text-slate-900">Scratch & Win</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Fun scratch-off cards that reveal instant prizes and excitement under a foil surface.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                            <button
                                onClick={() => window.open('/campaign/098d6769-7565-471f-b406-12b45b4d7817', '_blank')}
                                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                            >
                                <Play className="w-3 h-3 fill-purple-700" /> Play Demo
                            </button>
                            <button 
                                onClick={() => navigate('/signup')}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors"
                                title="Create Scratch Campaign"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* 2. Spin & Win */}
                    <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-supercard hover:shadow-supercard-hover transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-conic-spin border border-white shadow-xs" />
                            </div>
                            <h3 className="font-black text-base font-brand-outfit text-slate-900">Spin & Win</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Customizable lucky wheels with probability-weighted segments and festive sound effects.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                            <button
                                onClick={() => window.open('/campaign/f9b71223-965b-43a2-9879-1534b39c2f98', '_blank')}
                                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                            >
                                <Play className="w-3 h-3 fill-blue-700" /> Play Demo
                            </button>
                            <button 
                                onClick={() => navigate('/signup')}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"
                                title="Create Spin Campaign"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* 3. Mystery Box */}
                    <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-supercard hover:shadow-supercard-hover transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-sm">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <div className="w-10 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-xs">
                                    🎁
                                </div>
                            </div>
                            <h3 className="font-black text-base font-brand-outfit text-slate-900">Mystery Box</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Let customers tap 3D gift boxes to unwrap surprises, coupons, or instant vouchers.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                            <button
                                onClick={() => window.open('/campaign/d124eaaa-9d57-4d5e-b75c-bcf25a23f048', '_blank')}
                                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                            >
                                <Play className="w-3 h-3 fill-amber-800" /> Play Demo
                            </button>
                            <button 
                                onClick={() => navigate('/signup')}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors"
                                title="Create Mystery Box Campaign"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* 4. Slot Machine */}
                    <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-supercard hover:shadow-supercard-hover transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
                                    <Ticket className="w-5 h-5" />
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">
                                    🎰
                                </div>
                            </div>
                            <h3 className="font-black text-base font-brand-outfit text-slate-900">Slot Machine</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Casino-grade 3-reel slot spinner that pulls customers back for daily lucky spins.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                            <button
                                onClick={() => window.open('/campaign/6588c1e5-ed43-4dba-a6f1-10efd0de95ed', '_blank')}
                                className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
                            >
                                <Play className="w-3 h-3 fill-rose-700" /> Play Demo
                            </button>
                            <button 
                                onClick={() => navigate('/signup')}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors"
                                title="Create Slot Campaign"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOCIAL PROOF / METRICS BAR (AS SEEN IN MOCKUP) */}
            <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className="text-lg sm:text-xl font-black font-brand-outfit text-slate-900 block leading-tight">
                                    500+
                                </span>
                                <span className="text-xs text-slate-500">Businesses trust coffercard</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Gift className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className="text-lg sm:text-xl font-black font-brand-outfit text-slate-900 block leading-tight">
                                    1M+
                                </span>
                                <span className="text-xs text-slate-500">Rewards claimed</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className="text-lg sm:text-xl font-black font-brand-outfit text-slate-900 block leading-tight">
                                    3x
                                </span>
                                <span className="text-xs text-slate-500">Higher customer engagement</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Heart className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className="text-lg sm:text-xl font-black font-brand-outfit text-slate-900 block leading-tight">
                                    90%
                                </span>
                                <span className="text-xs text-slate-500">Would recommend</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6 CORE FEATURES GRID (REQUESTED BY USER) */}
            <section id="features" className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
                        Powerful Marketing Toolkit
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-brand-outfit text-slate-900 tracking-tight mt-3">
                        Everything You Need to Succeed
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base mt-2">
                        Comprehensive features engineered specifically for retail stores, salons, cafés, and local brands.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-left">
                    {featureItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-supercard hover:shadow-supercard-hover transition-all duration-300 flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.border} border flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs`}>
                                            <Icon className={`w-7 h-7 ${item.text}`} />
                                        </div>
                                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-brand-outfit">
                                            {item.badge}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold font-brand-outfit text-slate-900 mb-2.5">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-800">
                                    <span>Learn more</span>
                                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* LIVE EXPERIENCE BANNER WITH SCANNABLE QR & RANDOM GAME SWITCHER */}
            <section id="live-experience" className="relative z-20 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-[36px] sm:rounded-[44px] p-8 sm:p-14 overflow-hidden text-white shadow-2xl border border-slate-800">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7 text-left">
                            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 px-3.5 py-1.5 rounded-full mb-6 text-amber-300 text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Live Interactive Demo
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black font-brand-outfit tracking-tight leading-tight">
                                Try a real live game right now!
                            </h2>
                            <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-lg leading-relaxed">
                                Scan this QR code on your phone camera or click Play in Browser to experience <strong className="text-amber-300">{activeDemo.name}</strong> just like your customers will.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3.5">
                                <button
                                    onClick={handlePlayLiveGame}
                                    className="px-8 py-3.5 rounded-2xl btn-soft-amber font-extrabold text-sm sm:text-base font-brand-outfit flex items-center gap-2"
                                >
                                    <Play className="w-4 h-4 fill-slate-900" /> Play Now in Browser
                                </button>
                                <button
                                    onClick={switchRandomGame}
                                    className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm transition-all flex items-center gap-2"
                                >
                                    🎲 Try Another Game ({selectedGameIndex === 0 ? 'Scratch Card' : 'Spin Wheel'})
                                </button>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                                <span>Active demo campaign loaded: <strong>{activeDemo.name}</strong> ({activeDemo.type.toUpperCase()})</span>
                            </div>
                        </div>

                        {/* Phone Mockup with Live Demo QR */}
                        <div className="lg:col-span-5 flex justify-center">
                            <div className="w-72 sm:w-80 bg-white rounded-[44px] p-5 shadow-2xl border-4 border-slate-700 text-slate-900 text-center relative group">
                                <div className="w-16 h-4 bg-slate-900 rounded-full mx-auto mb-4" />
                                
                                <div className="bg-gradient-to-b from-amber-50/70 to-amber-100/40 rounded-3xl p-5 flex flex-col items-center border border-amber-200/60">
                                    <div className="bg-white p-3.5 rounded-2xl shadow-md border border-amber-100 mb-3 group-hover:scale-105 transition-transform">
                                        <QRCodeSVG
                                            value={liveDemoUrl}
                                            size={175}
                                            level="M"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <span className="text-xs font-black text-slate-900 font-brand-outfit tracking-wider uppercase">
                                        Scan with Phone Camera
                                    </span>
                                    <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] leading-tight">
                                        Instant play on any mobile browser. No app download needed!
                                    </p>
                                    
                                    <button
                                        onClick={handlePlayLiveGame}
                                        className="mt-3 text-xs font-bold text-amber-800 hover:text-amber-900 underline flex items-center gap-1"
                                    >
                                        Direct link to demo →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MINIMALIST FOOTER */}
            <footer className="relative z-20 py-12 border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div onClick={() => navigate('/')}>
                        <Logo theme="light" size="sm" />
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                        <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
                        <a href="#games" className="hover:text-slate-900 transition-colors">Games</a>
                        <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
                        <button onClick={() => navigate('/login')} className="hover:text-slate-900 transition-colors">Sign in</button>
                        <button onClick={() => navigate('/signup')} className="hover:text-slate-900 transition-colors">Partner</button>
                    </div>

                    <p className="text-xs text-slate-400">
                        © 2026 CofferCard. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

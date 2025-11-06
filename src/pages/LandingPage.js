import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Zap, Users, TrendingUp, Sparkles, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    // Redirect logged-in users to dashboard
    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard');
        }
    }, [user, loading, navigate]);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 sm:p-2 rounded-lg">
                                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                CofferCard
                            </span>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base text-gray-700 hover:text-purple-600 font-medium transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center space-x-2 bg-purple-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                        <span className="text-xs sm:text-sm font-medium text-purple-600">Gamified Marketing Platform</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
                        Turn Customer Engagement
                        <br />
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Into Winning Moments
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
                        Create interactive scratch cards and spin-the-wheel campaigns that captivate your customers,
                        grow your audience, and drive real results.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold text-base sm:text-lg shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
                        >
                            Start Free Trial
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-base sm:text-lg border-2 border-gray-200 hover:border-purple-300 transition-all"
                        >
                            View Demo
                        </button>
                    </div>

                    {/* Hero Illustration */}
                    <div className="mt-12 sm:mt-16 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 blur-3xl"></div>
                        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-4xl mx-auto border border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-left">
                                    <div className="bg-purple-600 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Scratch Cards</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">Interactive scratch-off games that reveal instant prizes</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-left">
                                    <div className="bg-blue-600 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Spin & Win</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">Exciting wheel spinner with customizable prizes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600">
                            Powerful features designed for modern marketers
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* Feature 1 */}
                        <div className="bg-gradient-to-br from-purple-50 to-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-purple-100 hover:shadow-xl transition-shadow">
                            <div className="bg-purple-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                                <QrCode className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">QR Code Integration</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Generate QR codes for offline campaigns. Bridge physical and digital marketing seamlessly.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-blue-100 hover:shadow-xl transition-shadow">
                            <div className="bg-blue-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">In-Store Mode</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Perfect for retail locations. Collect customer data with every interaction for better insights.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-gradient-to-br from-green-50 to-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-green-100 hover:shadow-xl transition-shadow">
                            <div className="bg-green-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Real-Time Analytics</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Track engagement, claims, and conversions. Make data-driven decisions with detailed insights.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-gradient-to-br from-orange-50 to-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-orange-100 hover:shadow-xl transition-shadow">
                            <div className="bg-orange-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Smart Probability</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Control win rates with precision. Balance excitement with budget using probability-based distribution.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-gradient-to-br from-pink-50 to-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-pink-100 hover:shadow-xl transition-shadow">
                            <div className="bg-pink-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                                <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Prize Management</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Easily configure prizes, track redemptions, and manage inventory all in one place.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-indigo-100 hover:shadow-xl transition-shadow">
                            <div className="bg-indigo-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Social Integration</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Unlock extra plays with social sharing. Grow your social media presence organically.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                            Ready to Transform Your Marketing?
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-6 sm:mb-8">
                            Join hundreds of businesses creating unforgettable customer experiences
                        </p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-50 font-bold text-base sm:text-lg shadow-xl transition-all transform hover:scale-105"
                        >
                            Create Your First Campaign
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                            <Gift className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">CofferCard</span>
                    </div>
                    <p className="text-sm">
                        Gamified marketing platform for modern businesses
                    </p>
                    <p className="text-xs mt-4">
                        © 2024 CofferCard. All rights reserved.
                    </p>
                    <p className="text-xs mt-4">
  © Owned and managed by{" "}
  <a
    href="https://infobuddha.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 hover:underline"
  >
    Infobuddha Technologies
  </a>
</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

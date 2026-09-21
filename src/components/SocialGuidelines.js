import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Instagram, Facebook } from 'lucide-react';

const SocialGuidelines = ({ campaign, onComplete }) => {
    const [socialClicks, setSocialClicks] = useState({
        instagram: false,
        facebook: false
    });
    const [animating, setAnimating] = useState('');

    const handleSocialClick = (platform) => {
        setAnimating(platform);
        setTimeout(() => {
            setSocialClicks(prev => ({
                ...prev,
                [platform]: true
            }));
            setAnimating('');
        }, 500);
    };

    // Helper function to ensure URL has proper protocol
    const ensureProtocol = (url) => {
        if (!url) return '';
        if (url.match(/^https?:\/\//i)) {
            return url;
        }
        return `https://${url}`;
    };

    const defaultGuidelines = [
        'Follow our official social pages to unlock your play.',
        'Complete the game challenge to win exclusive prizes and rewards.',
        'Present your winning voucher code or barcode to redeem!'
    ];

    const rawGuidelines = (campaign?.guidelines || '')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    const guidelines = rawGuidelines.length > 0 ? rawGuidelines : defaultGuidelines;

    const hasInstagram = !!campaign?.instagram_link;
    const hasFacebook = !!campaign?.facebook_link;

    // Only require clicks for the social media links that are actually provided
    const allRequiredSocialsClicked =
        (!hasInstagram || socialClicks.instagram) &&
        (!hasFacebook || socialClicks.facebook);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white py-10 px-4 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-xl mx-auto relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-amber-300 mb-3 shadow-sm">
                        <Sparkles size={14} className="text-amber-400" />
                        <span>VIP Campaign Unlock</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                        {campaign?.name || "Let's Play & Win"}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto">
                        Complete these quick steps to unlock your chance to win instant rewards!
                    </p>
                </div>

                {/* Guidelines Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl mb-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                        Campaign Guidelines
                    </h2>
                    <ol className="space-y-3">
                        {guidelines.map((guideline, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-slate-200">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 font-bold text-xs flex items-center justify-center mt-0.5">
                                    {index + 1}
                                </span>
                                <span className="flex-1 leading-relaxed">{guideline}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Social Media Action Buttons */}
                <div className="space-y-3.5">
                    {hasInstagram && (
                        <a
                            href={ensureProtocol(campaign.instagram_link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleSocialClick('instagram')}
                            className={`
                                w-full py-4 px-6 rounded-2xl flex items-center justify-between
                                border backdrop-blur-md transition-all duration-300 shadow-lg
                                ${socialClicks.instagram
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : 'bg-gradient-to-r from-pink-600/80 to-purple-600/80 border-pink-400/30 text-white hover:brightness-110 hover:scale-[1.01]'}
                                ${animating === 'instagram' ? 'scale-105' : ''}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Instagram size={22} className={socialClicks.instagram ? 'text-emerald-400' : 'text-pink-200'} />
                                <span className="font-bold text-sm sm:text-base">
                                    {socialClicks.instagram ? 'Followed on Instagram' : 'Follow on Instagram'}
                                </span>
                            </div>
                            {socialClicks.instagram ? (
                                <CheckCircle2 size={20} className="text-emerald-400" />
                            ) : (
                                <ArrowRight size={18} className="text-white/70" />
                            )}
                        </a>
                    )}

                    {hasFacebook && (
                        <a
                            href={ensureProtocol(campaign.facebook_link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleSocialClick('facebook')}
                            className={`
                                w-full py-4 px-6 rounded-2xl flex items-center justify-between
                                border backdrop-blur-md transition-all duration-300 shadow-lg
                                ${socialClicks.facebook
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : 'bg-gradient-to-r from-blue-600/80 to-indigo-600/80 border-blue-400/30 text-white hover:brightness-110 hover:scale-[1.01]'}
                                ${animating === 'facebook' ? 'scale-105' : ''}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Facebook size={22} className={socialClicks.facebook ? 'text-emerald-400' : 'text-blue-200'} />
                                <span className="font-bold text-sm sm:text-base">
                                    {socialClicks.facebook ? 'Followed on Facebook' : 'Follow on Facebook'}
                                </span>
                            </div>
                            {socialClicks.facebook ? (
                                <CheckCircle2 size={20} className="text-emerald-400" />
                            ) : (
                                <ArrowRight size={18} className="text-white/70" />
                            )}
                        </a>
                    )}

                    {/* Start Game Action Button */}
                    <button
                        onClick={onComplete}
                        disabled={!allRequiredSocialsClicked}
                        className={`
                            w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg
                            flex items-center justify-center gap-2 shadow-xl transition-all duration-300
                            ${allRequiredSocialsClicked
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-105 hover:scale-[1.01] active:scale-95 cursor-pointer ring-4 ring-amber-400/30'
                                : 'bg-white/10 text-slate-400 border border-white/10 cursor-not-allowed'}
                        `}
                    >
                        {allRequiredSocialsClicked ? (
                            <>
                                <span>🎮 Start Game Now</span>
                                <ArrowRight size={20} />
                            </>
                        ) : (
                            <span>Follow to Unlock Game</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SocialGuidelines;
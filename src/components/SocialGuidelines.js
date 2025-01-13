import React, { useState } from 'react';

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
            setAnimating(''); // Reset animation state
        }, 500);
    };

    const guidelines = campaign.guidelines.split('\n').filter(line => line.trim());

    return (
        <div className="min-h-screen bg-[#ffff00] py-12 px-4"> {/* Bright yellow background */}
            <div className="max-w-3xl mx-auto">
                {/* Company Logo */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        {/* <img 
                            src={campaign.vendor.logo} 
                            alt="Company Logo" 
                            className="h-20 w-auto"
                        /> */}
                        <img 
                            src="https://play.alusoodcargo.com/wp-content/uploads/2024/09/cropped-2.png" 
                            alt="Company Logo" 
                            className="h-20 w-auto"
                        />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-[#ff1744] text-center mb-12"> {/* Bright red text */}
                    Let's Play!
                </h1>

                {/* Guidelines */}
                <div className="bg-white rounded-xl shadow-xl p-8 mb-12 relative">
                    <div className="absolute -top-2 left-4 flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff1744]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffff00]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#2196f3]"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#ff1744] mb-6">
                        Follow These Steps
                    </h2>
                    <ol className="text-gray-800 space-y-4">
                        {guidelines.map((guideline, index) => (
                            <li key={index} className="flex items-start">
                                <span className="mr-3 font-bold text-[#ff1744]">{index + 1}.</span>
                                <span>{guideline}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Social Media Buttons */}
                <div className="space-y-4">
                    {campaign.instagram_link && (
                        <a
                            href={campaign.instagram_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleSocialClick('instagram')}
                            className={`
                                w-full bg-white text-[#ff1744] py-4 px-6 rounded-xl 
                                flex items-center justify-center space-x-2 
                                shadow-lg font-bold text-lg
                                transform transition-all duration-300
                                ${socialClicks.instagram ? 'bg-green-100 text-green-600' : 'hover:bg-gray-50'}
                                ${animating === 'instagram' ? 'animate-bounce scale-105' : ''}
                                ${socialClicks.instagram ? 'cursor-default' : 'hover:scale-105'}
                            `}
                        >
                            <span className="flex items-center">
                                {socialClicks.instagram ? (
                                    <>
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Followed
                                    </>
                                ) : (
                                    'Follow on Instagram'
                                )}
                            </span>
                        </a>
                    )}
                    
                    {campaign.facebook_link && (
                        <a
                            href={campaign.facebook_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleSocialClick('facebook')}
                            className={`
                                w-full bg-white text-[#ff1744] py-4 px-6 rounded-xl 
                                flex items-center justify-center space-x-2 
                                shadow-lg font-bold text-lg
                                transform transition-all duration-300
                                ${socialClicks.facebook ? 'bg-green-100 text-green-600' : 'hover:bg-gray-50'}
                                ${animating === 'facebook' ? 'animate-bounce scale-105' : ''}
                                ${socialClicks.facebook ? 'cursor-default' : 'hover:scale-105'}
                            `}
                        >
                            <span className="flex items-center">
                                {socialClicks.facebook ? (
                                    <>
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Followed
                                    </>
                                ) : (
                                    'Follow on Facebook'
                                )}
                            </span>
                        </a>
                    )}

                    <button
                        onClick={onComplete}
                        disabled={!socialClicks.instagram || !socialClicks.facebook}
                        className={`
                            w-full py-4 px-6 rounded-xl 
                            flex items-center justify-center space-x-2 
                            shadow-lg font-bold text-lg
                            transform transition-all duration-500
                            ${(socialClicks.instagram && socialClicks.facebook)
                                ? 'bg-[#ff1744] text-white hover:bg-[#ff1744]/90 hover:scale-105 animate-pulse'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                        `}
                    >
                        {socialClicks.instagram && socialClicks.facebook ? (
                            <span className="flex items-center">
                                <span className="animate-bounce">🎮</span>
                                <span className="mx-2">Start Game</span>
                                <span className="animate-bounce">🎮</span>
                            </span>
                        ) : (
                            'Start Game'
                        )}
                    </button>
                </div>

                {/* Decorative elements */}
                <div className="fixed bottom-10 right-10 w-32 h-32 bg-[#ff1744] rounded-lg transform rotate-12 opacity-50"></div>
                <div className="fixed top-10 left-10 w-24 h-24 bg-[#ff1744] rounded-full transform -rotate-12 opacity-50"></div>
            </div>
        </div>
    );
};

export default SocialGuidelines;
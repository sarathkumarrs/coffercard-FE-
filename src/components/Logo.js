import React from 'react';

/**
 * CofferCard Official Brand Logo Component
 * Steaming Coffee Cup with Star & Rays in Soft Golden Squircle
 * Derived from Official Brand Identity Sheet (media_1791309210015.png)
 */
export const CoffeeCupIcon = ({ className = "w-6 h-6", monochrome = false }) => {
    return (
        <svg 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className={className}
        >
            <defs>
                <linearGradient id="brandGoldSquircle" x1="8" y1="16" x2="84" y2="92" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="50%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
            </defs>

            {/* 2 Playful Rays at Top-Right */}
            <line 
                x1="81" 
                y1="18" 
                x2="86" 
                y2="9" 
                stroke={monochrome ? "#64748B" : "#10B981"} 
                strokeWidth="5" 
                strokeLinecap="round" 
            />
            <line 
                x1="86" 
                y1="26" 
                x2="95" 
                y2="22" 
                stroke={monochrome ? "#64748B" : "#10B981"} 
                strokeWidth="5" 
                strokeLinecap="round" 
            />

            {/* Squircle Base with Soft Golden Honey Gradient */}
            <rect 
                x="8" 
                y="16" 
                width="76" 
                height="76" 
                rx="24" 
                fill={monochrome ? "#E2E8F0" : "url(#brandGoldSquircle)"} 
            />

            {/* 3 Vertical Steam Capsules */}
            <rect x="33.5" y="29" width="4.5" height="11" rx="2.25" fill="#0F172A" />
            <rect x="42.5" y="29" width="4.5" height="11" rx="2.25" fill="#0F172A" />
            <rect x="51.5" y="29" width="4.5" height="11" rx="2.25" fill="#0F172A" />

            {/* Coffee Cup Bowl */}
            <path d="M26 44H64C64 44 62 65 54 67H36C28 65 26 44 26 44Z" fill="#0F172A" />

            {/* Cup Handle */}
            <path 
                d="M64 48C70.5 48 73.5 52 72.5 58C71.5 63 67 64 63 63" 
                stroke="#0F172A" 
                strokeWidth="4.5" 
                strokeLinecap="round" 
            />

            {/* Star Knockout inside Cup */}
            <path 
                d="M45 50.5L46.8 54.2L50.9 54.8L47.9 57.7L48.6 61.8L45 59.9L41.4 61.8L42.1 57.7L39.1 54.8L43.2 54.2Z" 
                fill={monochrome ? "#E2E8F0" : "#FCD34D"} 
            />

            {/* Saucer Base */}
            <rect x="24" y="71" width="42" height="4.5" rx="2.25" fill="#0F172A" />
        </svg>
    );
};

const Logo = ({ size = "md", theme = "light", showText = true, monochrome = false, className = "" }) => {
    const isDark = theme === "dark";

    const iconSizes = {
        sm: "w-9 h-9 sm:w-11 sm:h-11",
        md: "w-11 h-11 sm:w-12 sm:h-12",
        lg: "w-14 h-14 sm:w-16 sm:h-16"
    };

    const textSizes = {
        sm: "text-xl sm:text-2xl font-black",
        md: "text-2xl sm:text-[26px] lg:text-[28px] font-black tracking-tight",
        lg: "text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight"
    };

    return (
        <div className={`flex items-center gap-2.5 cursor-pointer group flex-shrink-0 ${className}`}>
            <div className={`flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0 ${iconSizes[size] || iconSizes.md}`}>
                <CoffeeCupIcon className="w-full h-full drop-shadow-xs" monochrome={monochrome} />
            </div>
            {showText && (
                <span className={`font-brand-outfit tracking-tight select-none ${
                    isDark ? "text-white" : "text-[#0F172A]"
                } ${textSizes[size] || textSizes.md}`}>
                    coffercard
                </span>
            )}
        </div>
    );
};

export default Logo;

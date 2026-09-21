import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
    QrCode, 
    Globe, 
    Eye, 
    Copy, 
    Check, 
    ExternalLink, 
    Download, 
    Code, 
    Sparkles, 
    Smartphone, 
    X,
    Layers,
    Clock,
    MousePointerClick
} from 'lucide-react';

const CampaignIntegrationModal = ({ campaign, onClose }) => {
    const [activeTab, setActiveTab] = useState('website'); // 'website' | 'qr' | 'preview'
    const [displayStyle, setDisplayStyle] = useState('bubble'); // 'bubble' | 'auto' | 'exit-intent' | 'iframe'
    const [position, setPosition] = useState('bottom-right');
    const [themeColor, setThemeColor] = useState('#4F46E5');
    const [buttonText, setButtonText] = useState(
        campaign.campaign_type === 'spin' ? '🎁 Spin & Win!' :
        campaign.campaign_type === 'slot' ? '🎰 Jackpot Spin!' :
        campaign.campaign_type === 'box' ? '🎁 Open Lucky Box!' :
        '✨ Scratch & Win!'
    );
    const [selectedPlatform, setSelectedPlatform] = useState('shopify'); // 'shopify' | 'wordpress' | 'wix' | 'custom'
    const [copied, setCopied] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(true);
    const [previewDevice, setPreviewDevice] = useState('mobile'); // 'mobile' | 'desktop'
    const [previewKey, setPreviewKey] = useState(Date.now());
    const qrRef = useRef(null);

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const [embedEnv, setEmbedEnv] = useState(isLocalhost ? 'local' : 'production');

    // Extract real UUID or fallback to ID
    const getCampaignCode = () => {
        if (campaign.unique_code) return String(campaign.unique_code);
        if (campaign.public_url) {
            const clean = campaign.public_url.replace('/campaign/', '').replace('/', '').trim();
            if (clean) return clean;
        }
        return String(campaign.id);
    };
    const campaignCode = getCampaignCode();

    const hostOrigin = embedEnv === 'local' ? window.location.origin : 'https://coffercard.com';
    const campaignUrl = `${hostOrigin}/campaign/${campaignCode}`;

    // Generate Embed Code snippet based on vendor options
    const getEmbedSnippet = () => {
        if (displayStyle === 'iframe') {
            return `<!-- CofferCard Gamification Iframe Embed -->\n<iframe \n  src="${hostOrigin}/campaign/${campaignCode}?embed=true"\n  width="100%"\n  height="650px"\n  frameborder="0"\n  style="border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"\n  allow="camera; accelerometer; gyroscope">\n</iframe>`;
        }

        const hostAttr = embedEnv === 'local' ? `\n  data-host="${hostOrigin}"` : '';

        return `<!-- CofferCard Gamification Widget -->\n<script\n  src="${hostOrigin}/widget.js"\n  data-campaign="${campaignCode}"${hostAttr}\n  data-trigger="${displayStyle}"\n  data-position="${position}"\n  data-theme-color="${themeColor}"\n  data-button-text="${buttonText}"\n  async>\n</script>`;
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQR = (format) => {
        const svg = qrRef.current;
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const a = document.createElement("a");
            a.download = `${campaign.name}_qr.${format}`;
            if (format === 'svg') {
                const blob = new Blob([svgData], { type: 'image/svg+xml' });
                a.href = URL.createObjectURL(blob);
            } else {
                a.href = canvas.toDataURL("image/png");
            }
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Sparkles size={18} />
                            </span>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                Launch & Integrate Campaign
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {campaign.name} • <span className="capitalize font-medium text-indigo-600">{campaign.campaign_type} Game</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex border-b border-gray-200 px-6 bg-white gap-2">
                    <button
                        onClick={() => setActiveTab('website')}
                        className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
                            activeTab === 'website'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <Globe size={17} />
                        Website Integration
                        <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            Online
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('qr')}
                        className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
                            activeTab === 'qr'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <QrCode size={17} />
                        In-Store QR Code
                        <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            Physical
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
                            activeTab === 'preview'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <Eye size={17} />
                        Live Preview
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* ======================================================== */}
                    {/* TAB 1: WEBSITE INTEGRATION */}
                    {/* ======================================================== */}
                    {activeTab === 'website' && (
                        <div className="space-y-6">
                            {/* Environment Selector */}
                            <div className="p-3.5 bg-indigo-50/80 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                                        🎯 Target Integration Domain:
                                    </span>
                                    <p className="text-[11px] text-indigo-700 mt-0.5">
                                        {embedEnv === 'local'
                                            ? `Configured for local testing on ${window.location.host}`
                                            : 'Configured for live website deployment on coffercard.com'}
                                    </p>
                                </div>
                                <div className="inline-flex bg-white p-1 rounded-lg border border-indigo-200 self-start sm:self-auto shadow-xs">
                                    <button
                                        type="button"
                                        onClick={() => setEmbedEnv('local')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                            embedEnv === 'local'
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        💻 Localhost ({window.location.host})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEmbedEnv('production')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                            embedEnv === 'production'
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        🚀 Live (coffercard.com)
                                    </button>
                                </div>
                            </div>

                            {/* Step 1: Display Style */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                                    1. Choose Display Type
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setDisplayStyle('bubble')}
                                        className={`p-3.5 rounded-xl border text-left transition-all ${
                                            displayStyle === 'bubble'
                                                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 mb-1">
                                            <MousePointerClick size={16} className="text-indigo-600" />
                                            Floating Bubble
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            A stylish launcher button in the corner that opens on click.
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDisplayStyle('auto')}
                                        className={`p-3.5 rounded-xl border text-left transition-all ${
                                            displayStyle === 'auto'
                                                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 mb-1">
                                            <Clock size={16} className="text-indigo-600" />
                                            Timed Auto-Popup
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Automatically pops up after 5 seconds to capture visitor attention.
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDisplayStyle('iframe')}
                                        className={`p-3.5 rounded-xl border text-left transition-all ${
                                            displayStyle === 'iframe'
                                                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 mb-1">
                                            <Layers size={16} className="text-indigo-600" />
                                            Inline Iframe
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Embeds seamlessly inside any existing page or blog section.
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* Widget Customization Controls (if not plain iframe) */}
                            {displayStyle !== 'iframe' && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                            Launcher Position
                                        </label>
                                        <select
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            className="w-full text-xs font-medium bg-white border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="bottom-right">Bottom Right (Recommended)</option>
                                            <option value="bottom-left">Bottom Left</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                            Theme Color
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={themeColor}
                                                onChange={(e) => setThemeColor(e.target.value)}
                                                className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-white"
                                            />
                                            <span className="text-xs font-mono text-gray-600 uppercase">
                                                {themeColor}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                            Button Text
                                        </label>
                                        <input
                                            type="text"
                                            value={buttonText}
                                            onChange={(e) => setButtonText(e.target.value)}
                                            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Website Platform Selection */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                                    2. Choose Your Website Platform
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {[
                                        { id: 'shopify', label: 'Shopify', icon: '🛍️' },
                                        { id: 'wordpress', label: 'WordPress', icon: '🌐' },
                                        { id: 'wix', label: 'Wix / Webflow', icon: '🎨' },
                                        { id: 'custom', label: 'Custom HTML', icon: '💻' },
                                    ].map((plat) => (
                                        <button
                                            key={plat.id}
                                            type="button"
                                            onClick={() => setSelectedPlatform(plat.id)}
                                            className={`py-2 px-3 rounded-lg border font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
                                                selectedPlatform === plat.id
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span>{plat.icon}</span>
                                            <span>{plat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Platform-Specific Step-by-Step Instructions */}
                            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                                {selectedPlatform === 'shopify' && (
                                    <p>
                                        <strong>Shopify Instructions:</strong> Go to <strong>Shopify Admin</strong> &rarr; <strong>Online Store</strong> &rarr; <strong>Themes</strong> &rarr; click <strong>Edit code</strong> on your active theme. Open <code>layout/theme.liquid</code> and paste the code snippet below right before <code>&lt;/body&gt;</code>.
                                    </p>
                                )}
                                {selectedPlatform === 'wordpress' && (
                                    <p>
                                        <strong>WordPress / WooCommerce Instructions:</strong> In your WP Admin, install the free plugin <em>WPCode (Insert Headers and Footers)</em> &rarr; Add Snippet &rarr; paste the code below into the <strong>Footer</strong> section &rarr; Save.
                                    </p>
                                )}
                                {selectedPlatform === 'wix' && (
                                    <p>
                                        <strong>Wix / Webflow Instructions:</strong> Add an <strong>Embed Code (HTML iframe)</strong> element or go to Settings &rarr; Custom Code &rarr; Add Custom Code &rarr; Paste snippet to <strong>Body - end</strong>.
                                    </p>
                                )}
                                {selectedPlatform === 'custom' && (
                                    <p>
                                        <strong>Custom Website Instructions:</strong> Paste this one-line script snippet into your HTML right before the closing <code>&lt;/body&gt;</code> tag on the pages where you want the game to appear.
                                    </p>
                                )}
                            </div>

                            {/* Step 3: Embed Code Snippet Block */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        3. Copy Embed Code
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(getEmbedSnippet())}
                                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                                            copied
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                        }`}
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        {copied ? 'Copied to Clipboard!' : 'Copy Snippet'}
                                    </button>
                                </div>
                                <div className="relative">
                                    <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-gray-800">
                                        <code>{getEmbedSnippet()}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* TAB 2: IN-STORE QR CODE */}
                    {/* ======================================================== */}
                    {activeTab === 'qr' && (
                        <div className="flex flex-col items-center py-2 space-y-6">
                            <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center">
                                <QRCodeSVG
                                    value={campaignUrl}
                                    size={240}
                                    ref={qrRef}
                                    level="H"
                                    includeMargin={true}
                                />
                                <span className="mt-2 text-xs font-semibold text-gray-500 tracking-wider uppercase">
                                    Scan to Play Instantly
                                </span>
                            </div>

                            {/* Download Buttons */}
                            <div className="flex flex-wrap justify-center gap-3 w-full max-w-sm">
                                <button
                                    onClick={() => downloadQR('png')}
                                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    <Download size={15} />
                                    Download PNG
                                </button>
                                <button
                                    onClick={() => downloadQR('svg')}
                                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                    <Download size={15} />
                                    Download SVG
                                </button>
                            </div>

                            {/* Campaign URL Block */}
                            <div className="w-full max-w-md bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Direct Shareable URL:
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={campaignUrl}
                                        readOnly
                                        className="flex-1 p-2 text-xs bg-white rounded-lg border border-gray-200 font-mono text-gray-700"
                                    />
                                    <button
                                        onClick={() => handleCopy(campaignUrl)}
                                        className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                                        title="Copy Link"
                                    >
                                        {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                                    </button>
                                    <a
                                        href={campaignUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                                        title="Test Link"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                            </div>

                            {/* Retail Tips Card */}
                            <div className="w-full max-w-md p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
                                💡 <strong>Physical Store Tip:</strong> Print this QR code on table tents, cashier counter stands, or customer receipts. Customers scan with their phone camera and play instantly with <strong>no app download required</strong>.
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* TAB 3: LIVE PREVIEW */}
                    {/* ======================================================== */}
                    {activeTab === 'preview' && (
                        <div className="space-y-4">
                            {/* Device & Controls Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-700">Preview Device:</span>
                                    <div className="inline-flex bg-white p-1 rounded-lg border border-gray-200 shadow-xs">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewDevice('mobile')}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                previewDevice === 'mobile'
                                                    ? 'bg-indigo-600 text-white shadow-xs'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <Smartphone size={14} />
                                            Mobile (iPhone)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewDevice('desktop')}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                previewDevice === 'desktop'
                                                    ? 'bg-indigo-600 text-white shadow-xs'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <Globe size={14} />
                                            Desktop Web
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewKey(Date.now())}
                                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                                        title="Restart and test game from beginning"
                                    >
                                        🔄 Reset Game
                                    </button>
                                    <a
                                        href={campaignUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                                    >
                                        <ExternalLink size={13} />
                                        Full Page ↗
                                    </a>
                                </div>
                            </div>

                            {/* Playable Interactive Viewport */}
                            <div className="flex justify-center items-center py-2">
                                {previewDevice === 'mobile' ? (
                                    /* 📱 iPhone Mockup Frame */
                                    <div className="relative w-[320px] sm:w-[360px] h-[600px] bg-slate-950 rounded-[42px] p-3.5 shadow-2xl border-4 border-slate-700 ring-1 ring-white/10 flex flex-col items-center">
                                        {/* Dynamic Island / Notch */}
                                        <div className="w-24 h-4 bg-black rounded-full mb-2 flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2"></div>
                                            <div className="w-2 h-2 rounded-full bg-blue-950"></div>
                                        </div>

                                        {/* Screen Viewport with live interactive iframe */}
                                        <div className="relative w-full flex-1 bg-white rounded-[30px] overflow-hidden shadow-inner">
                                            <iframe
                                                key={`mobile-${previewKey}`}
                                                src={`${campaignUrl}?embed=true&t=${previewKey}`}
                                                title="Mobile Interactive Preview"
                                                className="w-full h-full border-none"
                                                allow="camera; accelerometer; gyroscope; web-share; clipboard-write"
                                            />
                                        </div>

                                        {/* Bottom Home Indicator */}
                                        <div className="w-28 h-1 bg-white/40 rounded-full mt-2"></div>
                                    </div>
                                ) : (
                                    /* 💻 Desktop Browser Mockup Frame */
                                    <div className="w-full h-[540px] bg-slate-100 rounded-2xl border border-gray-300 shadow-xl overflow-hidden flex flex-col">
                                        {/* Browser Toolbar */}
                                        <div className="h-9 bg-slate-200 border-b border-gray-300 flex items-center px-3 gap-2">
                                            <div className="flex gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
                                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
                                                <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block"></span>
                                            </div>
                                            <div className="flex-1 bg-white rounded-md text-[11px] text-gray-500 px-3 py-0.5 font-mono text-center truncate shadow-xs">
                                                {campaignUrl}
                                            </div>
                                        </div>

                                        {/* Live Browser Content */}
                                        <div className="flex-1 bg-white overflow-hidden relative">
                                            <iframe
                                                key={`desktop-${previewKey}`}
                                                src={`${campaignUrl}?embed=true&t=${previewKey}`}
                                                title="Desktop Interactive Preview"
                                                className="w-full h-full border-none"
                                                allow="camera; accelerometer; gyroscope; web-share; clipboard-write"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-[11px] text-gray-400 text-center">
                                💡 <strong>Interactive Sandbox:</strong> You can spin, pull, scratch, and test winning rewards directly above. Click "Reset Game" to restart at any time.
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 px-6 py-3.5 border-t border-gray-100 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Close
                    </button>
                    {activeTab === 'website' && (
                        <button
                            type="button"
                            onClick={() => handleCopy(getEmbedSnippet())}
                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied Code!' : 'Copy Embed Code'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CampaignIntegrationModal;

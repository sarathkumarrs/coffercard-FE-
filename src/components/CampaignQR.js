// import React from 'react';
// import { QRCodeSVG } from 'qrcode.react';

// const CampaignQR = ({ url }) => {
//     return (
//         <div className="flex flex-col items-center p-4 bg-white rounded shadow">
//             <QRCodeSVG value={`http://localhost:1234${url}`} size={200} />
//             <p className="mt-2 text-sm text-gray-600">Scan to participate</p>
//             <a 
//                 href={url} 
//                 target="_blank" 
//                 rel="noopener noreferrer" 
//                 className="mt-2 text-blue-500 hover:text-blue-700"
//             >
//                 Open URL
//             </a>
//         </div>
//     );
// };

// export default CampaignQR;




import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const CampaignQR = ({ url, campaignName }) => {
    const qrRef = useRef(null);

    const downloadQR = (format) => {
        const canvas = document.createElement("canvas");
        const svg = qrRef.current;
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            // Create download link
            const a = document.createElement("a");
            a.download = `${campaignName}_qr.${format}`;
            
            if (format === 'svg') {
                // For SVG download
                const blob = new Blob([svgData], { type: 'image/svg+xml' });
                a.href = URL.createObjectURL(blob);
            } else {
                // For PNG download
                a.href = canvas.toDataURL("image/png");
            }
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg">
            <div className="bg-white p-4 rounded-lg shadow">
                <QRCodeSVG 
                    value={`https://coffercard.com${url}`}
                    size={300}
                    ref={qrRef}
                    level="H"
                    includeMargin={true}
                />
            </div>
            
            <p className="mt-4 text-sm text-gray-600">Scan to participate</p>
            
            <div className="mt-6 space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Download QR Code:</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => downloadQR('png')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
                    >
                        Download PNG
                    </button>
                    <button
                        onClick={() => downloadQR('svg')}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
                    >
                        Download SVG
                    </button>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t w-full">
                <p className="text-sm text-gray-600 mb-2">Campaign URL:</p>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={`https://coffercard.com${url}`}
                        readOnly
                        className="p-2 text-sm bg-gray-50 rounded border flex-1"
                    />
                    <a 
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm whitespace-nowrap"
                    >
                        Open URL
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CampaignQR;

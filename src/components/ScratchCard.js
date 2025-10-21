// src/components/ScratchCard.js
import React, { useRef, useEffect, useState } from 'react';

const ScratchCard = ({ prize, onReveal }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPoint, setLastPoint] = useState(null);
    const [percentScratched, setPercentScratched] = useState(0);
    const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });

    // Set canvas size responsively
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const size = Math.min(containerWidth, 350);
                setCanvasSize({ width: size, height: size });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#4F46E5');
        gradient.addColorStop(1, '#6366F1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add some pattern or texture
        ctx.fillStyle = '#FFF';
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 300; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                1,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }

        // Add text overlay - responsive font size
        ctx.globalAlpha = 1;
        const fontSize = Math.floor(canvas.width / 12);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.fillText('Scratch here!', canvas.width / 2, canvas.height / 2);
    }, [canvasSize]);

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (e.touches) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const scratch = (e) => {
        if (!isDrawing) return;

        e.preventDefault(); // Prevent scrolling on touch devices

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const currentPoint = getMousePos(e);

        ctx.globalCompositeOperation = 'destination-out';

        // Responsive brush size
        const brushSize = Math.floor(canvas.width / 15);

        ctx.beginPath();
        ctx.arc(currentPoint.x, currentPoint.y, brushSize, 0, 2 * Math.PI);
        ctx.fill();

        if (lastPoint) {
            ctx.beginPath();
            ctx.lineWidth = brushSize * 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(currentPoint.x, currentPoint.y);
            ctx.stroke();
        }

        setLastPoint(currentPoint);

        // Throttle reveal checking for better performance
        if (Math.random() > 0.7) {
            checkReveal();
        }
    };

    const checkReveal = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) {
                transparentPixels++;
            }
        }

        const percentRevealed = (transparentPixels / (pixels.length / 4)) * 100;
        setPercentScratched(percentRevealed);

        if (percentRevealed > 50 && !isRevealed) {
            setIsRevealed(true);
            onReveal && onReveal();
        }
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        setLastPoint(getMousePos(e));
        e.preventDefault();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        setLastPoint(null);
    };

    return (
        <div ref={containerRef} className="w-full max-w-[350px] mx-auto px-4">
            <div
                className="relative mx-auto"
                style={{
                    width: canvasSize.width,
                    height: canvasSize.height,
                    transform: 'translateZ(0)',
                    willChange: 'transform'
                }}
            >
                {/* Prize Content (underneath) */}
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg shadow-lg">
                    <div className="text-center p-4 sm:p-8">
                        <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">🎉</div>
                        <h3 className="text-lg sm:text-2xl font-bold text-gray-800">{prize?.name}</h3>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">{prize?.description}</p>
                    </div>
                </div>

                {/* Scratch Canvas (overlay) */}
                <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className="absolute top-0 left-0 rounded-lg cursor-crosshair touch-none"
                    style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'none',
                        userSelect: 'none'
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={scratch}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={scratch}
                    onTouchEnd={stopDrawing}
                />

                {/* Progress Indicator */}
                {percentScratched > 0 && percentScratched < 50 && (
                    <div className="absolute -bottom-8 left-0 right-0 text-xs sm:text-sm text-gray-500 text-center">
                        Keep scratching! ({Math.round(percentScratched)}% revealed)
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScratchCard;
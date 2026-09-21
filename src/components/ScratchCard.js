import React, { useRef, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/soundEffects';
import { Sparkles, Wand2 } from 'lucide-react';

const ScratchCard = ({ prize, onReveal }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPoint, setLastPoint] = useState(null);
    const [percentScratched, setPercentScratched] = useState(0);
    const [canvasSize, setCanvasSize] = useState({ width: 320, height: 320 });
    const scratchCountRef = useRef(0);

    const triggerConfetti = () => {
        soundManager.playWinFanfare();
        const duration = 3200;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 220);
    };

    // Responsive size
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const size = Math.min(Math.max(containerWidth - 32, 280), 360);
                setCanvasSize({ width: size, height: size });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Draw realistic metallic scratch-off foil
    useEffect(() => {
        if (isRevealed) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;

        // 1. Brushed Silver-Gold Holographic Gradient
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, '#94A3B8');
        gradient.addColorStop(0.2, '#E2E8F0');
        gradient.addColorStop(0.4, '#CBD5E1');
        gradient.addColorStop(0.6, '#F8FAFC');
        gradient.addColorStop(0.8, '#CBD5E1');
        gradient.addColorStop(1, '#94A3B8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // 2. Micro-glitter texture
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 400; i++) {
            ctx.globalAlpha = Math.random() * 0.4 + 0.1;
            ctx.beginPath();
            ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5, 0, 2 * Math.PI);
            ctx.fill();
        }

        // 3. Holographic Diagonal Waves
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 2;
        for (let i = -h; i < w + h; i += 18) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + h, h);
            ctx.stroke();
        }

        // 4. Gold Border Trim on Foil
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 6;
        ctx.strokeRect(6, 6, w - 12, h - 12);

        // Inner dashed security border
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(12, 12, w - 24, h - 24);
        ctx.setLineDash([]);

        // 5. Foil Center Marquee Badge
        ctx.fillStyle = 'rgba(30, 41, 59, 0.08)';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, w * 0.28, 0, 2 * Math.PI);
        ctx.fill();

        // 6. Center Foil Coin Icon & Text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = `bold ${Math.floor(w / 8)}px sans-serif`;
        ctx.fillStyle = '#334155';
        ctx.fillText('🪙', w / 2, h / 2 - w * 0.1);

        ctx.font = `900 ${Math.floor(w / 14)}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#1E293B';
        ctx.fillText('SCRATCH & WIN', w / 2, h / 2 + w * 0.06);

        ctx.font = `bold ${Math.floor(w / 22)}px system-ui, sans-serif`;
        ctx.fillStyle = '#64748B';
        ctx.fillText('RUB WITH FINGER OR MOUSE', w / 2, h / 2 + w * 0.16);

    }, [canvasSize, isRevealed]);

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return { x: 0, y: 0 };
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
        if (touch) {
            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY
            };
        }

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const scratch = (e) => {
        if (!isDrawing) return;

        if (e.cancelable) e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        const currentPoint = getMousePos(e);

        ctx.globalCompositeOperation = 'destination-out';

        const brushSize = Math.floor(canvas.width / 11);

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

        // Sound effect throttled
        scratchCountRef.current++;
        if (scratchCountRef.current % 4 === 0) {
            soundManager.playScratch();
        }

        if (scratchCountRef.current % 12 === 0) {
            checkReveal();
        }
    };

    const checkReveal = () => {
        const canvas = canvasRef.current;
        if (!canvas || canvas.width === 0 || canvas.height === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        if (!pixels || pixels.length === 0) return;
        let transparentPixels = 0;

        for (let i = 0; i < pixels.length; i += 16) {
            if (pixels[i + 3] === 0) {
                transparentPixels++;
            }
        }

        const percentRevealed = (transparentPixels / (pixels.length / 16)) * 100;
        setPercentScratched(percentRevealed);

        if (percentRevealed > 45 && !isRevealed) {
            revealComplete();
        }
    };

    const revealComplete = () => {
        if (isRevealed) return;
        setIsRevealed(true);
        // Clear entire canvas smoothly
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        if (prize?.is_winning) {
            triggerConfetti();
        } else {
            soundManager.playLoseSound();
        }
        if (onReveal) onReveal();
    };

    const startDrawing = (e) => {
        soundManager.init();
        setIsDrawing(true);
        setLastPoint(getMousePos(e));
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        setLastPoint(null);
        checkReveal();
    };

    return (
        <div ref={containerRef} className="w-full max-w-sm mx-auto flex flex-col items-center px-4">
            
            {/* LOTTERY TICKET OUTER SLEEVE */}
            <div className="relative w-full p-4 sm:p-5 bg-gradient-to-b from-amber-50 via-white to-amber-100/60 rounded-3xl shadow-2xl border-4 border-amber-400/80 mb-5">
                
                {/* Header Ticket Ribbon */}
                <div className="flex items-center justify-between border-b-2 border-dashed border-amber-300 pb-2.5 mb-3 text-xs font-black uppercase text-amber-900 tracking-wider">
                    <span className="flex items-center gap-1">🎟️ OFFICIAL LUCKY SCRATCH</span>
                    <span className="font-mono text-amber-700">★ ★ ★</span>
                </div>

                {/* SCRATCH CANVAS BOX */}
                <div
                    className="relative mx-auto rounded-2xl overflow-hidden shadow-inner border-2 border-slate-300 bg-gradient-to-br from-indigo-50 via-white to-purple-50"
                    style={{
                        width: canvasSize.width,
                        height: canvasSize.height,
                    }}
                >
                    {/* Prize Content (Revealed Underneath) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-br from-amber-50 via-white to-yellow-100">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-3xl sm:text-4xl shadow-md border-2 border-white mb-2 animate-bounce">
                            {prize?.is_winning ? '🏆' : '✨'}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-200/80 px-2.5 py-0.5 rounded-full mb-1">
                            {prize?.is_winning ? 'YOU WON A REWARD!' : 'REVEALED RESULT'}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                            {prize?.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-[240px] leading-relaxed">
                            {prize?.description}
                        </p>
                    </div>

                    {/* Foil Scratch Layer */}
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        className={`absolute top-0 left-0 cursor-pointer touch-none transition-opacity duration-500 ${
                            isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        }`}
                        style={{
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'none',
                            userSelect: 'none'
                        }}
                        onMouseDown={startDrawing}
                        onMouseMove={scratch}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={scratch}
                        onTouchEnd={stopDrawing}
                    />
                </div>

                {/* Ticket Footer Serial Watermark */}
                <div className="flex items-center justify-between border-t-2 border-dashed border-amber-300 pt-2.5 mt-3 text-[10px] font-mono text-gray-400 uppercase">
                    <span>SERIES: CC-{prize?.id || '77'}</span>
                    <span>VERIFIED LOTTERY TICKET</span>
                </div>
            </div>

            {/* Scratching Progress Bar & Quick Reveal Helper */}
            {!isRevealed && (
                <div className="w-full max-w-[320px] space-y-2 text-center">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-1">
                        <span>Foil Scratched</span>
                        <span className="text-indigo-600">{Math.round(percentScratched)}%</span>
                    </div>

                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 rounded-full transition-all duration-150"
                            style={{ width: `${Math.min(percentScratched * 2.2, 100)}%` }}
                        ></div>
                    </div>

                    {/* Instant Reveal Button if partially scratched */}
                    {percentScratched > 15 && (
                        <button
                            onClick={revealComplete}
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all active:scale-95 shadow-xs"
                        >
                            <Wand2 size={13} />
                            Instant Auto-Reveal All
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScratchCard;
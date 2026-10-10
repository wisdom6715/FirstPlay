import React, { useState, useRef, useEffect } from 'react';
import { WHEEL_SEGMENTS } from '../services/spinGiftService';

/**
 * Authentic 8-Segment Spinning Wheel matching media_1791543505455.png
 */
export default function SpinWheel({
  isSpinning,
  targetOutcome,
  onSpinStart,
  onSpinEnd,
  disabled = false
}) {
  const [currentRotation, setCurrentRotation] = useState(0);
  const [animating, setAnimating] = useState(false);
  const totalRotationsRef = useRef(0);

  const numSegments = WHEEL_SEGMENTS.length; // 8
  const segmentAngle = 360 / numSegments; // 45 deg

  // Handle spin execution when targetOutcome arrives
  useEffect(() => {
    if (!targetOutcome || animating) return;

    const { segmentIndex } = targetOutcome;
    setAnimating(true);

    // Segment center angle from 12 o'clock
    const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2;
    
    // Natural jitter within the slice (+/- 10 deg)
    const jitter = (Math.random() - 0.5) * 20;

    // Additional 5 to 7 full revolutions for momentum
    const fullSpins = (5 + Math.floor(Math.random() * 2)) * 360;

    // Align target segment center to 12 o'clock pointer (0 deg)
    // To rotate angle theta to 0: target rotation = (360 - theta)
    const normalizedTarget = (360 - segmentCenter + jitter + 360) % 360;

    // Keep adding clockwise momentum so it never spins backwards
    const currentBase = totalRotationsRef.current - (totalRotationsRef.current % 360);
    const finalRotation = currentBase + fullSpins + normalizedTarget;

    totalRotationsRef.current = finalRotation;
    setCurrentRotation(finalRotation);

    const timer = setTimeout(() => {
      setAnimating(false);
      onSpinEnd?.(targetOutcome.segment);
    }, 4500);

    return () => clearTimeout(timer);
  }, [targetOutcome]);

  const handleHubClick = () => {
    if (disabled || animating || isSpinning) return;
    onSpinStart?.();
  };

  // Helper to calculate SVG arc path
  const createArcPath = (index) => {
    const startAngle = index * segmentAngle - 90; // Start from top (-90 deg in SVG)
    const endAngle = startAngle + segmentAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const r = 180;
    const cx = 200;
    const cy = 200;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  };

  // Helper to place text in radial direction
  const getTextCoordinates = (index) => {
    const midAngle = index * segmentAngle + segmentAngle / 2 - 90;
    const midRad = (midAngle * Math.PI) / 180;
    const r = 118; // Radius position for text
    const x = 200 + r * Math.cos(midRad);
    const y = 200 + r * Math.sin(midRad);
    // Rotate text along the ray
    const rotation = midAngle + 90;
    return { x, y, rotation };
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      
      {/* Top Blue Pointer (12 o'clock triangle pointing down) */}
      <div className="relative z-30 mb-[-14px] flex flex-col items-center">
        <div 
          className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-[#0066ff] drop-shadow-[0_4px_10px_rgba(0,102,255,0.6)]"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
        />
        {/* Subtle pointer base highlight */}
        <div className="w-2.5 h-1 bg-white/70 rounded-full -mt-5" />
      </div>

      {/* Wheel Wrapper with Outer Shadow & Glow */}
      <div className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] flex items-center justify-center">
        
        {/* Ambient Ring Glow */}
        <div className="absolute inset-0 rounded-full bg-blue-600/10 blur-xl pointer-events-none" />

        {/* Outer Rim Ring with perimeter tick marks */}
        <div className="absolute inset-[-6px] rounded-full border-[5px] border-[#0a0d14] shadow-2xl pointer-events-none z-20" />

        {/* Rotating Wheel Group */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full rounded-full shadow-2xl"
          style={{
            transform: `rotate(${currentRotation}deg)`,
            transition: animating ? 'transform 4.5s cubic-bezier(0.15, 0.95, 0.35, 1.0)' : 'none',
            transformOrigin: 'center'
          }}
        >
          {/* Slices */}
          {WHEEL_SEGMENTS.map((seg, idx) => {
            const { x, y, rotation } = getTextCoordinates(idx);
            return (
              <g key={seg.id}>
                {/* Segment Wedge */}
                <path
                  d={createArcPath(idx)}
                  fill={seg.color}
                  stroke="#0a0d14"
                  strokeWidth="2.5"
                />

                {/* Segment Radial Label */}
                <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
                  <text
                    x="0"
                    y="-4"
                    fill={seg.textColor}
                    fontSize="17"
                    fontWeight="800"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {seg.amountLabel}
                  </text>
                  <text
                    x="0"
                    y="13"
                    fill={seg.textColor}
                    fontSize="10"
                    fontWeight="600"
                    opacity={seg.textColor === '#ffffff' ? 0.85 : 0.75}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {seg.subLabel}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Outer Ring Tick Dots (16 dots matching screenshot) */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16 - 90;
            const rad = (angle * Math.PI) / 180;
            const dotX = 200 + 192 * Math.cos(rad);
            const dotY = 200 + 192 * Math.sin(rad);
            return (
              <circle
                key={`dot-${i}`}
                cx={dotX}
                cy={dotY}
                r="2.5"
                fill="#ffffff"
                opacity="0.9"
              />
            );
          })}
        </svg>

        {/* Center SPIN Hub (Static clickable button in the center) */}
        <div className="absolute z-20 flex items-center justify-center pointer-events-auto">
          <button
            type="button"
            onClick={handleHubClick}
            disabled={disabled || animating}
            className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#0066ff] border-4 border-white shadow-[0_8px_24px_rgba(0,102,255,0.5)] flex items-center justify-center transition-all ${
              disabled || animating
                ? 'opacity-85 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95 hover:bg-[#0055dd] cursor-pointer'
            }`}
          >
            <span className="text-white font-extrabold text-sm tracking-wider uppercase drop-shadow-sm">
              {animating ? '...' : 'SPIN'}
            </span>
          </button>
        </div>

      </div>

    </div>
  );
}

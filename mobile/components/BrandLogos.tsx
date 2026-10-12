import React from 'react';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';

export interface BrandLogoProps {
  brand: string;
  size?: number;
  color?: string;
}

export function BrandLogo({ brand, size = 28, color = '#111827' }: BrandLogoProps) {
  const norm = brand.toLowerCase();

  if (norm.includes('mercedes')) {
    // Mercedes-Benz three-pointed star inside circle
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="46" stroke={color} strokeWidth="6" fill="none" />
        <Path
          d="M50 8 L50 50 L14 71 L50 50 L86 71 Z"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <Path
          d="M50 14 L50 50 L19 68 M50 50 L81 68"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (norm.includes('bmw')) {
    // BMW roundel: outer circle and four alternating segments
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="46" stroke={color} strokeWidth="6" fill="none" />
        <Circle cx="50" cy="50" r="34" stroke={color} strokeWidth="3" fill="none" />
        {/* Top-right quadrant */}
        <Path d="M50 16 A34 34 0 0 1 84 50 L50 50 Z" fill="#0066B1" />
        {/* Bottom-left quadrant */}
        <Path d="M50 84 A34 34 0 0 1 16 50 L50 50 Z" fill="#0066B1" />
        {/* Top-left & Bottom-right quadrants (white/transparent) */}
        <Path d="M16 50 A34 34 0 0 1 50 16 L50 50 Z" fill="#FFFFFF" opacity={0.9} />
        <Path d="M84 50 A34 34 0 0 1 50 84 L50 50 Z" fill="#FFFFFF" opacity={0.9} />
        <Path d="M50 16 L50 84 M16 50 L84 50" stroke={color} strokeWidth="3" />
      </Svg>
    );
  }

  if (norm.includes('tesla')) {
    // Tesla 'T' logo
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Upper curved bar */}
        <Path
          d="M15 22 Q50 34 85 22 Q50 28 15 22 Z"
          fill={color}
        />
        {/* Main T shape */}
        <Path
          d="M26 36 Q50 44 74 36 C69 46 60 52 56 62 L56 86 C54 86 52 86 50 86 C48 86 46 86 44 86 L44 62 C40 52 31 46 26 36 Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (norm.includes('audi')) {
    // Audi four overlapping rings
    return (
      <Svg width={size * 1.5} height={size} viewBox="0 0 150 100">
        <Circle cx="30" cy="50" r="22" stroke={color} strokeWidth="5" fill="none" />
        <Circle cx="60" cy="50" r="22" stroke={color} strokeWidth="5" fill="none" />
        <Circle cx="90" cy="50" r="22" stroke={color} strokeWidth="5" fill="none" />
        <Circle cx="120" cy="50" r="22" stroke={color} strokeWidth="5" fill="none" />
      </Svg>
    );
  }

  if (norm.includes('toyota')) {
    // Toyota triple ovals
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Outer ellipse */}
        <Path
          d="M50 16 C76 16 92 31 92 50 C92 69 76 84 50 84 C24 84 8 69 8 50 C8 31 24 16 50 16 Z"
          stroke={color}
          strokeWidth="6"
          fill="none"
        />
        {/* Top inner horizontal ellipse */}
        <Path
          d="M50 26 C68 26 78 35 78 44 C78 53 68 56 50 56 C32 56 22 53 22 44 C22 35 32 26 50 26 Z"
          stroke={color}
          strokeWidth="5"
          fill="none"
        />
        {/* Center vertical ellipse */}
        <Path
          d="M50 26 C57 26 62 42 62 55 C62 68 57 80 50 80 C43 80 38 68 38 55 C38 42 43 26 50 26 Z"
          stroke={color}
          strokeWidth="5"
          fill="none"
        />
      </Svg>
    );
  }

  if (norm.includes('honda')) {
    // Honda stylized 'H' inside rounded rectangle
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Rect
          x="12"
          y="15"
          width="76"
          height="70"
          rx="16"
          stroke={color}
          strokeWidth="6"
          fill="none"
        />
        <Path
          d="M32 30 L38 72 M68 30 L62 72 M34 50 L66 50"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (norm.includes('porsche')) {
    // Porsche crest silhouette
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path
          d="M20 18 L80 18 L76 56 C74 72 50 88 50 88 C50 88 26 72 24 56 Z"
          stroke={color}
          strokeWidth="5"
          fill="#C9A227"
          opacity={0.15}
        />
        <Path
          d="M20 18 L80 18 L76 56 C74 72 50 88 50 88 C50 88 26 72 24 56 Z"
          stroke={color}
          strokeWidth="5"
          fill="none"
        />
        <Path
          d="M38 38 L62 38 L60 56 C59 64 50 72 50 72 C50 72 41 64 40 56 Z"
          stroke={color}
          strokeWidth="3.5"
          fill="none"
        />
        <Path d="M50 22 L50 36 M30 26 L45 26 M55 26 L70 26" stroke={color} strokeWidth="3" />
      </Svg>
    );
  }

  // Fallback car/steering emblem
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="44" stroke={color} strokeWidth="5" fill="none" />
      <Circle cx="50" cy="50" r="16" stroke={color} strokeWidth="4" fill="none" />
      <Path d="M50 6 L50 34 M14 68 L36 58 M86 68 L64 58" stroke={color} strokeWidth="5" />
    </Svg>
  );
}

export const POPULAR_BRANDS = [
  { name: 'Mercedes', query: 'Mercedes-Benz' },
  { name: 'BMW', query: 'BMW' },
  { name: 'Honda', query: 'Honda' },
  { name: 'Toyota', query: 'Toyota' },
  { name: 'Tesla', query: 'Tesla' },
  { name: 'Audi', query: 'Audi' },
];

import React from 'react';
import { useFitScale } from '../hooks/useFitScale';

type Props = {
  width?: number;
  height?: number;
  className?: string;
  children: React.ReactNode;
  padding?: number; // marge intérieure autour du stage
};

export default function ScaledStage({
  width = 1024,
  height = 768,
  className = '',
  children,
  padding = 0,
}: Props) {
  const scale = useFitScale(width, height, padding);

  return (
    <div
      className={`w-screen h-screen flex items-center justify-center overflow-hidden ${className}`}
      style={{
        padding,
        background: 'black',
      }}
    >
      {/* Le "stage" logique 1024x768, échellé et centré */}
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          // Astuce : pour garder une bordure/ombre nette même après scale,
          // on les met sur un wrapper non-scalé si besoin.
        }}
      >
        {children}
      </div>
    </div>
  );
}

import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface NepalMapIconProps {
  width?: number;
  height?: number;
  color?: string;
}

/**
 * Clean vector geographic outline of Nepal for the +977 phone prefix.
 * Zero emojis - pure crisp SVG vector.
 */
export const NepalMapIcon: React.FC<NepalMapIconProps> = ({
  width = 24,
  height = 16,
  color = '#27A98C',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 55" fill="none">
      <Path
        d="M 5,26 
           C 12,20 18,17 26,16 
           C 34,14 45,15 56,12 
           C 65,10 74,8 82,14 
           C 89,19 96,25 94,32 
           C 92,39 84,43 76,44 
           C 65,45 52,47 40,46 
           C 28,45 18,46 11,41 
           C 5,37 2,31 5,26 Z"
        stroke={color}
        strokeWidth="4"
        fill={color}
        fillOpacity="0.18"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Mountain crest subtle accent */}
      <Path
        d="M 28,24 L 34,18 L 40,24 L 48,16 L 56,25 L 65,17 L 74,23"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

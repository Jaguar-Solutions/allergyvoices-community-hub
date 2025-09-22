import React from 'react';

interface AVLogoProps {
  size?: number;
  className?: string;
}

const AVLogo: React.FC<AVLogoProps> = ({ size = 40, className = "" }) => {
  return (
    <div 
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-poppins font-bold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      AV
    </div>
  );
};

export default AVLogo;
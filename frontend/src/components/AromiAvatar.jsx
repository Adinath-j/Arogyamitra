import React from 'react';
import AromiAvatarSvg from '../assets/aromi-avatar.png';

export default function AromiAvatar({ size = 32, className = '' }) {
  return (
    <div 
      className={`rounded-full overflow-hidden shadow-sm border border-forest-500/30 flex items-center justify-center flex-shrink-0 bg-forest-900/40 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="AROMI AI Coach Avatar"
    >
      <img 
        src={AromiAvatarSvg} 
        alt="AROMI AI Coach Avatar" 
        className="w-full h-full object-cover"
        style={{ aspectRatio: '1/1' }}
      />
    </div>
  );
}

import React from 'react';

interface VenetianFlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const VenetianFlag: React.FC<VenetianFlagProps> = ({
  className = '',
  size = 'md'
}) => {
  const sizeStyles = {
    sm: 'w-12 h-6',
    md: 'w-24 h-12',
    lg: 'w-36 h-18',
    hero: 'w-56 h-28 sm:w-72 sm:h-36'
  }[size];

  return (
    <div className={`relative inline-block ${sizeStyles} ${className} filter drop-shadow-md select-none`}>
      <img
        src="/images/venice_flag.svg"
        alt="Flag of the Most Serene Republic of Venice"
        className="w-full h-full object-contain filter drop-shadow-sm"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

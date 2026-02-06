import React from 'react';

const SvgSeparator: React.FC = () => {
  return (
    <div className="svg-separator">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 120" preserveAspectRatio="none">
        <path className="svg-path" d="M0,70 C80,30 120,90 200,50 C280,10 320,110 400,70 C480,30 520,90 600,50 C680,10 720,110 800,70 C880,30 920,90 1000,50 V100 C920,110 880,90 800,100 C720,110 680,90 600,100 C520,110 480,90 400,100 C320,110 280,90 200,100 C120,110 80,90 0,100 Z"></path>
      </svg>
    </div>
  );
};

export default SvgSeparator;

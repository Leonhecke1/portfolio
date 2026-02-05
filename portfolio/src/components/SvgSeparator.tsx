import React from 'react';

const SvgSeparator: React.FC = () => {
  return (
    <div className="svg-separator">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path className="svg-path" d="M0,0 L0,50 L200,0 L400,50 L600,0 L800,50 L1000,0 L1000,100 L0,100 Z"></path>
      </svg>
    </div>
  );
};

export default SvgSeparator;

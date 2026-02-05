import React from 'react';

const SvgSeparator: React.FC = () => {
  return (
    <div className="svg-separator">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path className="svg-path" d="M 0 0 C 200 100 800 100 1000 0 L 1000 100 L 0 100 Z"></path>
      </svg>
    </div>
  );
};

export default SvgSeparator;

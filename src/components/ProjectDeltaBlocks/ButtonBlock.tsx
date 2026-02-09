import React from 'react';

interface ButtonBlockProps {
  text?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const ButtonBlock: React.FC<ButtonBlockProps> = ({ text = 'Click Me', onClick, style }) => {
  return (
    <button
      className="button-block"
      onClick={onClick}
      style={style}
    >
      {text}
    </button>
  );
};

export default ButtonBlock;
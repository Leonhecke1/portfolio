import React from 'react';

interface TextBlockProps {
  content?: string;
  style?: React.CSSProperties; // Allow passing styles
  onClick?: () => void; // Allow passing onClick handler
}

const TextBlock: React.FC<TextBlockProps> = ({ content = 'This is a text block.', style, onClick }) => {
  return (
    <div className="text-block" style={style} onClick={onClick}>
      {content}
    </div>
  );
};

export default TextBlock;
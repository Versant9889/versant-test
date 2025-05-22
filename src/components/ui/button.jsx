import React from 'react';

function Button({ onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;

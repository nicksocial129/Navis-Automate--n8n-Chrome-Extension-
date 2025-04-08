import React from 'react';

/**
 * Header component with logo and title
 * @param {Object} props - Component props
 * @param {string} props.title - The title to display
 * @param {React.ReactNode} props.children - Optional right side content
 * @returns {JSX.Element} The header component
 */
const Header = ({ title, children }) => {
  return (
    <header className="flex-between mb-16">
      <div className="flex">
        <h1>{title}</h1>
      </div>
      {children && <div>{children}</div>}
    </header>
  );
};

export default Header;

import React from 'react';

/**
 * Reusable Button component
 * @param {Object} props - Component props
 * @param {string} props.type - Button type ('button', 'submit', 'reset')
 * @param {string} props.variant - Button variant ('primary', 'secondary', 'text')
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @returns {JSX.Element} The button component
 */
const Button = ({
  type = 'button',
  variant = 'primary',
  onClick,
  disabled = false,
  isLoading = false,
  className = '',
  children
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'btn-secondary';
      case 'text':
        return 'btn-text';
      case 'primary':
      default:
        return 'btn-primary';
    }
  };

  return (
    <button
      type={type}
      className={`btn ${getVariantClass()} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span className="spinner mr-8" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;

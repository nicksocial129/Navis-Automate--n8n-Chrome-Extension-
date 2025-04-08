import React from 'react';

/**
 * Reusable TextArea component
 * @param {Object} props - Component props
 * @param {string} props.id - The input ID
 * @param {string} props.label - The label text
 * @param {string} props.value - The input value
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether the field is required
 * @param {Object} props.className - Additional CSS classes
 * @param {number} props.rows - Number of rows to display
 * @returns {JSX.Element} The text area component
 */
const TextArea = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  rows = 5
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <textarea
        id={id}
        className="form-textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
    </div>
  );
};

export default TextArea;

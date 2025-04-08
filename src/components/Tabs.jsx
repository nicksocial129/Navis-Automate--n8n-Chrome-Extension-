import React from 'react';

/**
 * Tabs component for navigation between different sections
 * @param {Object} props - Component props
 * @param {Array<{id: string, label: string}>} props.tabs - Array of tab objects with id and label
 * @param {string} props.activeTab - ID of the active tab
 * @param {Function} props.onChange - Function called when tab is changed
 * @returns {JSX.Element} The tabs component
 */
const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onChange(tab.id);
            }
          }}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
};

export default Tabs;

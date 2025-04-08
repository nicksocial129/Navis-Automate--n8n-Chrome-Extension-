import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Header from '../components/Header';
import Tabs from '../components/Tabs';
import WorkflowGenerator from '../components/WorkflowGenerator';
import WorkflowHistory from '../components/WorkflowHistory';
import WorkflowResult from '../components/WorkflowResult';
import { getSettings, applyTheme } from '../utils/storageUtils';
import '../assets/styles.css';

const Popup = () => {
  // State
  const [activeTab, setActiveTab] = useState('create');
  const [workflowResult, setWorkflowResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        // Apply theme
        applyTheme(settings.theme);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle workflow generation
  const handleWorkflowGenerated = (result) => {
    setWorkflowResult(result);
    // Switch view to show the result
    setActiveTab('result');
  };

  // Handle selecting a workflow from history
  const handleSelectWorkflow = (historyItem) => {
    setWorkflowResult({
      workflow: historyItem.workflow,
      explanation: historyItem.explanation
    });
    // Switch view to show the result
    setActiveTab('result');
  };

  // Handle going back from result view
  const handleBackFromResult = () => {
    setActiveTab('create');
  };

  // Setup tabs for navigation
  const tabs = [
    { id: 'create', label: 'Create' },
    { id: 'history', label: 'History' },
  ];

  if (loading) {
    return (
      <div className="popup-container">
        <div className="text-center">
          <span className="spinner"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <Header title="Navis Automate" />
      
      {activeTab === 'result' ? (
        <WorkflowResult 
          result={workflowResult} 
          onBack={handleBackFromResult} 
        />
      ) : (
        <>
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
          />
          
          {activeTab === 'create' && (
            <WorkflowGenerator onWorkflowGenerated={handleWorkflowGenerated} />
          )}
          
          {activeTab === 'history' && (
            <WorkflowHistory onSelectWorkflow={handleSelectWorkflow} />
          )}
        </>
      )}
      
      <div className="text-center mt-16">
        <a 
          href="chrome-extension://navis-automate/options.html" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Settings
        </a>
      </div>
    </div>
  );
};

// Init app
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('popup-root');
  const root = createRoot(container);
  root.render(<Popup />);
});

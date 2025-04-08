import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Header from '../components/Header';
import Button from '../components/Button';
import { getSettings, saveSettings, applyTheme } from '../utils/storageUtils';
import '../assets/styles.css';

const Options = () => {
  // State for settings
  const [settings, setSettings] = useState({
    apiProvider: 'openai',
    apiKey: '',
    apiEndpoint: '',
    explanationFormat: 'ui',
    theme: 'light'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  
  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const loadedSettings = await getSettings();
        setSettings(loadedSettings);
        // Apply theme
        applyTheme(loadedSettings.theme);
      } catch (error) {
        console.error('Error loading settings:', error);
        setSaveMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Apply theme change immediately
    if (name === 'theme') {
      applyTheme(value);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setSaveMessage({ type: '', text: '' });
      
      const result = await saveSettings(settings);
      
      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully' });
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="options-container">
        <div className="text-center">
          <span className="spinner"></span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="options-container">
      <Header title="Navis Automate Settings" />
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <h2>API Configuration</h2>
          
          <div className="form-group">
            <label htmlFor="apiProvider" className="form-label">AI Provider</label>
            <select
              id="apiProvider"
              name="apiProvider"
              className="form-select"
              value={settings.apiProvider}
              onChange={handleChange}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="apiKey" className="form-label">API Key</label>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              className="form-input"
              value={settings.apiKey}
              onChange={handleChange}
              placeholder={`Enter your ${settings.apiProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API key`}
            />
            <p className="form-help">
              {settings.apiProvider === 'openai' 
                ? 'Your OpenAI API key from https://platform.openai.com/api-keys' 
                : 'Your Anthropic API key from https://console.anthropic.com/keys'}
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="apiEndpoint" className="form-label">Custom API Endpoint (Optional)</label>
            <input
              type="text"
              id="apiEndpoint"
              name="apiEndpoint"
              className="form-input"
              value={settings.apiEndpoint}
              onChange={handleChange}
              placeholder={settings.apiProvider === 'openai' 
                ? 'https://api.openai.com/v1/chat/completions' 
                : 'https://api.anthropic.com/v1/messages'}
            />
            <p className="form-help">
              Leave blank to use the default endpoint. For enterprise deployments or proxies.
            </p>
          </div>
          
          <h2 className="mt-16">Display Preferences</h2>
          
          <div className="form-group">
            <label htmlFor="explanationFormat" className="form-label">Default Explanation Format</label>
            <select
              id="explanationFormat"
              name="explanationFormat"
              className="form-select"
              value={settings.explanationFormat}
              onChange={handleChange}
            >
              <option value="ui">Show in UI</option>
              <option value="markdown">Include as Sticky Notes</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="theme" className="form-label">Theme</label>
            <select
              id="theme"
              name="theme"
              className="form-select"
              value={settings.theme}
              onChange={handleChange}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          
          {saveMessage.text && (
            <div className={`alert ${saveMessage.type === 'success' ? 'alert-success' : 'alert-error'} mt-16`}>
              {saveMessage.text}
            </div>
          )}
          
          <div className="mt-16">
            <Button type="submit" isLoading={isSaving}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
      
      <div className="text-center mt-16">
        <a href="chrome-extension://navis-automate/popup.html">
          Back to Main View
        </a>
      </div>
    </div>
  );
};

// Init app
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('options-root');
  const root = createRoot(container);
  root.render(<Options />);
});

/**
 * Storage Utility Functions
 * Helper functions for interacting with Chrome storage
 */

/**
 * Get settings from Chrome storage
 * @returns {Promise<Object>} The stored settings or default settings
 */
export const getSettings = async () => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'getSettings' },
      (response) => {
        if (response && response.success && response.settings) {
          resolve(response.settings);
        } else {
          // Default settings if not found
          resolve({
            apiProvider: 'openai',
            apiKey: '',
            apiEndpoint: '',
            explanationFormat: 'ui',
            theme: 'light'
          });
        }
      }
    );
  });
};

/**
 * Save settings to Chrome storage
 * @param {Object} settings - The settings to save
 * @returns {Promise<Object>} The result of the operation
 */
export const saveSettings = async (settings) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'saveSettings', settings },
      (response) => {
        resolve(response || { success: false, error: 'No response from extension' });
      }
    );
  });
};

/**
 * Get workflow history from Chrome storage
 * @returns {Promise<Array>} The workflow history
 */
export const getWorkflowHistory = async () => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'getWorkflowHistory' },
      (response) => {
        if (response && response.success && response.history) {
          resolve(response.history);
        } else {
          resolve([]);
        }
      }
    );
  });
};

/**
 * Clear workflow history
 * @returns {Promise<Object>} The result of the operation
 */
export const clearWorkflowHistory = async () => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'clearWorkflowHistory' },
      (response) => {
        resolve(response || { success: false, error: 'No response from extension' });
      }
    );
  });
};

/**
 * Generate workflow from description
 * @param {string} description - The workflow description
 * @param {boolean} includeExplanationAsSticky - Whether to include the explanation as sticky notes
 * @returns {Promise<Object>} The generated workflow and explanation
 */
export const generateWorkflow = async (description, includeExplanationAsSticky = false) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { 
        action: 'generateWorkflow', 
        description,
        includeExplanationAsSticky
      },
      (response) => {
        resolve(response || { success: false, error: 'No response from extension' });
      }
    );
  });
};

/**
 * Apply theme to document based on settings
 * @param {string} theme - The theme name ('light' or 'dark')
 */
export const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
};

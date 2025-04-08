/**
 * Navis Automate Content Script
 * Handles integration with n8n webpage
 */

// Check if we're on an n8n page
const isN8nPage = () => {
  return window.location.href.includes('n8n.io') || 
         window.location.pathname.includes('/n8n/') ||
         document.querySelector('.n8n-workflow') !== null;
};

// Inject a workflow JSON into n8n
const injectWorkflowToN8n = (workflow) => {
  try {
    // Check if we're on an n8n page
    if (!isN8nPage()) {
      console.error('Not on an n8n page. Cannot inject workflow.');
      return false;
    }
    
    // Convert workflow to a string
    const workflowStr = JSON.stringify(workflow);
    
    // Create a function to handle the injection
    const injectScript = (workflowData) => {
      try {
        // Find the import button or trigger import programmatically
        const importButton = document.querySelector('[data-test-id="import-workflow-button"]') || 
                             document.querySelector('button:contains("Import")');
                             
        if (importButton) {
          // Click the import button
          importButton.click();
          
          // Wait for the import dialog to appear
          setTimeout(() => {
            // Look for the textarea to paste JSON
            const jsonInput = document.querySelector('textarea[placeholder*="workflow"]') ||
                             document.querySelector('.import-workflow-inputs textarea');
                             
            if (jsonInput) {
              // Set the value and trigger input event
              jsonInput.value = workflowData;
              
              // Dispatch events to ensure the input is recognized
              const inputEvent = new Event('input', { bubbles: true });
              const changeEvent = new Event('change', { bubbles: true });
              
              jsonInput.dispatchEvent(inputEvent);
              jsonInput.dispatchEvent(changeEvent);
              
              // Look for the import button in the dialog
              const confirmButton = document.querySelector('.import-workflow-dialog button:contains("Import")') ||
                                   document.querySelector('button[data-test-id="import-workflow-submit-button"]');
                                  
              if (confirmButton) {
                // Click the confirm button
                confirmButton.click();
                return true;
              }
            }
          }, 500);
        }
        
        return false;
      } catch (error) {
        console.error('Error injecting workflow:', error);
        return false;
      }
    };
    
    // Inject and execute the script in the page context
    const scriptElement = document.createElement('script');
    scriptElement.textContent = `(${injectScript.toString()})(${workflowStr});`;
    document.body.appendChild(scriptElement);
    scriptElement.remove();
    
    return true;
  } catch (error) {
    console.error('Error injecting workflow to n8n:', error);
    return false;
  }
};

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'injectWorkflow' && message.workflow) {
    const result = injectWorkflowToN8n(message.workflow);
    sendResponse({ success: result });
  }
  
  // Return true to indicate async response
  return true;
});

// Notify the extension when loaded on an n8n page
if (isN8nPage()) {
  chrome.runtime.sendMessage({ action: 'onN8nPage', status: true });
}

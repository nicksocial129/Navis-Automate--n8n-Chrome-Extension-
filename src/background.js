/**
 * Navis Automate Background Service Worker
 * Handles API communications and storage operations
 */

// API Providers
const API_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic'
};

// Default settings
const DEFAULT_SETTINGS = {
  apiProvider: API_PROVIDERS.OPENAI,
  apiKey: '',
  apiEndpoint: '',
  explanationFormat: 'ui', // 'ui' or 'markdown'
  theme: 'light', // 'light' or 'dark'
};

// Store settings in Chrome storage
const saveSettings = async (settings) => {
  try {
    await chrome.storage.sync.set({ settings });
    return { success: true };
  } catch (error) {
    console.error('Error saving settings:', error);
    return { success: false, error: error.message };
  }
};

// Get settings from Chrome storage
const getSettings = async () => {
  try {
    const data = await chrome.storage.sync.get('settings');
    return data.settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Save workflow to history
const saveWorkflowToHistory = async (workflow) => {
  try {
    // Get existing history
    const data = await chrome.storage.local.get('workflowHistory');
    const history = data.workflowHistory || [];
    
    // Add new workflow to history
    const updatedHistory = [
      {
        id: crypto.randomUUID(),
        name: workflow.name,
        description: workflow.description,
        workflow: workflow,
        timestamp: new Date().toISOString()
      },
      ...history
    ].slice(0, 50); // Keep max 50 items
    
    // Save updated history
    await chrome.storage.local.set({ workflowHistory: updatedHistory });
    return { success: true };
  } catch (error) {
    console.error('Error saving workflow to history:', error);
    return { success: false, error: error.message };
  }
};

// Get workflow history
const getWorkflowHistory = async () => {
  try {
    const data = await chrome.storage.local.get('workflowHistory');
    return data.workflowHistory || [];
  } catch (error) {
    console.error('Error retrieving workflow history:', error);
    return [];
  }
};

// Clear workflow history
const clearWorkflowHistory = async () => {
  try {
    await chrome.storage.local.set({ workflowHistory: [] });
    return { success: true };
  } catch (error) {
    console.error('Error clearing workflow history:', error);
    return { success: false, error: error.message };
  }
};

// Generate n8n workflow from description using OpenAI
const generateWorkflowWithOpenAI = async (description, settings) => {
  try {
    const apiKey = settings.apiKey;
    const apiEndpoint = settings.apiEndpoint || 'https://api.openai.com/v1/chat/completions';
    
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert n8n workflow creator. Convert natural language descriptions into valid n8n workflow JSON. Your response should include:
            1. A valid n8n workflow JSON that can be imported directly into n8n
            2. A clear explanation of how the workflow functions
            
            Format your response as a JSON object with two keys:
            {
              "workflow": { ... }, // The complete n8n workflow JSON
              "explanation": "..." // Explanation of the workflow
            }
            
            Ensure the workflow JSON follows these requirements:
            - Must include a valid "name" for the workflow
            - "nodes" array with properly configured nodes
            - "connections" object to define data flow
            - Correct "id", "type", "position", "parameters" for each node
            - Valid node types (e.g., "n8n-nodes-base.httpRequest")
            - If AI nodes are used, include proper credential placeholders
            
            For workflow explanations as sticky notes:
            - Create sticky note nodes with clear markdown-formatted explanations
            - Position sticky notes near related nodes
            
            Make the workflow as functional as possible, implementing all the logic described in the user's request.`
          },
          {
            role: 'user',
            content: description
          }
        ],
        temperature: 0.7,
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error generating workflow with OpenAI');
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the response to extract workflow and explanation
    try {
      // Try to parse as JSON first
      const parsedResponse = JSON.parse(content);
      return {
        success: true,
        workflow: parsedResponse.workflow,
        explanation: parsedResponse.explanation
      };
    } catch (parseError) {
      // If not valid JSON, try to extract using regex
      const workflowMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      const explanationMatch = content.match(/## Explanation\s*([\s\S]*?)(?=```|$)/);
      
      if (workflowMatch) {
        try {
          const workflow = JSON.parse(workflowMatch[1]);
          const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided.';
          
          return {
            success: true,
            workflow,
            explanation
          };
        } catch (jsonError) {
          throw new Error('Failed to parse workflow JSON');
        }
      } else {
        throw new Error('Failed to extract workflow from response');
      }
    }
    
  } catch (error) {
    console.error('Error generating workflow with OpenAI:', error);
    return { success: false, error: error.message };
  }
};

// Generate n8n workflow from description using Anthropic
const generateWorkflowWithAnthropic = async (description, settings) => {
  try {
    const apiKey = settings.apiKey;
    const apiEndpoint = settings.apiEndpoint || 'https://api.anthropic.com/v1/messages';
    
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        messages: [
          {
            role: 'system',
            content: `You are an expert n8n workflow creator. Convert natural language descriptions into valid n8n workflow JSON. Your response should include:
            1. A valid n8n workflow JSON that can be imported directly into n8n
            2. A clear explanation of how the workflow functions
            
            Format your response as a JSON object with two keys:
            {
              "workflow": { ... }, // The complete n8n workflow JSON
              "explanation": "..." // Explanation of the workflow
            }
            
            Ensure the workflow JSON follows these requirements:
            - Must include a valid "name" for the workflow
            - "nodes" array with properly configured nodes
            - "connections" object to define data flow
            - Correct "id", "type", "position", "parameters" for each node
            - Valid node types (e.g., "n8n-nodes-base.httpRequest")
            - If AI nodes are used, include proper credential placeholders
            
            For workflow explanations as sticky notes:
            - Create sticky note nodes with clear markdown-formatted explanations
            - Position sticky notes near related nodes
            
            Make the workflow as functional as possible, implementing all the logic described in the user's request.`
          },
          {
            role: 'user',
            content: description
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error generating workflow with Anthropic');
    }
    
    const data = await response.json();
    const content = data.content[0].text;
    
    // Parse the response to extract workflow and explanation
    try {
      // Try to parse as JSON first
      const parsedResponse = JSON.parse(content);
      return {
        success: true,
        workflow: parsedResponse.workflow,
        explanation: parsedResponse.explanation
      };
    } catch (parseError) {
      // If not valid JSON, try to extract using regex
      const workflowMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      const explanationMatch = content.match(/## Explanation\s*([\s\S]*?)(?=```|$)/);
      
      if (workflowMatch) {
        try {
          const workflow = JSON.parse(workflowMatch[1]);
          const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided.';
          
          return {
            success: true,
            workflow,
            explanation
          };
        } catch (jsonError) {
          throw new Error('Failed to parse workflow JSON');
        }
      } else {
        throw new Error('Failed to extract workflow from response');
      }
    }
    
  } catch (error) {
    console.error('Error generating workflow with Anthropic:', error);
    return { success: false, error: error.message };
  }
};

// Add workflow explanation as sticky notes
const addExplanationAsStickyNotes = (workflow, explanation) => {
  try {
    if (!workflow || !workflow.nodes || !Array.isArray(workflow.nodes)) {
      throw new Error('Invalid workflow format');
    }
    
    // Find the rightmost node to position sticky notes
    let maxX = 0;
    let totalHeight = 0;
    
    workflow.nodes.forEach(node => {
      if (node.position && Array.isArray(node.position) && node.position.length >= 2) {
        maxX = Math.max(maxX, node.position[0]);
        totalHeight += 1;
      }
    });
    
    // Horizontally position sticky notes to the right of all nodes
    const stickyX = maxX + 400;
    
    // Split explanation into chunks for multiple sticky notes if needed
    const explanationChunks = [];
    const maxChunkLength = 500;
    
    if (explanation.length <= maxChunkLength) {
      explanationChunks.push(explanation);
    } else {
      // Split by paragraphs or sections
      const paragraphs = explanation.split(/\n\n+/);
      let currentChunk = '';
      
      paragraphs.forEach(paragraph => {
        if (currentChunk.length + paragraph.length <= maxChunkLength) {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        } else {
          if (currentChunk) {
            explanationChunks.push(currentChunk);
          }
          currentChunk = paragraph;
        }
      });
      
      if (currentChunk) {
        explanationChunks.push(currentChunk);
      }
    }
    
    // Create sticky note nodes
    const stickyNotes = explanationChunks.map((chunk, index) => {
      return {
        id: `sticky-note-${index + 1}`,
        name: `Workflow Explanation ${index > 0 ? `(Part ${index + 1})` : ''}`,
        type: 'n8n-nodes-base.stickyNote',
        position: [stickyX, 200 + (index * 300)],
        parameters: {
          content: chunk,
          height: 240,
          width: 350,
          color: 6
        },
        typeVersion: 1
      };
    });
    
    // Add sticky notes to workflow
    workflow.nodes.push(...stickyNotes);
    
    return workflow;
  } catch (error) {
    console.error('Error adding explanation as sticky notes:', error);
    return workflow;
  }
};

// Message handler for communication with popup/options
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.action) {
        case 'getSettings':
          const settings = await getSettings();
          sendResponse({ success: true, settings });
          break;
          
        case 'saveSettings':
          const saveResult = await saveSettings(message.settings);
          sendResponse(saveResult);
          break;
          
        case 'generateWorkflow':
          const { description, includeExplanationAsSticky } = message;
          const currentSettings = await getSettings();
          
          // Generate workflow based on selected API provider
          let result;
          if (currentSettings.apiProvider === API_PROVIDERS.OPENAI) {
            result = await generateWorkflowWithOpenAI(description, currentSettings);
          } else {
            result = await generateWorkflowWithAnthropic(description, currentSettings);
          }
          
          if (result.success) {
            const { workflow, explanation } = result;
            
            // Add explanation as sticky notes if requested
            let finalWorkflow = workflow;
            if (includeExplanationAsSticky && explanation) {
              finalWorkflow = addExplanationAsStickyNotes(workflow, explanation);
            }
            
            // Save workflow to history
            await saveWorkflowToHistory({
              name: finalWorkflow.name,
              description,
              workflow: finalWorkflow,
              explanation
            });
            
            sendResponse({
              success: true,
              workflow: finalWorkflow,
              explanation
            });
          } else {
            sendResponse(result);
          }
          break;
          
        case 'getWorkflowHistory':
          const history = await getWorkflowHistory();
          sendResponse({ success: true, history });
          break;
          
        case 'clearWorkflowHistory':
          const clearResult = await clearWorkflowHistory();
          sendResponse(clearResult);
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  // Return true to indicate async response
  return true;
});

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const settings = await getSettings();
    
    // If no settings exist, set defaults
    if (!settings || Object.keys(settings).length === 0) {
      await saveSettings(DEFAULT_SETTINGS);
    }
    
    console.log('Navis Automate extension initialized');
  } catch (error) {
    console.error('Error initializing extension:', error);
  }
});

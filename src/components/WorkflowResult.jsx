import React, { useState } from 'react';
import Button from './Button';

/**
 * Component to display the generated workflow result
 * @param {Object} props - Component props
 * @param {Object} props.result - The generated workflow result
 * @param {Function} props.onBack - Function called when back button is clicked
 * @returns {JSX.Element} The workflow result component
 */
const WorkflowResult = ({ result, onBack }) => {
  const [activeTab, setActiveTab] = useState('workflow');
  const [copied, setCopied] = useState(false);

  if (!result || !result.workflow) {
    return (
      <div className="alert alert-error">
        No workflow result available
        <Button onClick={onBack} variant="secondary" className="mt-16">
          Back to Generator
        </Button>
      </div>
    );
  }

  const { workflow, explanation } = result;

  // Pretty print JSON for display
  const prettyWorkflow = JSON.stringify(workflow, null, 2);

  // Copy workflow JSON to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(prettyWorkflow).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy workflow: ', err);
      }
    );
  };

  // Handle attempting to inject the workflow to n8n
  const injectToN8n = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'injectWorkflow', workflow },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError);
            }
          }
        );
      }
    });
  };

  return (
    <div>
      <h3>Generated Workflow: {workflow.name}</h3>
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'workflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflow')}
          role="button"
          tabIndex={0}
        >
          Workflow JSON
        </div>
        <div 
          className={`tab ${activeTab === 'explanation' ? 'active' : ''}`}
          onClick={() => setActiveTab('explanation')}
          role="button"
          tabIndex={0}
        >
          Explanation
        </div>
      </div>
      
      {activeTab === 'workflow' && (
        <div className="json-output" role="region" aria-label="Workflow JSON">
          {prettyWorkflow}
        </div>
      )}
      
      {activeTab === 'explanation' && (
        <div className="card" role="region" aria-label="Workflow explanation">
          <div className="explanation">
            {explanation.split('\n').map((paragraph, index) => (
              paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
            ))}
          </div>
        </div>
      )}
      
      <div className="flex-between mt-16">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        
        <div>
          <Button 
            onClick={injectToN8n} 
            variant="primary"
            className="mr-8"
          >
            Import to n8n
          </Button>
          
          <Button 
            onClick={copyToClipboard} 
            variant="secondary"
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowResult;

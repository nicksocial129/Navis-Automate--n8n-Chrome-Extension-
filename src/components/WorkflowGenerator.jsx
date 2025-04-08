import React, { useState } from 'react';
import TextArea from './TextArea';
import Button from './Button';
import { generateWorkflow } from '../utils/storageUtils';

/**
 * Component to generate n8n workflows from natural language descriptions
 * @param {Object} props - Component props
 * @param {Function} props.onWorkflowGenerated - Function called when a workflow is generated
 * @returns {JSX.Element} The workflow generator component
 */
const WorkflowGenerator = ({ onWorkflowGenerated }) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [includeSticky, setIncludeSticky] = useState(true);

  // Sample prompts to help users get started
  const samplePrompts = [
    'Create a workflow that monitors a folder for new CSV files, processes the data, and sends a Slack notification',
    'Build a workflow that fetches daily weather data using an API and saves it to a database',
    'Generate a workflow that monitors Twitter for mentions of my brand and sends the posts to a Google Sheet'
  ];

  // Handle generating workflow
  const handleGenerateWorkflow = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError('Please enter a workflow description');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await generateWorkflow(description, includeSticky);
      
      if (result.success) {
        onWorkflowGenerated(result);
        // Don't clear the description so user can make modifications if needed
      } else {
        setError(result.error || 'Failed to generate workflow');
      }
    } catch (err) {
      setError('Failed to generate workflow');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Set a sample prompt as the description
  const useSamplePrompt = (prompt) => {
    setDescription(prompt);
  };

  return (
    <div>
      <form onSubmit={handleGenerateWorkflow}>
        <TextArea
          id="workflow-description"
          label="Describe the workflow you want to create"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Example: Create a workflow that monitors a Gmail inbox for new emails with attachments, saves the attachments to Google Drive, and sends a Slack notification"
          required
          rows={6}
        />
        
        <div className="flex-between mb-16">
          <label className="flex">
            <input
              type="checkbox"
              checked={includeSticky}
              onChange={(e) => setIncludeSticky(e.target.checked)}
            />
            <span className="ml-8">Include explanation as sticky notes</span>
          </label>
        </div>
        
        {error && (
          <div className="alert alert-error mb-16">{error}</div>
        )}
        
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!description.trim() || isLoading}
        >
          Generate Workflow
        </Button>
      </form>
      
      <div className="mt-16">
        <h3>Sample Prompts</h3>
        <div className="card">
          {samplePrompts.map((prompt, index) => (
            <div 
              key={index}
              className="history-item"
              onClick={() => useSamplePrompt(prompt)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  useSamplePrompt(prompt);
                }
              }}
            >
              {prompt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowGenerator;

import React, { useState, useEffect } from 'react';
import { getWorkflowHistory, clearWorkflowHistory } from '../utils/storageUtils';
import Button from './Button';

/**
 * Component to display workflow history
 * @param {Object} props - Component props
 * @param {Function} props.onSelectWorkflow - Function called when a workflow is selected
 * @returns {JSX.Element} The workflow history component
 */
const WorkflowHistory = ({ onSelectWorkflow }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load workflow history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const workflowHistory = await getWorkflowHistory();
        setHistory(workflowHistory);
        setError(null);
      } catch (err) {
        setError('Failed to load workflow history');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Handle clearing history
  const handleClearHistory = async () => {
    try {
      setIsLoading(true);
      const result = await clearWorkflowHistory();
      
      if (result.success) {
        setHistory([]);
        setError(null);
      } else {
        setError(result.error || 'Failed to clear workflow history');
      }
    } catch (err) {
      setError('Failed to clear workflow history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="text-center"><span className="spinner"></span></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (history.length === 0) {
    return <div className="text-center">No workflow history yet</div>;
  }

  return (
    <div>
      <div className="flex-between mb-16">
        <h3>Recent Workflows</h3>
        <Button 
          variant="secondary" 
          onClick={handleClearHistory}
          disabled={history.length === 0}
        >
          Clear History
        </Button>
      </div>
      
      <div className="card">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="history-item"
            onClick={() => onSelectWorkflow(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectWorkflow(item);
              }
            }}
          >
            <div className="history-item-title">{item.name}</div>
            <div className="history-item-description">{item.description.substring(0, 100)}{item.description.length > 100 ? '...' : ''}</div>
            <div className="history-item-date">{formatDate(item.timestamp)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowHistory;

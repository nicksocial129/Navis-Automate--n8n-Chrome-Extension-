# Navis Automate - Chrome Extension Project Specification

## Overview

Navis Automate is a Chrome extension developed by Navis Digital that enables users to create n8n workflow automations using natural language. The extension leverages AI capabilities from OpenAI or Anthropic to translate user descriptions into functional n8n workflows.

## Target Users

- n8n users seeking to accelerate workflow creation
- Business automation professionals
- No-code/low-code enthusiasts
- Technology teams implementing automation solutions

## Key Features

### Authentication & Setup

- User provides their own OpenAI API key or Anthropic API key during setup
- API keys securely stored using Chrome's storage API
- Optional API endpoint configuration for enterprise deployments

### Core Functionality

- Natural language to n8n workflow conversion
- Direct creation of importable n8n JSON workflows
- Workflow explanation generation
- History of previously created workflows

### User Interface

- **Main Extension Page**
    - Clean, modern design focusing on usability
    - Quick access to create new workflows
    - Access to previously created workflows
    - Settings and configuration options
- **New Workflow Creation**
    - Text input area for natural language description
    - Sample prompts for guidance
    - Processing indicator during AI generation
    - Display area for the generated workflow and explanation
- **Settings Page**
    - AI provider selection (OpenAI/Anthropic)
    - API key management
    - Default explanation format preference
    - Theme selection (light/dark)

### Workflow Output

- Generated n8n workflow as importable JSON
- Detailed explanation of the workflow structure
- Explanation delivery options:
    1. Directly in the extension UI
    2. Embedded as markdown-formatted sticky notes within the workflow JSON

## Technical Requirements

### Chrome Extension Components

- Manifest v3 compliant
- Background service worker for API communications
- Popup UI for main extension interface
- Content scripts for n8n webpage integration
- Storage management for settings and workflow history

### AI Integration

- Support for OpenAI API (GPT-4 and newer models)
- Support for Anthropic API (Claude models)
- Prompt engineering to ensure consistent n8n workflow generation
- Error handling for API rate limits and token limitations

### n8n Integration

- Generate valid, importable n8n workflow JSON
- Support for common n8n nodes and connections
- Proper formatting of sticky notes using markdown
- Validation of generated workflows before presenting to user

## n8n JSON Structure Requirements

To ensure successful import into n8n, all generated JSON must adhere to the following structure:

### Root-Level Structure

```json
json
[ ]

{
  "name": "Workflow Name",
  "nodes": [ ... ],
  "connections": { ... },
  "active": false,
  "settings": {
    "executionOrder": "v1"
  },
  "versionId": "",
  "meta": {
    "instanceId": "unique-string-here"
  },
  "tags": []
}

```

### Node Structure

Each node in the `nodes` array must include:

```json
json
[ ]

{
  "id": "unique-node-id",
  "name": "Descriptive Node Name",
  "type": "n8n-nodes-base.nodeType",
  "position": [x, y],
  "parameters": { ... },
  "typeVersion": 1.0,
  "credentials": { ... }// Optional, only if needed
}

```

Key requirements:

- `id`: Must be a unique string (recommend using UUID v4)
- `name`: Descriptive name shown in the UI
- `type`: Must use valid n8n node types (e.g., "n8n-nodes-base.httpRequest")
- `position`: Array of [x, y] coordinates on the canvas (integers, typically multiples of 20)
- `typeVersion`: Version number of the node (typically an integer or decimal value)
- `parameters`: Node-specific configuration (varies by node type)

### Parameters Structure

The `parameters` object varies by node type but typically follows this pattern:

```json
json
[ ]

"parameters": {
  "operation": "someOperation",
  "resource": "someResource",
  "options": { ... },
// Other node-specific parameters
}

```

### Connections Structure

Connections define how data flows between nodes:

```json
json
[ ]

"connections": {
  "Node-Name-1": {
    "main": [
      [
        {
          "node": "Node-Name-2",
          "type": "main",
          "index": 0
        }
      ]
    ]
  },
  "Node-Name-3": {
    "main": [
      [
        {
          "node": "Node-Name-4",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}

```

Key requirements:

- Each source node has an entry in the connections object
- Connections define where the output of each node goes
- Index refers to which output (for source) or input (for destination) to use
- AI nodes may have special connection types like "ai_tool", "ai_memory", or "ai_languageModel"

### Sticky Note Structure

For adding explanations as sticky notes:

```json
json
[ ]

{
  "id": "unique-note-id",
  "name": "Sticky Note",
  "type": "n8n-nodes-base.stickyNote",
  "position": [x, y],
  "parameters": {
    "content": "## Title\n\n**Bold text** for emphasis\n\nExplanation of workflow functionality...",
    "height": 240,
    "width": 320,
    "color": 6// Optional color code (1-7)
  },
  "typeVersion": 1
}

```

### Node Positioning Best Practices

- Start main trigger node at position [0, 0] or [200, 200]
- Space nodes horizontally by ~200px and vertically by ~100px
- Place sticky notes near related nodes
- Avoid overlapping nodes or connections
- Group related nodes visually

### AI Node-Specific Requirements

For workflows using AI capabilities:

```json
json
[ ]

{
  "id": "unique-ai-node-id",
  "name": "AI Model Node",
  "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
  "position": [x, y],
  "parameters": {
    "model": {
      "__rl": true,
      "mode": "list",
      "value": "gpt-4o-mini"
    },
    "options": {
      "temperature": 0.7
    }
  },
  "credentials": {
    "openAiApi": {
      "id": "credential-placeholder-id",
      "name": "OpenAI account"
    }
  },
  "typeVersion": 1.2
}

```

### Common Node Types

Ensure correct type strings for these common nodes:

- "n8n-nodes-base.httpRequest" - HTTP Request
- "n8n-nodes-base.set" - Set node
- "n8n-nodes-base.if" - If node
- "n8n-nodes-base.switch" - Switch node
- "n8n-nodes-base.code" - Code node
- "n8n-nodes-base.stickyNote" - Sticky Note
- "n8n-nodes-base.manualTrigger" - Manual Trigger
- "n8n-nodes-base.scheduleTrigger" - Schedule Trigger
- "@n8n/n8n-nodes-langchain.agent" - AI Agent
- "@n8n/n8n-nodes-langchain.chainLlm" - Basic LLM
- "@n8n/n8n-nodes-langchain.lmChatOpenAi" - OpenAI Chat Model
- "@n8n/n8n-nodes-langchain.memoryBufferWindow" - Window Buffer Memory

## User Journey

1. **Installation**: User installs the Navis Automate extension from the Chrome Web Store
2. **Setup**: User configures the extension with their preferred AI provider and API key
3. **Usage**:
    - User navigates to n8n
    - User clicks the Navis Automate extension icon
    - User describes the desired workflow in natural language
    - Extension processes the request via the selected AI
    - Extension displays the generated n8n workflow and explanation
4. **Implementation**:
    - User reviews the generated workflow and explanation
    - User imports the workflow JSON into n8n
    - User makes any necessary adjustments
    - User activates the workflow

## Development Phases

### Phase 1: Core Extension Development

- Create extension architecture
- Implement UI components
- Establish API connection framework
- Develop storage mechanisms

### Phase 2: AI Integration

- Integrate OpenAI API
- Integrate Anthropic API
- Create prompt templates
- Develop n8n JSON generation capabilities

### Phase 3: Workflow Testing and Refinement

- Test various workflow generation scenarios
- Refine AI prompts based on test results
- Optimize generated workflow JSON structure
- Improve workflow explanations

### Phase 4: Finalization and Deployment

- Comprehensive testing across different n8n versions
- Security review and optimization
- Performance optimization
- Chrome Web Store submission

## Technical Specifications

### Extension Architecture

- **Manifest.json**: Extension configuration
- **Background Script**: API handling, communication management
- **Popup UI**: React-based user interface
- **Content Scripts**: n8n page integration
- **Storage**: Chrome storage API for settings and history
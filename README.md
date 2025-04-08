# Navis Automate - n8n Workflow Generator

Navis Automate is a Chrome extension that enables users to create n8n workflow automations using natural language. The extension leverages AI capabilities from OpenAI or Anthropic to translate user descriptions into functional n8n workflows.

## Features

- **Natural Language to n8n Workflow**: Describe your automation needs in plain English, and let AI generate the workflow for you
- **Multiple AI Providers**: Support for both OpenAI and Anthropic models
- **Workflow Explanations**: Generated workflows include detailed explanations for better understanding
- **History Management**: Save and access previously created workflows
- **Theme Options**: Light and dark mode support

## Installation

### From Chrome Web Store

1. Visit the [Navis Automate page on the Chrome Web Store](#) (coming soon)
2. Click "Add to Chrome"
3. Confirm the installation when prompted

### Manual Installation (Development)

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the extension:
   ```
   npm run build
   ```
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" (toggle in the top right)
6. Click "Load unpacked" and select the `dist` folder from this project

## Usage

1. **Setup**: After installation, click the extension icon and navigate to Settings to configure your API key
2. **Create Workflows**:
   - Click the Navis Automate icon in your Chrome extensions
   - Enter a description of your desired workflow
   - Click "Generate Workflow"
   - Review the generated workflow JSON and explanation
3. **Import to n8n**:
   - Navigate to your n8n instance
   - Click "Import to n8n" in the extension popup while on the n8n page
   - Or copy the JSON and paste it manually into n8n's import dialog

## API Key Setup

1. For OpenAI: Obtain an API key from [OpenAI's platform](https://platform.openai.com/api-keys)
2. For Anthropic: Get an API key from [Anthropic's console](https://console.anthropic.com/keys)
3. Add your key in the extension's Settings page

## Development

- Run development build with auto-reload:
  ```
  npm run dev
  ```
- Run tests:
  ```
  npm test
  ```

## License

MIT License

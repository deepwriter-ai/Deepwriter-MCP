# DeepWriter MCP Server

A Model Context Protocol (MCP) server for interacting with the DeepWriter API. This server provides tools for creating, managing, and generating content for DeepWriter projects.

## Features

- **Project Management**: Create, list, update, and delete projects
- **Content Generation**: Generate content for projects using DeepWriter's AI
- **Project Details**: Retrieve detailed information about projects
- **MCP Integration**: Seamlessly integrate with Claude and other MCP-compatible AI assistants

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- DeepWriter API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/deepwriter-mcp.git
   cd deepwriter-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your DeepWriter API key:
   ```
   DEEPWRITER_API_KEY=your_api_key_here
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Starting the Server

Start the MCP server:

```bash
node dist/index.js
```

The server will listen on stdin for MCP requests and respond on stdout.

### Connecting to Claude

To use the DeepWriter MCP server with Claude:

1. In Claude, add the MCP server using the following command:
   ```
   npx -y @smithery/cli@latest run deepwriter-mcp
   ```

2. Once connected, you can use the DeepWriter tools directly in Claude.

### Available Tools

#### 1. listProjects

Lists all projects associated with your DeepWriter account.

```json
{
  "api_key": "your_api_key_here"
}
```

#### 2. getProjectDetails

Retrieves detailed information about a specific project.

```json
{
  "api_key": "your_api_key_here",
  "project_id": "your_project_id_here"
}
```

#### 3. createProject

Creates a new project with the specified title and email.

```json
{
  "api_key": "your_api_key_here",
  "title": "Your Project Title",
  "email": "your_email@example.com"
}
```

#### 4. updateProject

Updates an existing project with the specified changes.

```json
{
  "api_key": "your_api_key_here",
  "project_id": "your_project_id_here",
  "updates": {
    "title": "Updated Project Title",
    "prompt": "Updated project prompt",
    "author": "Updated author name"
    // Other fields as needed
  }
}
```

#### 5. generateWork

Generates content for a project using DeepWriter's AI.

```json
{
  "api_key": "your_api_key_here",
  "project_id": "your_project_id_here",
  "is_default": true // Optional, defaults to true
}
```

#### 6. deleteProject

Deletes a project.

```json
{
  "api_key": "your_api_key_here",
  "project_id": "your_project_id_here"
}
```

## Example Workflow

Here's an example of how to use the DeepWriter MCP server with Claude:

1. List all projects:
   ```
   <use_mcp_tool>
   <server_name>deepwriter-mcp</server_name>
   <tool_name>listProjects</tool_name>
   <arguments>
   {
     "api_key": "your_api_key_here"
   }
   </arguments>
   </use_mcp_tool>
   ```

2. Create a new project:
   ```
   <use_mcp_tool>
   <server_name>deepwriter-mcp</server_name>
   <tool_name>createProject</tool_name>
   <arguments>
   {
     "api_key": "your_api_key_here",
     "title": "My New Project",
     "email": "your_email@example.com"
   }
   </arguments>
   </use_mcp_tool>
   ```

3. Update the project:
   ```
   <use_mcp_tool>
   <server_name>deepwriter-mcp</server_name>
   <tool_name>updateProject</tool_name>
   <arguments>
   {
     "api_key": "your_api_key_here",
     "project_id": "your_project_id_here",
     "updates": {
       "prompt": "Write a 3-page paper on artificial intelligence"
     }
   }
   </arguments>
   </use_mcp_tool>
   ```

4. Generate content:
   ```
   <use_mcp_tool>
   <server_name>deepwriter-mcp</server_name>
   <tool_name>generateWork</tool_name>
   <arguments>
   {
     "api_key": "your_api_key_here",
     "project_id": "your_project_id_here"
   }
   </arguments>
   </use_mcp_tool>
   ```

## Development

### Project Structure

- `src/index.ts`: Main entry point for the MCP server
- `src/api/deepwriterClient.ts`: Client for interacting with the DeepWriter API
- `src/tools/`: Individual MCP tools for different DeepWriter operations

### Building

```bash
npm run build
```

### Testing

You can test the MCP server locally using the provided test scripts:

```bash
node test-mcp-client.js
```

or

```bash
node test-deepwriter-tools.js
```

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure your DeepWriter API key is correctly set in the `.env` file.
2. **Connection Problems**: Make sure the DeepWriter API is accessible from your network.
3. **Parameter Naming**: The server supports both `project_id` and `projectId` parameter names for compatibility.

### Debugging

For detailed logs, run the server with the DEBUG environment variable:

```bash
DEBUG=deepwriter-mcp:* node dist/index.js
```

## License

[MIT](LICENSE)

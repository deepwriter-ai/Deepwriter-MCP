# DeepWriter MCP Server

A Model Context Protocol (MCP) server for interacting with the DeepWriter API. This server provides tools for creating, managing, and generating content for DeepWriter projects through the standardized MCP interface.

<a href="https://glama.ai/mcp/servers/@deepwriter-ai/Deepwriter-MCP">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@deepwriter-ai/Deepwriter-MCP/badge" alt="DeepWriter Server MCP server" />
</a>

## Features

- **Project Management**: Create, list, update, and delete projects
- **Content Generation**: Generate content for projects using DeepWriter's AI
- **Project Details**: Retrieve detailed information about projects
- **MCP Integration**: Seamlessly integrate with Claude and other MCP-compatible AI assistants
- **Standard MCP Features**: Implements MCP protocol version 2025-03-26
- **Transport Support**: Stdio transport for local process communication

## Prerequisites

- Node.js (v17 or higher)
- npm (v6 or higher)
- DeepWriter API key
- An MCP-compatible client (e.g., Claude for Desktop)

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
node build/index.js
```

The server will listen on stdin for MCP requests and respond on stdout, following the MCP stdio transport specification.

### Connecting to Claude for Desktop

To use the DeepWriter MCP server with Claude for Desktop:

1. Open your Claude for Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the server configuration:
   ```json
   {
     "mcpServers": {
       "deepwriter": {
         "command": "node",
         "args": ["/ABSOLUTE/PATH/TO/deepwriter-mcp/build/index.js"],
         "env": {
           "DEEPWRITER_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

3. Restart Claude for Desktop to load the new configuration.

### MCP Protocol Support

This server implements MCP protocol version 2025-03-26 with the following capabilities:

- **Transport**: Stdio transport for local process communication
- **Tools**: Full support for all DeepWriter API operations
- **Logging**: Structured logging with configurable levels

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
    "author": "Updated author name",
    "email": "updated@email.com",
    "model": "Updated model name",
    "outline_text": "Updated outline",
    "style_text": "Updated style guide",
    "supplemental_info": "Updated additional information",
    "work_description": "Updated work description",
    "work_details": "Updated work details",
    "work_vision": "Updated work vision"
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

## Development

### Project Structure

```
deepwriter-mcp/
├── src/
│   ├── index.ts              # Main entry point and MCP server setup
│   ├── api/
│   │   └── deepwriterClient.ts  # DeepWriter API client
│   └── tools/                # MCP tool implementations
│       ├── createProject.ts
│       ├── deleteProject.ts
│       ├── generateWork.ts
│       ├── getProjectDetails.ts
│       ├── listProjects.ts
│       └── updateProject.ts
├── build/                    # Compiled JavaScript output
├── test-deepwriter-tools.js  # Tool testing script
├── test-mcp-client.js       # MCP client testing script
└── tsconfig.json            # TypeScript configuration
```

### Building

```bash
npm run build
```

This will compile the TypeScript code into JavaScript in the `build` directory.

### Testing

You can test the MCP server locally using the provided test scripts:

```bash
node test-mcp-client.js
```

or

```bash
node test-deepwriter-tools.js
```

### TypeScript Configuration

The project uses TypeScript with ES modules and Node16 module resolution. Key TypeScript settings:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "strict": true
  }
}
```

## Troubleshooting

### Common Issues

1. **API Key Issues**:
   - Ensure your DeepWriter API key is correctly set in the `.env` file
   - Check that the API key is being passed correctly in tool arguments
   - Verify the API key has the necessary permissions

2. **Connection Problems**:
   - Make sure the DeepWriter API is accessible from your network
   - Check for any firewall or proxy settings that might block connections
   - Verify your network connection is stable

3. **MCP Protocol Issues**:
   - Ensure you're using a compatible MCP client
   - Check that the stdio transport is properly configured
   - Verify the client supports protocol version 2025-03-26

4. **Parameter Naming**:
   - The server supports both snake_case (`project_id`) and camelCase (`projectId`) parameter names
   - All parameters are case-sensitive
   - Required parameters must not be null or undefined

### Debugging

For detailed logs, run the server with the DEBUG environment variable:

```bash
DEBUG=deepwriter-mcp:* node build/index.js
```

You can also check Claude for Desktop logs at:
- macOS: `~/Library/Logs/Claude/mcp*.log`
- Windows: `%APPDATA%\Claude\logs\mcp*.log`

## Contributing

We welcome contributions from the community! Here's how you can help:

### Submitting Issues

1. **Bug Reports**
   - Use the GitHub issue tracker
   - Include detailed steps to reproduce the bug
   - Provide your environment details (Node.js version, OS, etc.)
   - Include relevant logs and error messages
   - Use the bug report template provided

2. **Feature Requests**
   - Use the GitHub issue tracker with the "enhancement" label
   - Clearly describe the feature and its use case
   - Explain how it benefits the project
   - Use the feature request template provided

3. **Security Issues**
   - For security vulnerabilities, please DO NOT create a public issue
   - Email security@deepwriter.com instead
   - We'll work with you to address the vulnerability
   - We follow responsible disclosure practices

### Pull Requests

1. **Before Starting**
   - Check existing issues and PRs to avoid duplicate work
   - For major changes, open an issue first to discuss
   - Read our coding standards and MCP implementation guidelines

2. **Development Process**
   - Fork the repository
   - Create a new branch from `main`
   - Follow our coding style and conventions
   - Add tests for new features
   - Update documentation as needed

3. **PR Requirements**
   - Include a clear description of changes
   - Link related issues
   - Add or update tests
   - Update documentation
   - Follow commit message conventions
   - Sign the Contributor License Agreement (CLA)

4. **Code Review**
   - All PRs require at least one review
   - Address review feedback
   - Keep PRs focused and reasonable in size
   - Be responsive to questions and comments

### Development Guidelines

1. **Code Style**
   - Follow TypeScript best practices
   - Use ESLint with our configuration
   - Format code with Prettier
   - Follow MCP protocol specifications

2. **Testing**
   - Write unit tests for new features
   - Maintain or improve test coverage
   - Test MCP protocol compliance
   - Test with multiple Node.js versions

3. **Documentation**
   - Update README.md for user-facing changes
   - Add JSDoc comments for new code
   - Update API documentation
   - Include examples for new features

4. **Commit Messages**
   - Follow conventional commits format
   - Reference issues where appropriate
   - Keep commits focused and atomic
   - Use clear, descriptive messages

### Getting Help

- Join our Discord community
- Check the documentation
- Ask questions in GitHub discussions
- Attend our monthly contributor calls
## Security

- The server validates all inputs before processing
- API keys are never logged or exposed in error messages
- The stdio transport provides process isolation
- All external API calls use HTTPS
- Input validation prevents injection attacks

## License

[MIT](LICENSE)
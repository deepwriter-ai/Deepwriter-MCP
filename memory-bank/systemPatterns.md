# System Patterns: DeepWriter MCP Server

## Architecture Overview
- **MCP Server**: Implements stdio or SSE protocol for tool communication.
- **Tool Layer**: Each DeepWriter API operation is exposed as a discrete MCP tool with strict input/output schemas.
- **API Integration**: Uses HTTP(S) requests to DeepWriter endpoints, passing the API key in the `x-api-key` header.
- **Error Handling**: Centralized error handler for mapping API errors (401, 403, 404, 400, 500) to MCP tool responses.
- **Security**: API keys are never logged; all requests use HTTPS; input is sanitized; rate limiting is enforced.
- **Logging**: Activity and errors are logged (excluding sensitive data) for debugging and transparency.
- **Resource Layer**: Exposes API key validation status, rate limits, usage stats, error logs, and request history as MCP resources.

## Key Technical Decisions
- Use Node.js/TypeScript for rapid development and strong typing.
- Use `fetch` for HTTP requests.
- Use `dotenv` or environment variables for secure API key storage.
- Implement retry logic for transient API failures.
- Modularize each tool for maintainability and testability.

## Design Patterns
- **Command Pattern**: Each MCP tool is a command handler.
- **Adapter Pattern**: Adapts DeepWriter API responses to MCP tool output schemas.
- **Singleton/Context**: Centralized context for logging, rate limiting, and resource management.

## Component Relationships
- MCP server core manages tool registration and protocol.
- Each tool module interacts with the DeepWriter API and error handler.
- Logging and resource modules are shared across tools.

## Extensibility
- New DeepWriter endpoints can be added as new MCP tools.
- Schemas and error handling are easily updatable.
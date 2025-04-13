# Tech Context: DeepWriter MCP Server

## Technologies Used
- **Node.js**: Server runtime for JavaScript/TypeScript.
- **TypeScript**: Strong typing for reliability and maintainability.
- **fetch (node-fetch or native)**: HTTP requests to DeepWriter API.
- **dotenv**: Manage environment variables securely.
- **Jest or Mocha**: Testing framework for unit and integration tests.
- **Winston or pino**: Logging library for structured logs.

## Development Setup
- Node.js (LTS) and npm/yarn required.
- TypeScript configuration for strict type checking.
- .env file for local development (never commit API keys).
- Scripts for build, test, and start.

## Technical Constraints
- All API requests must use HTTPS.
- API keys must never be logged or exposed.
- Input/output must strictly follow provided schemas.
- Error handling must cover all specified cases.
- Rate limiting and retry logic must be implemented.

## Dependencies
- node-fetch (or native fetch in Node 18+)
- dotenv
- typescript
- jest/mocha (for testing)
- winston/pino (for logging)
- Additional MCP protocol libraries as needed

## Integration Points
- DeepWriter API endpoints (as specified in the implementation guide).
- MCP stdio or SSE protocol for tool communication.

## Security Considerations
- Secure storage and handling of API keys.
- Input sanitization and validation.
- Regular dependency updates and vulnerability monitoring.
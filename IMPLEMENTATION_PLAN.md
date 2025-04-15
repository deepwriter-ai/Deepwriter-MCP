# DeepWriter MCP Server Upgrade Plan

## Overview
This document outlines the plan for upgrading the DeepWriter MCP server to match the latest Model Context Protocol specification (2025-03-26).

## Current State
- Basic JSON-RPC 2.0 support implemented
- Initialization handshake working
- Core tools for DeepWriter API integration exist
- Added to Claude's MCP settings

## Required Upgrades
1. Transport layer needs to support both stdio and new Streamable HTTP
2. Authorization framework needs to be implemented (OAuth 2.1)
3. Tool annotations need to be added for better behavior description
4. Support for JSON-RPC batching
5. Progress notifications need message field
6. Audio content type support
7. Completions capability for argument suggestions

## Implementation Phases

### Phase 1: Core Protocol Updates
1. JSON-RPC Updates
   - Add support for message batching
   - Update message validation
   - Enhance error handling

2. Tool Enhancements
   - Add tool annotations (readOnlyHint, destructiveHint, etc.)
   - Update tool response formats
   - Implement completions capability

3. Protocol Compliance
   - Update initialization handshake
   - Update error codes and messages
   - Add support for new content types

### Phase 2: Transport Layer
1. Streamable HTTP Implementation
   - Add HTTP transport support
   - Implement SSE streaming
   - Add session management
   - Add Origin validation
   - Configure localhost-only binding

2. STDIO Transport Updates
   - Update for batching support
   - Enhance error handling
   - Add session support

3. Transport Security
   - Implement proper headers
   - Add CORS configuration
   - Add rate limiting

### Phase 3: Authorization
1. OAuth 2.1 Implementation
   - Add authorization endpoints
   - Implement OAuth flows
   - Add token management
   - Add session security

2. Security Features
   - Add metadata discovery
   - Implement client registration
   - Add token validation
   - Add security headers

3. Rate Limiting
   - Add request tracking
   - Implement rate limits
   - Add usage monitoring
   - Add error responses

### Phase 4: Enhanced Features
1. Completions Support
   - Add completions capability
   - Implement argument suggestions
   - Add resource completion
   - Add prompt completion

2. Progress & Content
   - Update progress notifications
   - Add message field support
   - Add audio content type
   - Enhance resource handling

3. Error Handling
   - Update error responses
   - Add detailed messages
   - Implement logging
   - Add debugging support

### Phase 5: Testing & Documentation
1. Testing
   - Update test suite
   - Add new test cases
   - Test all transports
   - Test authorization
   - Test rate limiting

2. Documentation
   - Update API docs
   - Add security guide
   - Add upgrade guide
   - Update examples

3. Security Review
   - Audit code
   - Check dependencies
   - Review configurations
   - Test security measures

## Timeline
- Phase 1: 1 week
- Phase 2: 1 week
- Phase 3: 1 week
- Phase 4: 1 week
- Phase 5: 1 week

Total estimated time: 5 weeks

## Success Criteria
1. All features from MCP spec 2025-03-26 implemented
2. Passing test suite
3. Updated documentation
4. Security review completed
5. Successful integration with Claude Desktop

## Risks and Mitigations
1. Risk: Breaking changes for existing clients
   - Mitigation: Version support, upgrade guide

2. Risk: Security vulnerabilities
   - Mitigation: Security review, testing

3. Risk: Performance issues
   - Mitigation: Load testing, monitoring

4. Risk: Integration issues
   - Mitigation: Thorough testing, fallbacks
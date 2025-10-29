# Project Context

## Purpose
Azure AI Foundry Agent ServiceとVercel AI SDKを統合したチャットアプリケーションの開発。useChatフックを使用してリアルタイムストリーミングチャット機能を実装し、Azure Agent Serviceの機能を活用する。

## Tech Stack
- **Frontend**: React, Next.js, TypeScript, @ai-sdk/react (useChat)
- **Backend**: Next.js API Routes (Node.js runtime)
- **Authentication**: MSAL Node (Client Credentials Flow)
- **AI Service**: Azure AI Foundry Agent Service
- **Streaming**: Server-Sent Events (SSE) → UI Message Stream

## Project Conventions

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- kebab-case for file names
- PascalCase for components
- camelCase for variables and functions

### Architecture Patterns
- **SSE Proxy Pattern**: Azure SSE → Vercel UI Message Stream conversion
- **Client Credentials Flow**: Service Principal authentication
- **Streaming Bridge**: Real-time message streaming between Azure and client
- **Error Handling**: Graceful degradation with proper error boundaries

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for chat functionality
- Mock Azure services for development

### Git Workflow
- Feature branches from main
- Conventional commits
- PR reviews required
- Automated testing on CI/CD

## Domain Context

### Azure AI Foundry Integration
- **Project Endpoint**: `https://<aiservices-id>.services.ai.azure.com/api/projects/<project-name>`
- **Authentication**: OAuth2 with `https://ai.azure.com/.default` scope
- **Agent Service**: Create Thread and Run with streaming support
- **SSE Events**: `thread.message.delta`, `thread.message.completed`, `[DONE]` termination

### Vercel AI SDK Integration
- **UI Message Stream**: `text-start`, `text-delta`, `text-end`, `finish` events
- **useChat Hook**: Real-time streaming chat interface
- **Message Format**: UIMessage with parts array structure

### Message Flow Architecture
1. **Client**: useChat sends UIMessage[] to `/api/agent`
2. **Server**: MSAL Node acquires Bearer token
3. **Azure**: Create Thread and Run with stream:true
4. **Streaming**: Azure SSE events → UI Message Stream conversion
5. **Client**: Real-time message updates via useChat

## Important Constraints

### Azure Requirements
- Service Principal with Azure AI User role
- Proper RBAC scope (Resource Group/Project level)
- Client credentials flow only
- Project endpoint format compliance

### Technical Constraints
- Node.js runtime required for SSE proxy
- 60-second max duration for API routes
- Proper signal handling for client cancellation
- Defensive JSON parsing for Azure event variations

### Security Constraints
- Environment variables for sensitive data
- Bearer token validation
- Proper error handling without exposing internals
- Rate limiting considerations

## External Dependencies

### Azure Services
- **Azure AI Foundry**: Agent Service, Project Endpoint
- **Azure Entra ID**: Authentication and authorization
- **MSAL Node**: Token acquisition and management

### NPM Packages
- `@ai-sdk/react`: useChat hook and UI Message Stream
- `@azure/msal-node`: Azure authentication
- `ai`: Core AI SDK utilities

### Environment Variables
```bash
AZURE_TENANT_ID=<your-tenant-id>
AZURE_CLIENT_ID=<your-app-registration-client-id>
AZURE_CLIENT_SECRET=<your-client-secret>
AZURE_PROJECT_ENDPOINT=https://<aiservices-id>.services.ai.azure.com/api/projects/<project-name>
AZURE_AGENT_ID=<agent_xxx>
```

## Implementation Details

### API Route Structure
- **File**: `app/api/agent/route.ts`
- **Runtime**: Node.js
- **Method**: POST
- **Response**: createUIMessageStreamResponse

### Key Functions
- `getAccessToken()`: MSAL token acquisition
- `toAgentThreadMessages()`: UIMessage → Agent format conversion
- `pumpSse()`: SSE event parsing and handling
- Event mapping: Azure events → UI Message Stream events

### Error Handling
- Token acquisition failures
- Azure API errors (401/403/404)
- Stream interruption handling
- JSON parsing errors

### Future Enhancements
- Persistent thread management
- Tool integration (File Search, Code Interpreter, Bing Grounding)
- Multi-agent support
- Conversation history persistence

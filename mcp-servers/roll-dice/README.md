# Roll Dice MCP Server

**Week 6 Prerequisites**: Authentication-ready MCP server for Agent Security Advanced curriculum

## Overview

A Model Context Protocol (MCP) server that provides dice rolling functionality with built-in security hooks for OAuth 2.1 authentication (Week 7).

## Features

- 🎲 Roll single or multiple dice
- 🔒 Authentication hooks ready for OAuth 2.1
- 📊 Security event logging
- 🎯 RPG-friendly d20 roller with critical feedback
- ✅ Input validation and rate limiting ready

## Tools Provided

### 1. `roll_dice`
Roll a single dice with specified sides.

**Parameters:**
- `sides` (number, optional): Number of sides (2-100), default: 6

**Example:**
```json
{
  "name": "roll_dice",
  "arguments": { "sides": 20 }
}
```

### 2. `roll_multiple_dice`
Roll multiple dice at once.

**Parameters:**
- `count` (number, required): Number of dice (1-20)
- `sides` (number, optional): Sides per dice (2-100), default: 6

**Example:**
```json
{
  "name": "roll_multiple_dice",
  "arguments": { "count": 3, "sides": 6 }
}
```

### 3. `roll_d20`
Quick 20-sided dice roll with RPG feedback.

**Example:**
```json
{
  "name": "roll_d20",
  "arguments": {}
}
```

## Installation

```bash
cd mcp-servers/roll-dice
npm install
npm run build
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### With Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "roll-dice": {
      "command": "node",
      "args": [
        "C:\\Users\\Paulz\\my-digital-portfolio\\mcp-servers\\roll-dice\\dist\\index.js"
      ],
      "env": {
        "MCP_AUTH_TOKEN": "your-secret-token-here"
      }
    }
  }
}
```

## Week 6 Checklist

### ✅ Completed
- [x] Basic MCP server structure
- [x] Tool definitions (roll_dice, roll_multiple_dice, roll_d20)
- [x] Input validation
- [x] Security event logging hooks
- [x] Authentication placeholder functions
- [x] Environment variable support

### 🔜 Week 7 (OAuth 2.1)
- [ ] Replace `validateAuthentication()` with OAuth token validation
- [ ] Implement JWT token parsing
- [ ] Add token expiration checks
- [ ] Integrate with OAuth authorization server
- [ ] Add refresh token support
- [ ] Implement rate limiting per client

## Security Features (Week 6 Ready)

### 1. Authentication Hook
```typescript
function validateAuthentication(): boolean {
  // Week 7: Will validate OAuth 2.1 JWT tokens
  const authToken = process.env.MCP_AUTH_TOKEN;
  return authToken === process.env.MCP_AUTH_TOKEN;
}
```

### 2. Security Event Logging
```typescript
logSecurityEvent('tool_called', {
  tool: name,
  authenticated: true
});
```

### 3. Input Validation
- Dice sides: 2-100 range
- Dice count: 1-20 limit
- Prevents DoS through excessive rolls

## Environment Variables

Create `.env` file:

```bash
# Week 6: Simple token authentication
MCP_AUTH_TOKEN=dev-token-replace-in-week-7

# Week 7: OAuth 2.1 (to be added)
# OAUTH_CLIENT_ID=
# OAUTH_CLIENT_SECRET=
# OAUTH_ISSUER=
# OAUTH_AUDIENCE=

# Environment
NODE_ENV=development
```

## Testing

### Manual Testing
```bash
# Start server
npm run dev

# In another terminal, test with MCP client
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

### Expected Output
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "roll_dice",
        "description": "Roll a single dice...",
        "inputSchema": {...}
      }
    ]
  }
}
```

## Security Metrics (Week 6 Baseline)

Track these metrics for Week 7 OAuth implementation:

- **Authentication Attempts**: Currently logged via `validateAuthentication()`
- **Tool Call Frequency**: Logged per `tool_called` event
- **Failed Requests**: Caught in error handlers
- **Token Usage**: Will track JWT usage in Week 7

## Architecture

```
roll-dice-mcp/
├── src/
│   └── index.ts          # Main server with auth hooks
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Week 6 Learning Objectives

1. ✅ **MCP Server Basics**: Understand Server, Transport, and Tool patterns
2. ✅ **Authentication Readiness**: Hooks in place for OAuth 2.1
3. ✅ **Security Logging**: Event tracking for analytics
4. ✅ **Environment Config**: Secret management preparation
5. ✅ **Input Validation**: Basic security controls

## Next Steps (Week 7)

1. Implement OAuth 2.1 Authorization Server
2. Replace token validation with JWT parsing
3. Add refresh token flow
4. Implement rate limiting per OAuth client
5. Add audit logging to database
6. Create OAuth client demo application

## Troubleshooting

### Server won't start
```bash
# Check Node version (requires 18+)
node --version

# Rebuild
npm run build
```

### Authentication fails
```bash
# Verify environment variable is set
echo $MCP_AUTH_TOKEN  # Unix
echo %MCP_AUTH_TOKEN%  # Windows
```

### Tools not appearing in Claude
1. Restart Claude Desktop
2. Check `claude_desktop_config.json` path is correct
3. Verify `dist/index.js` exists after build

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [OAuth 2.1 Specification](https://oauth.net/2.1/)
- [Agent Security Workshop](https://github.com/anthropics/courses)

---

**Status**: ✅ Week 6 Complete - Ready for OAuth 2.1 (Week 7)
**Version**: 1.0.0
**Author**: Paul D
**License**: MIT

# MCP Servers - Model Context Protocol Integration

This directory contains Model Context Protocol (MCP) server configurations and documentation for the portfolio.

## What is MCP?

Model Context Protocol (MCP) is a standard that allows AI assistants like Claude to interact with external tools and data sources. This portfolio demonstrates MCP integration with a dice rolling server.

## Available Servers

### 1. Dice Roller (`/api/mcp`)

A production-ready MCP server that provides dice rolling functionality to Claude Desktop.

**Features:**
- 🎲 Roll dice with 2-100 sides
- 🎯 Multiple dice rolls with totals
- 🎮 RPG-specific d20 with critical feedback
- ⚡ Fast API route implementation
- 🔒 Ready for OAuth 2.1 (Week 7)

**Tools:**
- `roll_dice` - Roll a single custom dice
- `roll_multiple_dice` - Roll multiple dice
- `roll_d20` - d20 with RPG feedback
- `roll_d6` - Quick standard dice

## Setup for Claude Desktop

### Configuration File Locations

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Local Development

1. Start your dev server:
   ```bash
   pnpm dev
   ```

2. Use the local configuration:
   ```json
   {
     "mcpServers": {
       "rolldice": {
         "command": "npx",
         "args": ["-y", "mcp-remote", "http://localhost:3000/api/mcp"]
       }
     }
   }
   ```

3. Restart Claude Desktop

### Cloud Deployment

Use the deployed Vercel URL:

```json
{
  "mcpServers": {
    "rolldice": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://your-domain.vercel.app/api/mcp"]
    }
  }
}
```

## Testing the MCP Server

### 1. API Test (via curl)

```bash
# List available tools
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Call a tool
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"roll_d20","arguments":{}}}'
```

### 2. Browser Test

Visit: `http://localhost:3000/api/mcp`

You'll see server information and available tools.

### 3. Claude Desktop Test

1. Configure Claude Desktop (see above)
2. Restart Claude Desktop
3. Look for 🔨 hammer icon in input box
4. Try: "Roll a 20-sided dice"

## Architecture

```
Portfolio App (Next.js)
├── app/api/mcp/route.ts          # MCP server API endpoint
├── lib/mcp/dice-roller.ts        # Dice rolling logic
├── app/mcp-demo/page.tsx         # Demo & documentation page
└── mcp-servers/
    ├── claude_desktop_config.json # Config template
    └── docs/                      # Documentation
```

## Week 6 Checklist (Agent Security Advanced Prerequisites)

- [x] ✅ MCP server implemented
- [x] ✅ Tools defined and tested
- [x] ✅ API route created
- [x] ✅ Documentation complete
- [x] ✅ Demo page created
- [ ] 🔄 Authentication hooks ready (placeholder in place)
- [ ] 🔄 Logging instrumentation (basic)
- [ ] 📅 Week 7: OAuth 2.1 implementation

## Week 7 Preview: OAuth 2.1 Security

The current implementation includes hooks for OAuth 2.1 authentication:

**What's Coming:**
- JWT token validation
- Client authentication
- Rate limiting per client
- Token refresh flow
- Audit logging
- Security metrics dashboard

## Troubleshooting

### MCP Server Not Appearing in Claude

1. Check config file path is correct
2. Verify JSON is valid (no trailing commas)
3. Ensure server is running (`pnpm dev`)
4. Restart Claude Desktop completely

### "Connection Refused" Error

- For local: Make sure `pnpm dev` is running
- For cloud: Check deployment is live on Vercel

### Tools Not Working

1. Check browser console for errors
2. Test API endpoint directly (curl)
3. Verify `@modelcontextprotocol/sdk` is installed

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Demo Page](/mcp-demo) - Live examples
- [API Endpoint](/api/mcp) - Server info
- [Week 6 Curriculum](../docs/week6-prerequisites.md)

---

**Status:** ✅ Week 6 Complete
**Next:** Week 7 - OAuth 2.1 Implementation

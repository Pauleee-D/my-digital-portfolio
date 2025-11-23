#!/usr/bin/env node

/**
 * Roll Dice MCP Server
 *
 * Week 6 Prerequisites: Authentication-ready MCP server
 * Implements basic dice rolling functionality with hooks for:
 * - Authentication validation
 * - Logging and analytics
 * - Secret management
 * - Security metrics
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Security hook: Authentication validation
 * Week 7 will replace this with OAuth 2.1
 */
function validateAuthentication(): boolean {
  // TODO Week 7: Implement OAuth token validation
  const authToken = process.env.MCP_AUTH_TOKEN;

  if (!authToken) {
    console.warn('[SECURITY] No auth token configured - running in development mode');
    return true; // Allow for Week 6 development
  }

  // Placeholder for OAuth validation
  return authToken === process.env.MCP_AUTH_TOKEN;
}

/**
 * Analytics hook: Log security events
 * Prepares for Week 7 OAuth analytics
 */
function logSecurityEvent(event: string, details: Record<string, any> = {}) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    event,
    server: 'roll-dice-mcp',
    ...details
  }));
}

/**
 * Roll a dice with specified number of sides
 */
function rollDice(sides: number = 6): number {
  if (sides < 2 || sides > 100) {
    throw new Error('Dice sides must be between 2 and 100');
  }
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice
 */
function rollMultipleDice(count: number, sides: number): number[] {
  if (count < 1 || count > 20) {
    throw new Error('Dice count must be between 1 and 20');
  }
  return Array.from({ length: count }, () => rollDice(sides));
}

/**
 * Available tools for the MCP server
 */
const tools: Tool[] = [
  {
    name: "roll_dice",
    description: "Roll a single dice with specified number of sides (default: 6-sided)",
    inputSchema: {
      type: "object",
      properties: {
        sides: {
          type: "number",
          description: "Number of sides on the dice (2-100)",
          default: 6,
        },
      },
    },
  },
  {
    name: "roll_multiple_dice",
    description: "Roll multiple dice at once",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of dice to roll (1-20)",
        },
        sides: {
          type: "number",
          description: "Number of sides on each dice (2-100)",
          default: 6,
        },
      },
      required: ["count"],
    },
  },
  {
    name: "roll_d20",
    description: "Roll a 20-sided dice (common in RPGs)",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

/**
 * Initialize MCP Server
 */
const server = new Server(
  {
    name: "roll-dice-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logSecurityEvent('tools_listed', { toolCount: tools.length });
  return { tools };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Week 6: Authentication readiness check
  if (!validateAuthentication()) {
    logSecurityEvent('auth_failed', { tool: request.params.name });
    throw new Error('Authentication failed');
  }

  const { name, arguments: args } = request.params;

  logSecurityEvent('tool_called', {
    tool: name,
    authenticated: true
  });

  try {
    switch (name) {
      case "roll_dice": {
        const sides = (args?.sides as number) || 6;
        const result = rollDice(sides);

        return {
          content: [
            {
              type: "text",
              text: `🎲 Rolled a ${sides}-sided dice: **${result}**`,
            },
          ],
        };
      }

      case "roll_multiple_dice": {
        const count = args?.count as number;
        const sides = (args?.sides as number) || 6;
        const results = rollMultipleDice(count, sides);
        const total = results.reduce((sum, val) => sum + val, 0);

        return {
          content: [
            {
              type: "text",
              text: `🎲 Rolled ${count}d${sides}: ${results.join(", ")}\nTotal: **${total}**`,
            },
          ],
        };
      }

      case "roll_d20": {
        const result = rollDice(20);

        // Fun RPG-style feedback
        let feedback = "";
        if (result === 20) feedback = " 🎉 Critical Success!";
        else if (result === 1) feedback = " 💥 Critical Failure!";
        else if (result >= 15) feedback = " ✨ Great roll!";

        return {
          content: [
            {
              type: "text",
              text: `🎲 d20 roll: **${result}**${feedback}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logSecurityEvent('tool_error', {
      tool: name,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
});

/**
 * Start the MCP server
 */
async function main() {
  console.error('[INFO] Starting Roll Dice MCP Server v1.0.0');
  console.error('[INFO] Week 6: Authentication readiness mode');

  // Log environment readiness
  logSecurityEvent('server_starting', {
    authConfigured: !!process.env.MCP_AUTH_TOKEN,
    environment: process.env.NODE_ENV || 'development'
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[INFO] Server started successfully');
  logSecurityEvent('server_ready');
}

main().catch((error) => {
  console.error("[FATAL]", error);
  logSecurityEvent('server_fatal_error', {
    error: error instanceof Error ? error.message : 'Unknown error'
  });
  process.exit(1);
});

/**
 * MCP Server API Route
 *
 * Provides Model Context Protocol server for dice rolling
 * Compatible with Claude Desktop via mcp-remote
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { rollDice, rollMultipleDice, getD20Feedback, formatDiceRoll } from "@/lib/mcp/dice-roller";

// Tool definitions
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
    description: "Roll multiple dice at once and get the total",
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
    description: "Roll a 20-sided dice (d20) with special RPG feedback for critical hits/failures",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "roll_d6",
    description: "Roll a standard 6-sided dice",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

/**
 * Handle MCP requests
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle list tools request
    if (body.method === "tools/list") {
      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        result: { tools },
      });
    }

    // Handle tool call request
    if (body.method === "tools/call") {
      const { name, arguments: args } = body.params;

      let result;
      try {
        switch (name) {
          case "roll_dice": {
            const sides = args?.sides || 6;
            const roll = rollDice(sides);
            result = {
              content: [
                {
                  type: "text",
                  text: `🎲 Rolled a ${sides}-sided dice: **${roll}**`,
                },
              ],
            };
            break;
          }

          case "roll_multiple_dice": {
            const count = args.count;
            const sides = args?.sides || 6;
            const rollResult = rollMultipleDice(count, sides);
            result = {
              content: [
                {
                  type: "text",
                  text: formatDiceRoll(rollResult),
                },
              ],
            };
            break;
          }

          case "roll_d20": {
            const roll = rollDice(20);
            const feedback = getD20Feedback(roll);
            result = {
              content: [
                {
                  type: "text",
                  text: `🎲 d20 roll: **${roll}**${feedback ? ` ${feedback}` : ''}`,
                },
              ],
            };
            break;
          }

          case "roll_d6": {
            const roll = rollDice(6);
            result = {
              content: [
                {
                  type: "text",
                  text: `🎲 d6 roll: **${roll}**`,
                },
              ],
            };
            break;
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return Response.json({
          jsonrpc: "2.0",
          id: body.id,
          result,
        });
      } catch (error) {
        return Response.json({
          jsonrpc: "2.0",
          id: body.id,
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    // Unknown method
    return Response.json({
      jsonrpc: "2.0",
      id: body.id,
      error: {
        code: -32601,
        message: "Method not found",
      },
    });
  } catch (error) {
    return Response.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Parse error",
        },
      },
      { status: 400 }
    );
  }
}

// Handle GET request to show server info
export async function GET() {
  return Response.json({
    name: "dice-roller-mcp",
    version: "1.0.0",
    description: "A Model Context Protocol server for rolling dice",
    tools: tools.map(t => ({
      name: t.name,
      description: t.description
    })),
    usage: {
      claudeDesktop: {
        local: {
          command: "npx",
          args: ["-y", "mcp-remote", "http://localhost:3000/api/mcp"]
        },
        cloud: {
          command: "npx",
          args: ["-y", "mcp-remote", "https://your-domain.vercel.app/api/mcp"]
        }
      }
    }
  });
}

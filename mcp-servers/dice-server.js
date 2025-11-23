#!/usr/bin/env node

/**
 * Standalone MCP Dice Roller Server
 *
 * This runs as a separate process and communicates via stdio
 * Compatible with Claude Desktop's MCP implementation
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Dice rolling functions
function rollDice(sides = 6) {
  if (sides < 2 || sides > 100) {
    throw new Error('Dice sides must be between 2 and 100');
  }
  return Math.floor(Math.random() * sides) + 1;
}

function rollMultipleDice(count, sides = 6) {
  if (count < 1 || count > 20) {
    throw new Error('Dice count must be between 1 and 20');
  }
  const rolls = Array.from({ length: count }, () => rollDice(sides));
  const total = rolls.reduce((sum, val) => sum + val, 0);
  return { rolls, total, sides, count };
}

function getD20Feedback(roll) {
  if (roll === 20) return '🎉 Critical Success!';
  if (roll === 1) return '💥 Critical Failure!';
  if (roll >= 17) return '✨ Excellent!';
  if (roll >= 12) return '👍 Good roll!';
  if (roll <= 5) return '😬 Rough...';
  return '';
}

// Tools definition
const tools = [
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

// Create MCP server
const server = new Server(
  {
    name: "dice-roller",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "roll_dice": {
        const sides = args?.sides || 6;
        const roll = rollDice(sides);
        return {
          content: [
            {
              type: "text",
              text: `🎲 Rolled a ${sides}-sided dice: **${roll}**`,
            },
          ],
        };
      }

      case "roll_multiple_dice": {
        const count = args.count;
        const sides = args?.sides || 6;
        const result = rollMultipleDice(count, sides);
        return {
          content: [
            {
              type: "text",
              text: `🎲 Rolled ${count}d${sides}: ${result.rolls.join(', ')}\n**Total: ${result.total}**`,
            },
          ],
        };
      }

      case "roll_d20": {
        const roll = rollDice(20);
        const feedback = getD20Feedback(roll);
        return {
          content: [
            {
              type: "text",
              text: `🎲 d20 roll: **${roll}**${feedback ? ` ${feedback}` : ''}`,
            },
          ],
        };
      }

      case "roll_d6": {
        const roll = rollDice(6);
        return {
          content: [
            {
              type: "text",
              text: `🎲 d6 roll: **${roll}**`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    throw error;
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Dice Roller MCP Server started");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

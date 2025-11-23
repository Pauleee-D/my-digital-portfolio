/**
 * Dice Rolling Logic for MCP Server
 *
 * Provides dice rolling functionality with validation and security
 */

export interface DiceRollResult {
  rolls: number[];
  total: number;
  sides: number;
  count: number;
}

/**
 * Roll a single dice with specified number of sides
 */
export function rollDice(sides: number = 6): number {
  if (sides < 2 || sides > 100) {
    throw new Error('Dice sides must be between 2 and 100');
  }
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice and return detailed results
 */
export function rollMultipleDice(count: number, sides: number = 6): DiceRollResult {
  if (count < 1 || count > 20) {
    throw new Error('Dice count must be between 1 and 20');
  }

  if (sides < 2 || sides > 100) {
    throw new Error('Dice sides must be between 2 and 100');
  }

  const rolls = Array.from({ length: count }, () => rollDice(sides));
  const total = rolls.reduce((sum, val) => sum + val, 0);

  return {
    rolls,
    total,
    sides,
    count
  };
}

/**
 * Get RPG-style feedback for d20 rolls
 */
export function getD20Feedback(roll: number): string {
  if (roll === 20) return '🎉 Critical Success!';
  if (roll === 1) return '💥 Critical Failure!';
  if (roll >= 17) return '✨ Excellent!';
  if (roll >= 12) return '👍 Good roll!';
  if (roll <= 5) return '😬 Rough...';
  return '';
}

/**
 * Format dice roll for display
 */
export function formatDiceRoll(result: DiceRollResult): string {
  const { rolls, total, sides, count } = result;

  if (count === 1) {
    return `🎲 Rolled 1d${sides}: **${total}**`;
  }

  return `🎲 Rolled ${count}d${sides}: ${rolls.join(', ')}\n**Total: ${total}**`;
}

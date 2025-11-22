/**
 * Rate Limiting Test Script
 * Tests if Arcjet rate limiting is working properly
 */

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  requestNumber: number;
  success: boolean;
  rateLimited: boolean;
  message: string;
}

async function testRateLimiting() {
  console.log(`${colors.blue}${colors.bright}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        ARCJET RATE LIMITING TEST                           ║');
  console.log('║        Testing newsletter subscription rate limits         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  console.log('');

  const results: TestResult[] = [];
  const BASE_URL = 'http://localhost:3000';

  console.log(`${colors.cyan}Configuration:${colors.reset}`);
  console.log(`  Token bucket capacity: 10 tokens`);
  console.log(`  Refill rate: 5 tokens per 10 seconds`);
  console.log(`  Newsletter action cost: 5 tokens`);
  console.log(`  Expected: 2 successful requests, then rate limited`);
  console.log('');
  console.log(`${colors.cyan}Running Tests...${colors.reset}`);
  console.log('');

  // Make 5 rapid requests to test rate limiting
  for (let i = 1; i <= 5; i++) {
    try {
      const formData = new FormData();
      formData.append('email', `test${i}@example.com`);
      formData.append('name', `Test User ${i}`);

      // Make request to the home page (which has the newsletter form)
      const response = await fetch(BASE_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': 'RateLimitTest/1.0',
        },
      });

      const statusCode = response.status;
      const rateLimited = statusCode === 429 || statusCode === 403;

      const result: TestResult = {
        requestNumber: i,
        success: statusCode === 200,
        rateLimited,
        message: rateLimited ? 'Rate limited' : 'Success',
      };

      results.push(result);

      const statusColor = rateLimited ? colors.red : colors.green;
      const icon = rateLimited ? '✗' : '✓';

      console.log(`  ${icon} Request #${i}: ${statusColor}${result.message}${colors.reset} (HTTP ${statusCode})`);

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`  ${colors.red}✗ Request #${i}: Error - ${error}${colors.reset}`);
    }
  }

  console.log('');
  console.log(`${colors.cyan}${colors.bright}Test Results:${colors.reset}`);
  console.log('');

  const successful = results.filter(r => r.success).length;
  const rateLimited = results.filter(r => r.rateLimited).length;

  console.log(`  ${colors.green}Successful requests: ${successful}${colors.reset}`);
  console.log(`  ${colors.red}Rate limited requests: ${rateLimited}${colors.reset}`);
  console.log('');

  // Determine if test passed
  const testPassed = successful <= 2 && rateLimited >= 1;

  if (testPassed) {
    console.log(`${colors.green}${colors.bright}✓ RATE LIMITING IS WORKING!${colors.reset}`);
    console.log(`  First ${successful} request(s) succeeded, then rate limiting kicked in.`);
  } else if (rateLimited === 0) {
    console.log(`${colors.red}${colors.bright}✗ RATE LIMITING NOT WORKING${colors.reset}`);
    console.log(`  All requests succeeded - no rate limiting detected!`);
    console.log(`  ${colors.yellow}Check:${colors.reset}`);
    console.log(`    1. Is ARCJET_KEY set in .env.local?`);
    console.log(`    2. Is the Arcjet code in newsletter action enabled?`);
    console.log(`    3. Check server logs for Arcjet errors`);
  } else {
    console.log(`${colors.yellow}${colors.bright}⚠ UNEXPECTED RESULTS${colors.reset}`);
    console.log(`  Expected ~2 successful, got ${successful}`);
  }

  console.log('');
  console.log(`${colors.cyan}💡 Tip:${colors.reset} Check your dev server logs for detailed Arcjet decision output`);
  console.log('');
}

// Check if server is running before testing
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000', { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.error(`${colors.red}${colors.bright}Error: Development server not running${colors.reset}`);
    console.error(`Please start the server with: ${colors.cyan}pnpm dev${colors.reset}`);
    process.exit(1);
  }

  await testRateLimiting();
  process.exit(0);
}

main();

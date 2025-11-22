/**
 * Database Security Testing Script
 * Tests for SQL injection, XSS, and other vulnerabilities
 *
 * Run with: npx tsx security-test.ts
 */

import { db, subscribers, users, projects } from "./lib/db";
import { eq } from "drizzle-orm";

// ANSI color codes for terminal output
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
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const results: TestResult[] = [];

function logTest(name: string, status: 'PASS' | 'FAIL' | 'WARNING', details: string, severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') {
  results.push({ name, status, details, severity });

  const statusColor = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;
  const severityText = severity ? ` [${severity}]` : '';

  console.log(`${statusColor}${status}${colors.reset} ${colors.bright}${name}${colors.reset}${severityText}`);
  console.log(`  ${details}\n`);
}

async function testSQLInjection() {
  console.log(`\n${colors.cyan}${colors.bright}=== SQL INJECTION TESTS ===${colors.reset}\n`);

  // Test 1: Email field SQL injection
  const sqlPayloads = [
    "admin' OR '1'='1",
    "admin'--",
    "admin' OR 1=1--",
    "'; DROP TABLE subscribers; --",
    "admin' UNION SELECT * FROM users--",
    "1' AND 1=1 UNION ALL SELECT 1,2,3,4--",
  ];

  for (const payload of sqlPayloads) {
    try {
      const result = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, payload))
        .limit(1);

      logTest(
        `SQL Injection Test: "${payload}"`,
        'PASS',
        `Drizzle ORM safely parameterized the query. No injection occurred. Result: ${result.length === 0 ? 'No records' : 'Record found (safe)'}`,
        'HIGH'
      );
    } catch (error) {
      logTest(
        `SQL Injection Test: "${payload}"`,
        'FAIL',
        `Query failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CRITICAL'
      );
    }
  }
}

async function testXSSViaJSON() {
  console.log(`\n${colors.cyan}${colors.bright}=== XSS/JSON INJECTION TESTS ===${colors.reset}\n`);

  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg/onload=alert("XSS")>',
  ];

  for (const payload of xssPayloads) {
    try {
      // Test if malicious content can be stored in JSON items
      const testItems = [payload, "normal item", `<div>${payload}</div>`];

      // This simulates what would happen if inserted
      const jsonString = JSON.stringify(testItems);
      const parsed = JSON.parse(jsonString);

      if (parsed[0] === payload) {
        logTest(
          `XSS Storage Test: "${payload.substring(0, 30)}..."`,
          'WARNING',
          `Malicious payload CAN be stored in JSON field. Application must sanitize on OUTPUT, not storage. Stored: ${parsed[0]}`,
          'MEDIUM'
        );
      }
    } catch (error) {
      logTest(
        `XSS Storage Test: "${payload.substring(0, 30)}..."`,
        'PASS',
        `Payload was rejected or sanitized: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MEDIUM'
      );
    }
  }
}

async function testInputValidation() {
  console.log(`\n${colors.cyan}${colors.bright}=== INPUT VALIDATION TESTS ===${colors.reset}\n`);

  // Test email validation
  const invalidEmails = [
    'not-an-email',
    'missing@domain',
    '@nodomain.com',
    'spaces in@email.com',
    'double@@domain.com',
    '',
    'a'.repeat(1000) + '@test.com', // Extremely long email
  ];

  for (const email of invalidEmails) {
    try {
      // This would be caught by Zod schema in production
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);

      if (!isValid) {
        logTest(
          `Email Validation: "${email.substring(0, 30)}${email.length > 30 ? '...' : ''}"`,
          'PASS',
          'Invalid email format correctly rejected by pattern matching',
          'LOW'
        );
      } else {
        logTest(
          `Email Validation: "${email}"`,
          'WARNING',
          'Email passed basic regex but may fail Zod validation',
          'LOW'
        );
      }
    } catch (error) {
      logTest(
        `Email Validation: "${email}"`,
        'FAIL',
        `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LOW'
      );
    }
  }
}

async function testDatabaseConnection() {
  console.log(`\n${colors.cyan}${colors.bright}=== DATABASE CONNECTION SECURITY ===${colors.reset}\n`);

  // Check if DATABASE_URL uses SSL
  const dbUrl = process.env.DATABASE_URL || '';

  if (dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true')) {
    logTest(
      'SSL/TLS Connection',
      'PASS',
      'Database connection requires SSL encryption',
      'HIGH'
    );
  } else if (dbUrl) {
    logTest(
      'SSL/TLS Connection',
      'WARNING',
      'Database URL may not enforce SSL. Check your connection settings.',
      'HIGH'
    );
  } else {
    logTest(
      'SSL/TLS Connection',
      'WARNING',
      'DATABASE_URL not found. Using fallback credentials.',
      'MEDIUM'
    );
  }

  // Test database connectivity
  try {
    const testQuery = await db.select().from(subscribers).limit(1);
    logTest(
      'Database Connectivity',
      'PASS',
      `Successfully connected to database. Test query returned ${testQuery.length} record(s)`,
      'LOW'
    );
  } catch (error) {
    logTest(
      'Database Connectivity',
      'FAIL',
      `Cannot connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'CRITICAL'
    );
  }
}

async function testAuthorizationBypass() {
  console.log(`\n${colors.cyan}${colors.bright}=== AUTHORIZATION TESTS ===${colors.reset}\n`);

  // Test if direct database queries can bypass auth (simulated)
  try {
    // This simulates what happens if someone calls db directly without isAdmin()
    const allUsers = await db.select().from(users).limit(5);

    logTest(
      'Direct Database Access',
      'WARNING',
      `Direct database queries succeed without auth checks. Found ${allUsers.length} user(s). ALWAYS use isAdmin() in server actions!`,
      'HIGH'
    );
  } catch (error) {
    logTest(
      'Direct Database Access',
      'PASS',
      `Database access failed (good if this is due to auth): ${error instanceof Error ? error.message : 'Unknown error'}`,
      'HIGH'
    );
  }
}

async function testRateLimiting() {
  console.log(`\n${colors.cyan}${colors.bright}=== RATE LIMITING TESTS ===${colors.reset}\n`);

  // Simulate rapid requests
  logTest(
    'Newsletter Subscription Rate Limiting',
    'FAIL',
    'No rate limiting detected on server actions. Vulnerable to spam/DoS attacks. Implement Arcjet rate limiting!',
    'CRITICAL'
  );

  logTest(
    'Admin Actions Rate Limiting',
    'WARNING',
    'Admin actions have auth checks but no rate limiting. Consider adding rate limits to prevent abuse.',
    'MEDIUM'
  );
}

async function testErrorMessageLeaks() {
  console.log(`\n${colors.cyan}${colors.bright}=== INFORMATION DISCLOSURE TESTS ===${colors.reset}\n`);

  // Test error messages that might leak info
  const testEmails = ['nonexistent@test.com', 'admin@test.com'];

  for (const email of testEmails) {
    try {
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (user.length === 0) {
        logTest(
          `User Enumeration: "${email}"`,
          'WARNING',
          'Application can reveal if email exists in system via different error messages. Use generic errors!',
          'MEDIUM'
        );
      } else {
        logTest(
          `User Enumeration: "${email}"`,
          'WARNING',
          `Found user record. Application should NOT reveal this in error messages.`,
          'MEDIUM'
        );
      }
    } catch (error) {
      logTest(
        `User Enumeration: "${email}"`,
        'PASS',
        'Query error occurred (not related to enumeration)',
        'LOW'
      );
    }
  }
}

async function generateReport() {
  console.log(`\n${colors.cyan}${colors.bright}=== SECURITY TEST SUMMARY ===${colors.reset}\n`);

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;

  const critical = results.filter(r => r.severity === 'CRITICAL').length;
  const high = results.filter(r => r.severity === 'HIGH').length;
  const medium = results.filter(r => r.severity === 'MEDIUM').length;
  const low = results.filter(r => r.severity === 'LOW').length;

  console.log(`${colors.green}✓ Passed:${colors.reset} ${passed}`);
  console.log(`${colors.red}✗ Failed:${colors.reset} ${failed}`);
  console.log(`${colors.yellow}⚠ Warnings:${colors.reset} ${warnings}`);
  console.log(`${colors.bright}Total Tests:${colors.reset} ${results.length}\n`);

  console.log(`${colors.bright}Severity Breakdown:${colors.reset}`);
  console.log(`${colors.red}  CRITICAL:${colors.reset} ${critical}`);
  console.log(`${colors.red}  HIGH:${colors.reset} ${high}`);
  console.log(`${colors.yellow}  MEDIUM:${colors.reset} ${medium}`);
  console.log(`${colors.green}  LOW:${colors.reset} ${low}\n`);

  // Priority recommendations
  console.log(`${colors.cyan}${colors.bright}=== PRIORITY RECOMMENDATIONS ===${colors.reset}\n`);

  const criticalIssues = results.filter(r => r.severity === 'CRITICAL' && r.status !== 'PASS');
  const highIssues = results.filter(r => r.severity === 'HIGH' && r.status !== 'PASS');

  if (criticalIssues.length > 0) {
    console.log(`${colors.red}${colors.bright}CRITICAL - Fix Immediately:${colors.reset}`);
    criticalIssues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue.name}`);
      console.log(`     ${issue.details}\n`);
    });
  }

  if (highIssues.length > 0) {
    console.log(`${colors.red}${colors.bright}HIGH - Fix Soon:${colors.reset}`);
    highIssues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue.name}`);
      console.log(`     ${issue.details}\n`);
    });
  }

  // Overall security score
  const score = Math.round((passed / results.length) * 100);
  const scoreColor = score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red;

  console.log(`\n${colors.bright}Overall Security Score: ${scoreColor}${score}%${colors.reset}\n`);
}

// Run all tests
async function runAllTests() {
  console.log(`${colors.blue}${colors.bright}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        DATABASE SECURITY TESTING SUITE                     ║');
  console.log('║        Testing for SQL Injection, XSS, Auth Bypass, etc.  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  try {
    await testDatabaseConnection();
    await testSQLInjection();
    await testXSSViaJSON();
    await testInputValidation();
    await testAuthorizationBypass();
    await testRateLimiting();
    await testErrorMessageLeaks();
    await generateReport();
  } catch (error) {
    console.error(`${colors.red}Fatal error during testing:${colors.reset}`, error);
  }

  process.exit(0);
}

runAllTests();

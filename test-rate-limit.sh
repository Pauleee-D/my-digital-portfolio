#!/bin/bash

# Rate Limiting Test Script
# Tests if Arcjet rate limiting is working on server actions

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        ARCJET RATE LIMITING TEST                           ║"
echo "║        Testing newsletter subscription rate limits         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="http://localhost:3000"

echo "Testing Newsletter Subscription Rate Limit (5 tokens per request, 10 token capacity)"
echo "Expected: First 2 requests succeed, 3rd request should be rate limited"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for i in {1..5}; do
  echo "Request #$i:"

  # Make POST request to newsletter subscription
  # Note: This is testing via the form submission endpoint
  # In production, you'd test via the actual form or API route

  curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=test$i@example.com" \
    -d "name=Test User $i" \
    --write-out "\nHTTP Status: %{http_code}\n" \
    -o /dev/null

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Small delay between requests
  sleep 0.5
done

echo ""
echo "Test complete!"
echo ""
echo "Expected behavior:"
echo "✓ Requests 1-2: Should succeed (200 OK)"
echo "✗ Request 3+: Should be rate limited (429 or error response)"
echo ""
echo "Note: Check your dev server logs for Arcjet decision details"

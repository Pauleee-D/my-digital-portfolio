# Quick Rate Limiting Test
# Tests newsletter subscription rate limiting

Write-Host "Testing Rate Limiting on Newsletter Subscription" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  - Token Bucket: 10 tokens capacity"
Write-Host "  - Refill: 5 tokens per 10 seconds"
Write-Host "  - Newsletter cost: 5 tokens per request"
Write-Host "  - Expected: 2 requests succeed, 3rd fails"
Write-Host ""

$baseUrl = "http://localhost:3000"

# Make 4 rapid requests
for ($i = 1; $i -le 4; $i++) {
    Write-Host "Request #$i..." -NoNewline

    try {
        $body = @{
            email = "test$i@example.com"
            name = "Test User $i"
        }

        $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $body -UseBasicParsing -ErrorAction Stop

        if ($response.StatusCode -eq 200) {
            Write-Host " SUCCESS (200)" -ForegroundColor Green
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 429) {
            Write-Host " RATE LIMITED (429)" -ForegroundColor Red
        }
        elseif ($statusCode -eq 403) {
            Write-Host " BLOCKED (403)" -ForegroundColor Yellow
        }
        else {
            Write-Host " ERROR ($statusCode)" -ForegroundColor Magenta
        }
    }

    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "Check your dev server logs for Arcjet decision details!" -ForegroundColor Cyan

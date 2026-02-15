# Generate NEXTAUTH_SECRET

Write-Host "Generating NEXTAUTH_SECRET..." -ForegroundColor Cyan
Write-Host ""

# Generate a random base64 string
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)

Write-Host "Your NEXTAUTH_SECRET:" -ForegroundColor Green
Write-Host $secret -ForegroundColor Yellow
Write-Host ""
Write-Host "Copy the above line and add it to your .env.local file:" -ForegroundColor Cyan
Write-Host "NEXTAUTH_SECRET=$secret" -ForegroundColor White
Write-Host ""

# Ask if user wants to automatically update .env.local
$response = Read-Host "Do you want to automatically update .env.local? (y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    $envPath = ".env.local"
    
    if (Test-Path $envPath) {
        $content = Get-Content $envPath -Raw
        $newContent = $content -replace 'NEXTAUTH_SECRET=.*', "NEXTAUTH_SECRET=$secret"
        Set-Content $envPath $newContent
        Write-Host "✓ Updated $envPath successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Please restart your dev server for changes to take effect:" -ForegroundColor Yellow
        Write-Host "  npm run dev" -ForegroundColor White
    } else {
        Write-Host "✗ .env.local file not found. Please create it first." -ForegroundColor Red
    }
} else {
    Write-Host "Please manually add the secret to your .env.local file." -ForegroundColor Yellow
}

Write-Host ""

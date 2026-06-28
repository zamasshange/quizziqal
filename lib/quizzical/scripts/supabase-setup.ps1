# Apply Quizzical migrations to your linked Supabase project.
# Run from repo root in PowerShell:
#   .\scripts\supabase-setup.ps1
#
# First-time setup:
#   1. npx supabase login          (opens browser)
#   2. npx supabase link --project-ref zduvwsvlsarswoupbrdt
#   3. .\scripts\supabase-setup.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "Pushing migrations to Supabase..." -ForegroundColor Cyan
npx supabase db push

if ($LASTEXITCODE -eq 0) {
  Write-Host "Done. Add SUPABASE_SERVICE_ROLE_KEY to .env.local if not set yet." -ForegroundColor Green
} else {
  Write-Host "Failed. Try: npx supabase login" -ForegroundColor Red
  Write-Host "Or paste supabase/migrations/*.sql into Supabase SQL Editor." -ForegroundColor Yellow
}

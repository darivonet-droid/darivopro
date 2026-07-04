# DARIVO PRO — Aplicar migraciones Supabase en local (Windows)
# Uso: .\scripts\supabase-migrate.ps1
# Requiere: supabase/.env con SUPABASE_ACCESS_TOKEN y SUPABASE_DB_PASSWORD

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

$envFile = Join-Path $root "supabase\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "Falta supabase/.env — copia supabase/.env.example y rellena los valores." -ForegroundColor Red
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($name -and $value) {
            Set-Item -Path "Env:$name" -Value $value
        }
    }
}

if (-not $env:SUPABASE_DB_PASSWORD) {
    Write-Host "SUPABASE_DB_PASSWORD vacío en supabase/.env" -ForegroundColor Red
    exit 1
}
if (-not $env:SUPABASE_ACCESS_TOKEN) {
    Write-Host "SUPABASE_ACCESS_TOKEN vacío en supabase/.env" -ForegroundColor Red
    exit 1
}

$ref = if ($env:SUPABASE_PROJECT_REF) { $env:SUPABASE_PROJECT_REF } else { "vyrtokggypcmpforglch" }

Set-Location $root
Write-Host "Vinculando proyecto $ref..." -ForegroundColor Cyan
npx --yes supabase@latest link --project-ref $ref --password $env:SUPABASE_DB_PASSWORD --yes
Write-Host "Aplicando migraciones..." -ForegroundColor Cyan
npx --yes supabase@latest db push --yes
Write-Host "Listo." -ForegroundColor Green

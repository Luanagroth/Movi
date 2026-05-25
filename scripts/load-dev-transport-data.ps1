$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$normalizedDir = Join-Path $repoRoot "apps/backend/data/normalized/sao-francisco-do-sul"

if (-not (Test-Path -LiteralPath $normalizedDir)) {
  throw "Diretorio de dados normalizados nao encontrado: $normalizedDir"
}

Write-Host "[cityline] Resetando dominio de transporte..."
npm run ingestion:reset-dev --workspace @cityline/backend

Write-Host "[cityline] Importando manifests canonicos (line-*.json + ferry-*.json)..."
$files = Get-ChildItem -LiteralPath $normalizedDir -File |
  Where-Object { $_.Name -like "line-*.json" -or $_.Name -like "ferry-*.json" } |
  Sort-Object Name

if (-not $files -or $files.Count -eq 0) {
  throw "Nenhum manifest canonico encontrado em $normalizedDir"
}

foreach ($file in $files) {
  Write-Host "[cityline] Importando $($file.Name)..."
  npm run ingestion:import --workspace @cityline/backend -- --input $file.FullName
}

Write-Host "[cityline] Carga concluida."

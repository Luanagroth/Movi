$ErrorActionPreference = "SilentlyContinue"

$ports = @(3000, 4000)

foreach ($port in $ports) {
  $processIds = netstat -ano |
    Select-String ":$port\s+.*LISTENING" |
    ForEach-Object { ($_ -split '\s+')[-1] } |
    Select-Object -Unique

  foreach ($processId in $processIds) {
    if ($processId -match '^[0-9]+$') {
      Stop-Process -Id ([int]$processId) -Force
    }
  }
}

$frontendNextPath = "apps/frontend/.next"
if (Test-Path $frontendNextPath) {
  Remove-Item -LiteralPath $frontendNextPath -Recurse -Force
}

Write-Host "Ambiente limpo: portas 3000/4000 liberadas e cache .next removido."

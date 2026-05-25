$ErrorActionPreference = "SilentlyContinue"

function Stop-PortProcess {
  param([int]$Port)

  $lines = netstat -ano | Select-String ":$Port\s+.*LISTENING"
  foreach ($line in $lines) {
    $tokens = ($line.ToString() -split "\s+") | Where-Object { $_ -ne "" }
    if (-not $tokens -or $tokens.Count -lt 5) {
      continue
    }

    $pidValue = $tokens[-1]
    if ($pidValue -notmatch '^\d+$') {
      continue
    }

    try {
      Stop-Process -Id ([int]$pidValue) -Force
    } catch {
      # noop
    }
  }
}

Stop-PortProcess -Port 3000

$nextDir = Join-Path $PSScriptRoot "..\.next"
if (Test-Path -LiteralPath $nextDir) {
  try {
    Remove-Item -LiteralPath $nextDir -Recurse -Force
  } catch {
    # noop
  }
}

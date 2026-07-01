# AppLoop 3.0 — Criar Issues de auditoria via GitHub CLI
# Pré-requisito: gh auth login
# Uso: powershell -ExecutionPolicy Bypass -File .github/scripts/create-audit-issues.ps1

$Repo = "andlcode/apploop3.0"
$JsonPath = Join-Path $PSScriptRoot "audit-issues.json"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) não encontrado. Instale com: winget install GitHub.cli"
    exit 1
}

$issues = Get-Content $JsonPath -Raw | ConvertFrom-Json
$created = 0
$failed = 0

foreach ($issue in $issues) {
    Write-Host "Criando: $($issue.title)" -ForegroundColor Cyan
    $labelArgs = @()
    foreach ($label in $issue.labels) {
        $labelArgs += @("--label", $label)
    }
    gh issue create --repo $Repo --title $issue.title --body $issue.body @labelArgs 2>&1 | Out-Host
    if ($LASTEXITCODE -eq 0) { $created++ } else { $failed++ }
    Start-Sleep -Milliseconds 400
}

Write-Host "`nConcluído: $created criadas, $failed falhas (de $($issues.Count) total)" -ForegroundColor Green

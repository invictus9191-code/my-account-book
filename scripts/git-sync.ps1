param(
    [switch]$Watch,
    [int]$IntervalSeconds = 10,
    [string]$Message
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $output = & git @Args 2>&1
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousErrorActionPreference

    $text = ($output | Where-Object { $_ -notmatch "daemon terminated" }) -join [Environment]::NewLine

    if ($exitCode -ne 0) {
        throw "git $($Args -join ' ') failed: $text"
    }

    return $text
}

function Sync-Once {
    $branch = (Invoke-Git branch --show-current).Trim()
    if (-not $branch) {
        throw "현재 브랜치를 확인할 수 없습니다."
    }

    $changes = (Invoke-Git status --porcelain=v1)
    if (-not $changes.Trim()) {
        Write-Host "변경사항 없음"
        return
    }

    Invoke-Git add --all | Out-Null

    $staged = (Invoke-Git diff --cached --name-only)
    if (-not $staged.Trim()) {
        Write-Host "커밋할 변경사항 없음"
        return
    }

    $commitMessage = $Message
    if (-not $commitMessage) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $commitMessage = "auto: sync changes $timestamp"
    }

    Invoke-Git commit -m $commitMessage | Write-Host
    Invoke-Git push origin $branch | Write-Host
    Write-Host "GitHub 반영 완료: origin/$branch"
}

Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)

if ($Watch) {
    Write-Host "자동 동기화 시작. 중지하려면 Ctrl+C를 누르세요."
    while ($true) {
        try {
            Sync-Once
        }
        catch {
            Write-Warning $_
        }
        Start-Sleep -Seconds $IntervalSeconds
    }
}

Sync-Once

# EduSen Smart Audit v2
# Run this and paste output to AI

$ProjectRoot = "C:\Users\bassa\Projects\edusen-platform"
cd $ProjectRoot

Write-Host "=== EDUSEN AUDIT ===" -ForegroundColor Cyan

# 1. Basic Info
Write-Host "`n[PROJECT]" -ForegroundColor Green
$pkg = Get-Content "package.json" | ConvertFrom-Json
Write-Host "Name: $($pkg.name) | Version: $($pkg.version)"

# 2. Folder Structure
Write-Host "`n[STRUCTURE]" -ForegroundColor Green
Write-Host "src/pages:" 
Get-ChildItem "src/pages" -Filter "*.jsx" | ForEach-Object { Write-Host "  - $($_.Name)" }
Write-Host "src/components:"
Get-ChildItem "src/components" -Directory | ForEach-Object { Write-Host "  - $($_.Name)/" }

# 3. Recent Changes (last 3 days)
Write-Host "`n[RECENT CHANGES]" -ForegroundColor Green
Get-ChildItem -Path "src" -Recurse -File | 
    Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-3) -and $_.Extension -match "\.(jsx?|css)$" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 10 | 
    ForEach-Object { 
        $rel = $_.FullName.Replace($ProjectRoot, "").TrimStart('\')
        Write-Host "  $rel"
    }

# 4. Git Status
Write-Host "`n[GIT]" -ForegroundColor Green
Write-Host "Branch: $(git branch --show-current 2>$null)"
Write-Host "Status:"
git status --short 2>$null | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" }

# 5. Any Errors in Console?
Write-Host "`n[DEV SERVER]" -ForegroundColor Green
$nodeRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeRunning) { Write-Host "  Running" } else { Write-Host "  Not running" }

Write-Host "`n=== END AUDIT ===" -ForegroundColor Cyan
Write-Host "Paste this output to AI for help!" -ForegroundColor Yellow

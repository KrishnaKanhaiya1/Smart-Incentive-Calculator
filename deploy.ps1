#!/usr/bin/env pwsh

# ============================================
# Smart Incentive Calculator - Full Automation Script
# Handles: Git setup, GitHub push, Vercel deployment
# ============================================

$ErrorActionPreference = "Stop"
$WarningPreference = "SilentlyContinue"

# Configuration
$GIT_PATH = "C:\Program Files\Git\cmd\git.exe"
$PROJECT_PATH = "C:\tmp\sic"
$GH_REPO = "anantkumarntpc-afk/sic"
$GITHUB_URL = "https://github.com/$GH_REPO.git"

# Color functions
function Write-Header {
    param([string]$message)
    Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ $message" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$message, [string]$status = "→")
    Write-Host "$status $message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Write-Info {
    param([string]$message)
    Write-Host "ℹ $message" -ForegroundColor Yellow
}

# Verify Git
function Test-Git {
    if (-not (Test-Path $GIT_PATH)) {
        Write-Error-Custom "Git not found at $GIT_PATH"
        return $false
    }
    return $true
}

# Add Git to PATH
function Add-GitPath {
    $gitDir = Split-Path -Parent $GIT_PATH
    if ($env:Path -notlike "*$gitDir*") {
        $env:Path += ";$gitDir"
    }
}

# Git functions
function Invoke-Git {
    param(
        [string[]]$Arguments,
        [bool]$Quiet = $false
    )
    
    $output = & $GIT_PATH @Arguments 2>&1
    if (-not $Quiet) { Write-Host $output }
    return $output
}

# Setup Git
function Initialize-GitRepo {
    Write-Header "Initializing Git Repository"
    
    Set-Location $PROJECT_PATH
    
    Write-Step "Configuring user..."
    Invoke-Git @("config", "user.name", "GitHub Copilot Bot") -Quiet
    Invoke-Git @("config", "user.email", "copilot@github.com") -Quiet
    
    if (-not (Test-Path "$PROJECT_PATH\.git")) {
        Write-Step "Initializing repository..."
        Invoke-Git @("init") -Quiet
    }
    
    # Check if already committed
    $hasCommits = (Invoke-Git @("rev-parse", "HEAD") 2>&1 | Measure-Object -Line).Lines -gt 0
    
    if (-not $hasCommits) {
        Write-Step "Staging files..."
        Invoke-Git @("add", ".") -Quiet
        
        Write-Step "Creating initial commit..."
        Invoke-Git @("commit", "-m", "Initial commit: Smart Incentive Calculator") -Quiet
    }
    
    Write-Step "✅ Git repository ready"
}

# Add remote
function Add-GitRemote {
    Write-Header "Configuring Remote Repository"
    
    $hasRemote = Invoke-Git @("remote", "get-url", "origin") 2>&1 -Quiet
    
    if ($hasRemote -notmatch "github.com") {
        Write-Step "Adding origin remote..."
        try {
            Invoke-Git @("remote", "remove", "origin") 2>$null -Quiet
        } catch {}
        
        Invoke-Git @("remote", "add", "origin", $GITHUB_URL) -Quiet
    }
    
    Write-Step "✅ Remote configured"
}

# Push to GitHub
function Push-ToGitHub {
    Write-Header "Pushing to GitHub"
    
    Write-Info "Repository: $GH_REPO"
    Write-Info "URL: $GITHUB_URL"
    
    Write-Step "Pushing commits..."
    
    try {
        $output = Invoke-Git @("push", "-u", "origin", "master") 2>&1
        
        if ($output -match "error|fatal") {
            Write-Error-Custom "Push failed. Output: $output"
            return $false
        }
        
        Write-Step "✅ Successfully pushed to GitHub"
        return $true
    }
    catch {
        Write-Error-Custom "Push error: $_"
        return $false
    }
}

# Deploy to Vercel
function Deploy-ToVercel {
    Write-Header "Deploying to Vercel"
    
    Write-Info "Checking for Vercel CLI..."
    
    $vercelPath = Get-Command vercel -ErrorAction SilentlyContinue
    
    if (-not $vercelPath) {
        Write-Info "Installing Vercel CLI globally..."
        npm install -g vercel
    }
    
    Write-Info "Vercel deployment requires:"
    Write-Info "1. Active Vercel account connected to GitHub"
    Write-Info "2. Environment variables configured"
    Write-Info "3. Database connection string"
    
    Write-Host "`nDeploy now? (y/n): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "y") {
        Write-Step "Starting Vercel deployment..."
        vercel --prod
    }
}

# Main execution
function Main {
    Write-Header "🚀 SIC - Complete Deployment Setup"
    
    # Verify prerequisites
    Write-Step "Verifying prerequisites..."
    if (-not (Test-Git)) {
        Write-Error-Custom "Git is required but not found"
        exit 1
    }
    
    Add-GitPath
    Write-Step "✅ Git verified"
    
    # Initialize and commit
    Initialize-GitRepo
    
    # Add remote and push
    Add-GitRemote
    
    # Try push
    $pushResult = Push-ToGitHub
    
    if ($pushResult) {
        Write-Host "`nRepository pushed successfully!" -ForegroundColor Green
        
        # Ask about Vercel deployment
        Write-Host "`nDeploy to Vercel? (y/n): " -NoNewline -ForegroundColor Cyan
        $deployChoice = Read-Host
        
        if ($deployChoice -eq "y") {
            Deploy-ToVercel
        }
    }
    else {
        Write-Error-Custom "Failed to push. Please authenticate with GitHub."
        Write-Info "Try one of these:"
        Write-Host "  1. GitHub Desktop: https://desktop.github.com"
        Write-Host "  2. GitHub CLI: gh auth login"
        Write-Host "  3. Git credential cache"
    }
    
    Write-Header "📋 Next Steps"
    Write-Host "1. ✅ Project created and committed"
    Write-Host "2. → Push to GitHub ($(if ($pushResult) { '✅' } else { '⏳' }))"
    Write-Host "3. → Deploy to Vercel (⏳)"
    Write-Host "`nSee DEPLOYMENT.md for detailed instructions"
}

# Execute
try {
    Main
}
catch {
    Write-Error-Custom "Script error: $_"
    exit 1
}

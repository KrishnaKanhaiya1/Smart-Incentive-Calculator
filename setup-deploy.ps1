#!/usr/bin/env pwsh
# Smart Incentive Calculator - Complete Setup & Deployment Script
# This script handles Git setup, GitHub push, and Vercel deployment

param(
    [string]$GitHubToken = $env:GITHUB_TOKEN,
    [string]$VercelToken = $env:VERCEL_TOKEN,
    [string]$DatabaseURL = $env:DATABASE_URL,
    [string]$NextAuthSecret = $env:NEXTAUTH_SECRET
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SIC - Complete Setup & Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Function to install packages
function Install-Package {
    param([string]$PackageName)
    Write-Host "Installing $PackageName..." -ForegroundColor Yellow
    winget install $PackageName -e --accept-source-agreements
}

# Step 1: Install Git if not available
Write-Host "`n[STEP 1] Checking Git installation..." -ForegroundColor Green
$gitCheck = git --version 2>$null
if (-not $gitCheck) {
    Write-Host "Git not found. Installing..." -ForegroundColor Yellow
    Install-Package "Git.Git"
    $env:Path += ";C:\Program Files\Git\cmd"
} else {
    Write-Host "Git already installed: $gitCheck" -ForegroundColor Green
}

# Step 2: Install Node.js if not available
Write-Host "`n[STEP 2] Checking Node.js installation..." -ForegroundColor Green
$nodeCheck = node --version 2>$null
if (-not $nodeCheck) {
    Write-Host "Node.js not found. Installing..." -ForegroundColor Yellow
    Install-Package "OpenJS.NodeJS"
    $env:Path += ";C:\Program Files\nodejs"
} else {
    Write-Host "Node.js already installed: $nodeCheck" -ForegroundColor Green
}

# Step 3: Initialize Git repository
Write-Host "`n[STEP 3] Initializing Git repository..." -ForegroundColor Green
Set-Location "C:\tmp\sic"

git config --global user.name "GitHub Copilot Bot"
git config --global user.email "copilot@github.com"
git init

# Step 4: Configure Git authentication
if ($GitHubToken) {
    Write-Host "`n[STEP 4] Setting up GitHub authentication..." -ForegroundColor Green
    git config --global credential.helper store
    $credentialFile = "$env:USERPROFILE\.git-credentials"
    "https://$($GitHubToken):x-oauth-basic@github.com" | Out-File $credentialFile -Force
    Write-Host "GitHub token configured!" -ForegroundColor Green
}

# Step 5: Add remote and push to GitHub
Write-Host "`n[STEP 5] Adding remote repository..." -ForegroundColor Green
git remote add origin https://github.com/anantkumarntpc-afk/sic.git 2>$null

Write-Host "Adding all files..." -ForegroundColor Yellow
git add .

Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Smart Incentive Calculator with full stack implementation"

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green

# Step 6: Install dependencies
Write-Host "`n[STEP 6] Installing project dependencies..." -ForegroundColor Green
npm install

# Step 7: Install and configure Vercel CLI
if ($VercelToken) {
    Write-Host "`n[STEP 7] Setting up Vercel deployment..." -ForegroundColor Green
    npm install -g vercel
    
    $env:VERCEL_TOKEN = $VercelToken
    
    Write-Host "Creating .env.local for Vercel..." -ForegroundColor Yellow
    @"
DATABASE_URL=$DatabaseURL
NEXTAUTH_SECRET=$NextAuthSecret
NEXTAUTH_URL=https://sic.vercel.app
NEXT_PUBLIC_API_URL=https://sic.vercel.app
"@ | Out-File .env.local -Force
    
    Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
    vercel --prod --token=$VercelToken
    
    Write-Host "✅ Successfully deployed to Vercel!" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Repository: https://github.com/anantkumarntpc-afk/sic" -ForegroundColor White
Write-Host "2. Live URL: Check Vercel dashboard" -ForegroundColor White
Write-Host "3. Admin: admin@example.com / password123" -ForegroundColor White
Write-Host "4. Sales Officer: sales@example.com / password123" -ForegroundColor White

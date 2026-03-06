$source_dir = "c:\xampp\htdocs"
$deploy_dir = "c:\xampp\htdocs\Saas_Deployment_ready"

if (Test-Path $deploy_dir) { Remove-Item -Recurse -Force $deploy_dir }
New-Item -ItemType Directory -Force -Path $deploy_dir | Out-Null

Write-Host "Copying Frontend Build Files..."
Copy-Item -Path "$source_dir\lovable-export-d31f97fa\dist\*" -Destination $deploy_dir -Recurse -Force

Write-Host "Copying Backend API Files..."
New-Item -ItemType Directory -Force -Path "$deploy_dir\api" | Out-Null
Get-ChildItem -Path "$source_dir\api" -Exclude ".git" | Copy-Item -Destination "$deploy_dir\api\" -Recurse -Force

Write-Host "Cleaning up loose test scripts from deployment API..."
Remove-Item -Path "$deploy_dir\api\test_*.php" -ErrorAction SilentlyContinue
Remove-Item -Path "$deploy_dir\api\verify_*.php" -ErrorAction SilentlyContinue
Remove-Item -Path "$deploy_dir\api\debug_*.php" -ErrorAction SilentlyContinue
Remove-Item -Path "$deploy_dir\api\inspect_*.php" -ErrorAction SilentlyContinue

Write-Host "Deployment package successfully created at: $deploy_dir"

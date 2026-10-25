$ErrorActionPreference = 'Stop'
if(-not(Get-Command node -ErrorAction SilentlyContinue)){throw 'Install Node.js 24 first, then reopen PowerShell.'}
$accounts=@()
foreach($outlet in @('kathi','greenox','cafe','burger','dominos')){
 Write-Host "Set the account for $outlet"
 $username=Read-Host 'Username'
 $secret=Read-Host 'Password (at least 12 characters)' -AsSecureString
 $pointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
 try{$password=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer);$accounts+=@{username=$username;password=$password;outlet=$outlet}}
 finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer);$secret.Dispose();$password=$null}
}
try{
 $result=($accounts | ConvertTo-Json -Compress) | & node (Join-Path $PSScriptRoot 'provision-retailers.mjs')
 if($LASTEXITCODE -ne 0){throw 'Account generation failed. Check unique usernames and password lengths.'}
 $null=$result | ConvertFrom-Json
 Set-Clipboard -Value ([string]$result)
 Write-Host 'Hashed configuration copied to clipboard. Paste it into Render RETAILER_ACCOUNTS, save, then clear your clipboard. No password file was created.'
}finally{$accounts=$null;$result=$null}

$ErrorActionPreference = 'Stop'
if(-not(Get-Command node -ErrorAction SilentlyContinue)){throw 'Install Node.js 24 first, then reopen PowerShell.'}
$accounts=@()
$seen=[Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach($outlet in @('kathi','greenox','cafe','burger','dominos')){
 Write-Host "Set the account for $outlet"
 $username=(Read-Host 'Username').Trim()
 if(-not $username){throw "Username for $outlet cannot be blank."}
 if(-not $seen.Add($username)){throw 'Each outlet must have a different username. Start again and use five unique usernames.'}
 $secret=Read-Host 'Password (at least 12 characters; input is hidden)' -AsSecureString
 $pointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
 try{$password=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer);if($password.Length -lt 12){throw "Password for $outlet must be at least 12 characters. Start again with new passwords."};$accounts+=@{username=$username;password=$password;outlet=$outlet}}
 finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer);$secret.Dispose();$password=$null}
}
$process=$null
try{
 $json=ConvertTo-Json -InputObject @($accounts) -Compress -Depth 4
 $startInfo=[Diagnostics.ProcessStartInfo]::new()
 $startInfo.FileName=(Get-Command node).Source
 $startInfo.Arguments='"{0}"' -f (Join-Path $PSScriptRoot 'provision-retailers.mjs')
 $startInfo.UseShellExecute=$false
 $startInfo.CreateNoWindow=$true
 $startInfo.RedirectStandardInput=$true
 $startInfo.RedirectStandardOutput=$true
 $startInfo.RedirectStandardError=$true
 $process=[Diagnostics.Process]::new()
 $process.StartInfo=$startInfo
 [void]$process.Start()
 $utf8=[Text.UTF8Encoding]::new($false)
 $inputBytes=$utf8.GetBytes($json+"`n")
 $process.StandardInput.BaseStream.Write($inputBytes,0,$inputBytes.Length)
 $process.StandardInput.BaseStream.Flush()
 $process.StandardInput.Close()
 $result=$process.StandardOutput.ReadToEnd()
 $errorCode=$process.StandardError.ReadToEnd().Trim()
 $process.WaitForExit()
 if($process.ExitCode -ne 0){
  $safeError=switch($errorCode){
   'INVALID_JSON_INPUT' {'PowerShell could not pass the account data correctly; use the updated script in the extracted package folder.'}
   'INVALID_ACCOUNT_SET' {'The input must contain one account for each of the five outlets.'}
   'INVALID_OR_DUPLICATE_USERNAME' {'Use five nonblank, unique usernames.'}
   'PASSWORD_TOO_SHORT' {'Each new password must be at least 12 characters.'}
   default {'Account generation failed. No password details were displayed.'}
  }
  throw $safeError
 }
 $null=$result | ConvertFrom-Json
 Set-Clipboard -Value ([string]$result)
 Write-Host 'Hashed configuration copied to your clipboard. Paste it into Render RETAILER_ACCOUNTS, save, then clear your clipboard. Passwords were not written to a file or displayed.'
}finally{if($process){$process.Dispose()};$accounts=$null;$json=$null;$result=$null;$errorCode=$null;$safeError=$null}

# optimize-images.ps1
# Converts images in specified directories to WebP format using cwebp.exe

# --- Configuration ---
$cwebpPath = "C:\Tools\webp\cwebp.exe" # Full path to cwebp.exe
$targetDirectories = @(
    ".\images",
    ".\blog"
)
$imageExtensions = @("*.jpg", "*.jpeg", "*.png")
$cwebpQuality = "80" # Quality setting for cwebp (0-100)
# --- End Configuration ---

# Check if cwebp.exe exists
if (-not (Test-Path $cwebpPath -PathType Leaf)) {
    Write-Error "cwebp.exe not found at '$cwebpPath'. Please update the \$cwebpPath variable in the script."
    exit 1
}

Write-Host "Starting WebP conversion..."
Write-Host "Using cwebp: $cwebpPath"
Write-Host "Target Directories: $($targetDirectories -join ', ')"
Write-Host "Quality: $cwebpQuality"

$convertedCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($dir in $targetDirectories) {
    if (-not (Test-Path $dir -PathType Container)) {
        Write-Warning "Directory not found: $dir. Skipping."
        continue
    }

    Write-Host "`nProcessing directory: $dir"
    Get-ChildItem -Path $dir -Include $imageExtensions -Recurse | ForEach-Object {
        $inputFile = $_.FullName
        $outputFile = [System.IO.Path]::ChangeExtension($inputFile, ".webp")

        # Check if WebP version already exists
        if (Test-Path $outputFile -PathType Leaf) {
            Write-Host "  Skipping: '$($_.Name)' (WebP already exists)"
            $skippedCount++
        } else {
            Write-Host "  Converting: '$($_.Name)' -> '$([System.IO.Path]::GetFileName($outputFile))'"
            # Construct the command arguments
            $arguments = "-q $cwebpQuality `"$inputFile`" -o `"$outputFile`""
            
            # Execute cwebp
            try {
                # Use Start-Process to handle paths with spaces and capture errors better
                $process = Start-Process -FilePath $cwebpPath -ArgumentList $arguments -Wait -NoNewWindow -PassThru -ErrorAction Stop
                if ($process.ExitCode -ne 0) {
                    Write-Warning "  Error converting '$($_.Name)'. cwebp exited with code $($process.ExitCode)."
                    $errorCount++
                } else {
                    $convertedCount++
                }
            } catch {
                Write-Warning "  Failed to execute cwebp for '$($_.Name)'. Error: $($_.Exception.Message)"
                $errorCount++
            }
        }
    }
}

Write-Host "`n--------------------"
Write-Host "WebP Conversion Summary:"
Write-Host "  Converted: $convertedCount"
Write-Host "  Skipped:   $skippedCount"
Write-Host "  Errors:    $errorCount"
Write-Host "--------------------"

if ($errorCount -gt 0) {
    Write-Warning "Some errors occurred during conversion. Please review the output above."
} else {
    Write-Host "Conversion completed successfully."
}
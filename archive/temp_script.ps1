# Define the path to the markdown file
$filePath = "blog-drafts/humans-have-ideas.md"

# Read the entire content of the file
$markdownContent = Get-Content -Path $filePath -Raw

# Split the content into frontmatter and body
$parts = $markdownContent -split "---" | Where-Object { $_ -ne "" }

# Extract frontmatter and format it for ConvertFrom-StringData
$frontmatter = $parts[0] -replace "(.*?): (.*)", "`"$1`" = `"$2`"" | ConvertFrom-StringData

# Extract the content
$content = $parts[1]

# Convert the content into blocks
$blocks = $content.Split("`n") | Where-Object { $_ -ne "" } | ForEach-Object {
    @{
        type    = "text"
        content = $_.Trim()
    }
}

# Create a combined JSON object
$jsonObject = @{
    frontmatter = $frontmatter
    blocks      = $blocks
}

# Convert the combined object to JSON
$jsonOutput = ConvertTo-Json -InputObject $jsonObject -Compress

# Output the JSON
Write-Output $jsonOutput
param(
    [Parameter(Mandatory=$true)]
    [string]$InputFile,

    [string]$ProjectsDataPath = ".\projects\projects-data.json",
    [string]$ProcessedDir = ".\projects\processed-markdown"
)

# --- Validation ---
if (-not (Test-Path $InputFile)) {
    Write-Error "Input file not found: '$InputFile'"
    exit 1
}

if (-not (Test-Path $ProjectsDataPath)) {
    Write-Error "Projects data file not found: '$ProjectsDataPath'"
    exit 1
}

if (-not (Test-Path $ProcessedDir -PathType Container)) {
    Write-Warning "Processed directory not found: '$ProcessedDir'. Creating it."
    New-Item -ItemType Directory -Path $ProcessedDir -Force | Out-Null
}

# --- Read Input File and Extract YAML ---
Write-Host "Reading input file: $InputFile"
$mdContent = Get-Content -Path $InputFile -Raw -ErrorAction Stop

# Extract YAML front matter (between --- and ---)
# Regex updated to handle files ending exactly on the closing ---
$yamlContent = $null
# Original regex: (?s)^---\s*$(.*?)^---\s*$(.*)
if ($mdContent -match '(?s)^---\r?\n(.*?)\r?\n---\r?\n?(.*)') {
    $yamlContent = $Matches[1].Trim()
} else {
    Write-Error "YAML front matter not found or improperly formatted in '$InputFile'."
    exit 1
}

# --- Parse YAML ---
$metadata = $null
try {
    # Explicitly import the module here to ensure it's loaded
    Import-Module powershell-yaml -ErrorAction Stop
    $metadata = ConvertFrom-Yaml -Yaml $yamlContent -ErrorAction Stop
    Write-Host "Successfully parsed YAML frontmatter."
} catch {
    Write-Error "Error parsing YAML front matter in '$InputFile': $($_.Exception.Message)"
    exit 1
}

# --- Data Processing & Validation ---
Write-Host "Validating metadata..."

# Define required fields from the template
$requiredFields = @(
    'title',
    'shortDescription',
    'longDescription',
    'technologies',
    'featuredImage',
    'images',
    'featured',
    'completionDate'
)
$missingOrEmptyFields = @()

foreach ($field in $requiredFields) {
    if (-not $metadata.PSObject.Properties.Name.Contains($field)) {
        $missingOrEmptyFields += "$field (missing)"
    } elseif ($null -eq $metadata.$field) {
         # Allow empty strings for optional fields later, but required fields must have *some* value
         $missingOrEmptyFields += "$field (null)"
    } elseif ($metadata.$field -is [string] -and [string]::IsNullOrWhiteSpace($metadata.$field)) {
         $missingOrEmptyFields += "$field (empty string)"
    } elseif (($metadata.$field -is [array] -or $metadata.$field -is [System.Collections.IList]) -and $metadata.$field.Count -eq 0) {
         $missingOrEmptyFields += "$field (empty list)"
    } elseif ($metadata.$field -is [array] -and $metadata.$field.Count -eq 1 -and [string]::IsNullOrWhiteSpace($metadata.$field[0])) {
         # Handle case like technologies: [""]
         $missingOrEmptyFields += "$field (list with empty string)"
    }
}

# Specific format validations
if ($metadata.PSObject.Properties.Name.Contains('completionDate') -and $metadata.completionDate -notmatch '^\d{4}-\d{2}$') {
    $missingOrEmptyFields += "completionDate (invalid format, expected YYYY-MM)"
}

if ($metadata.PSObject.Properties.Name.Contains('featured') -and $metadata.featured -isnot [bool]) {
     try {
        [bool]::Parse($metadata.featured) # Test conversion
     } catch {
        $missingOrEmptyFields += "featured (invalid boolean value, expected true or false)"
     }
}

if ($missingOrEmptyFields.Count -gt 0) {
    Write-Error "Validation failed for '$InputFile'. Missing, empty, or invalid required fields: $($missingOrEmptyFields -join ', ')"
    exit 1
}

# Generate ID from title (lowercase, hyphenated, remove unsafe chars)
$projectId = $metadata.title.ToLower() -replace '\s+', '-' -replace '[^a-z0-9\-]', ''
Write-Host "Generated Project ID: $projectId"

# Prepare data for JSON (ensure types are correct)
$featuredValue = $false
if ($metadata.featured -is [bool]) {
    $featuredValue = $metadata.featured
} else {
    $featuredValue = [bool]::Parse($metadata.featured) # Convert if string 'true'/'false'
}

# Ensure lists are arrays (should be from YAML, but double-check)
$technologiesArray = @($metadata.technologies)
$imagesArray = @($metadata.images)


# --- JSON Update ---
Write-Host "Updating projects data file: $ProjectsDataPath"

try {
    # Read and parse existing JSON data
    $projectsDataJson = Get-Content -Path $ProjectsDataPath -Raw -ErrorAction Stop
    $projectsData = ConvertFrom-Json -InputObject $projectsDataJson -ErrorAction Stop

    # Ensure $projectsData.projects exists and is an array
    if ($null -eq $projectsData -or $null -eq $projectsData.projects -or -not ($projectsData.projects -is [array])) {
        Write-Warning "Projects data file '$ProjectsDataPath' is empty or has incorrect structure. Initializing."
        $projectsData = [PSCustomObject]@{ projects = @() }
    }

    # Check if project ID already exists
    if ($projectsData.projects.id -contains $projectId) {
        Write-Error "Project with ID '$projectId' already exists in '$ProjectsDataPath'. Please use a unique title or manually edit the JSON."
        exit 1
    }

    # Construct the new project object
    $newProject = [PSCustomObject]@{
        id               = $projectId
        title            = $metadata.title
        shortDescription = $metadata.shortDescription
        longDescription  = $metadata.longDescription
        technologies     = $technologiesArray
        featuredImage    = $metadata.featuredImage
        images           = $imagesArray
        githubUrl        = $metadata.githubUrl # Will be $null if not present in YAML
        liveUrl          = $metadata.liveUrl   # Will be $null if not present in YAML
        blogPostUrl      = $metadata.blogPostUrl # Will be $null if not present in YAML
        featured         = $featuredValue
        completionDate   = $metadata.completionDate
    }

    # Add the new project to the beginning of the array (or end if preferred)
    $projectsData.projects = @($newProject) + $projectsData.projects
    # To add to the end: $projectsData.projects += $newProject

    # Convert back to JSON and save
    $updatedJson = ConvertTo-Json -InputObject $projectsData -Depth 5 -Indent # Use -Indent for readability
    Set-Content -Path $ProjectsDataPath -Value $updatedJson -Encoding UTF8 -ErrorAction Stop

    Write-Host "Successfully added project '$($metadata.title)' (ID: $projectId) to '$ProjectsDataPath'."

} catch {
    Write-Error "An error occurred during JSON update for '$ProjectsDataPath': $($_.Exception.Message)"
    exit 1
}

# --- File Archiving ---
$inputFileBaseName = Split-Path -Path $InputFile -Leaf
$destinationPath = Join-Path -Path $ProcessedDir -ChildPath $inputFileBaseName

Write-Host "Archiving input file to '$destinationPath'..."
try {
    Move-Item -Path $InputFile -Destination $destinationPath -Force -ErrorAction Stop
    Write-Host "Successfully moved '$inputFileBaseName' to '$ProcessedDir'."
} catch {
    Write-Error "Error moving input file '$InputFile' to '$destinationPath': $($_.Exception.Message)"
    # Don't exit here, the JSON was already updated, but warn the user.
    Write-Warning "The project data was updated, but the input file could not be archived."
}

Write-Host "--- Project addition process complete for '$($metadata.title)' ---"
import yaml
import json
import os
import sys
import re
import argparse
import shutil # Added for file moving
from datetime import datetime

# --- Constants ---
PROJECTS_DATA_PATH = os.path.join("projects", "projects-data.json")
PROCESSED_DIR = os.path.join("projects", "processed-markdown")
REQUIRED_FIELDS = [
    'title', 'shortDescription', 'longDescription', 'technologies',
    'featuredImage', 'images', 'featured', 'completionDate'
]

# --- Helper Functions ---

def extract_yaml_frontmatter(file_path):
    """Reads a file and extracts YAML frontmatter."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        match = re.match(r'^---\s*$(.*?)^---\s*$(.*)', content, re.DOTALL | re.MULTILINE)
        if match:
            yaml_content = match.group(1).strip()
            # main_content = match.group(2).strip() # Not needed for this script
            return yaml_content
        else:
            print(f"Error: YAML front matter not found or improperly formatted in '{file_path}'.")
            return None
    except FileNotFoundError:
        print(f"Error: Input file not found: '{file_path}'")
        return None
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return None

def parse_yaml(yaml_content, file_path):
    """Parses YAML content."""
    try:
        metadata = yaml.safe_load(yaml_content)
        print("Successfully parsed YAML frontmatter.")
        return metadata
    except yaml.YAMLError as e:
        print(f"Error parsing YAML front matter in '{file_path}': {e}")
        return None

def validate_metadata(metadata, file_path):
    """Validates the parsed YAML metadata against required fields and formats."""
    errors = []
    for field in REQUIRED_FIELDS:
        if field not in metadata:
            errors.append(f"'{field}' is missing")
        elif not metadata[field] and not isinstance(metadata[field], bool): # Allow featured: false
             errors.append(f"'{field}' is empty")
        elif field in ['technologies', 'images'] and not isinstance(metadata[field], list):
             errors.append(f"'{field}' must be a list/array")
        elif field in ['technologies', 'images'] and isinstance(metadata[field], list) and len(metadata[field]) == 0:
             errors.append(f"'{field}' list cannot be empty")
        elif field in ['technologies', 'images'] and isinstance(metadata[field], list) and len(metadata[field]) == 1 and not metadata[field][0]:
             errors.append(f"'{field}' list contains an empty item")


    # Specific format checks
    if 'completionDate' in metadata and metadata['completionDate']:
        try:
            datetime.strptime(str(metadata['completionDate']), '%Y-%m')
        except ValueError:
            errors.append("'completionDate' format is invalid (expected YYYY-MM)")

    if 'featured' in metadata and not isinstance(metadata['featured'], bool):
        errors.append("'featured' must be a boolean (true or false)")

    if errors:
        print(f"Error: Validation failed for '{file_path}':")
        for error in errors:
            print(f"- {error}")
        return False
    else:
        print("Metadata validation successful.")
        return True

def generate_project_id(title):
    """Generates a URL-friendly ID from a project title."""
    if not title:
        return None
    # Convert to lowercase, replace spaces with hyphens, remove invalid chars
    project_id = title.lower()
    project_id = re.sub(r'\s+', '-', project_id)
    project_id = re.sub(r'[^a-z0-9\-]', '', project_id)
    print(f"Generated Project ID: {project_id}")
    return project_id

# --- Main Logic ---
def main():
    parser = argparse.ArgumentParser(description="Add a new project entry from a Markdown file's YAML frontmatter.")
    parser.add_argument("-i", "--inputFile", required=True, help="Path to the input Markdown file with project details.")
    args = parser.parse_args()

    input_file = args.inputFile

    print(f"Processing input file: {input_file}")

    # 1. Validate paths
    if not os.path.isfile(input_file):
        print(f"Error: Input file not found: '{input_file}'")
        sys.exit(1)
    if not os.path.isfile(PROJECTS_DATA_PATH):
        print(f"Error: Projects data file not found: '{PROJECTS_DATA_PATH}'")
        sys.exit(1)
    if not os.path.isdir(PROCESSED_DIR):
        print(f"Warning: Processed directory not found: '{PROCESSED_DIR}'. Creating it.")
        try:
            os.makedirs(PROCESSED_DIR)
        except OSError as e:
            print(f"Error: Could not create processed directory '{PROCESSED_DIR}': {e}")
            sys.exit(1)

    # 2. Extract YAML
    yaml_content = extract_yaml_frontmatter(input_file)
    if yaml_content is None:
        sys.exit(1)

    # 3. Parse YAML
    metadata = parse_yaml(yaml_content, input_file)
    if metadata is None:
        sys.exit(1)

    # 4. Validate Metadata
    if not validate_metadata(metadata, input_file):
        sys.exit(1)

    # 5. Generate Project ID
    project_id = generate_project_id(metadata.get('title'))
    if not project_id:
        print("Error: Could not generate project ID because title is missing or empty.")
        sys.exit(1)

    # 6. Update JSON Data
    print(f"Updating projects data file: {PROJECTS_DATA_PATH}")
    try:
        # Read existing data
        with open(PROJECTS_DATA_PATH, 'r', encoding='utf-8') as f:
            projects_data = json.load(f)
    except FileNotFoundError:
        print(f"Warning: Projects data file '{PROJECTS_DATA_PATH}' not found. Initializing with an empty list.")
        projects_data = {"projects": []}
    except json.JSONDecodeError as e:
        print(f"Error: Could not parse existing JSON data in '{PROJECTS_DATA_PATH}': {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading projects data file '{PROJECTS_DATA_PATH}': {e}")
        sys.exit(1)

    # Ensure the 'projects' key exists and is a list
    if 'projects' not in projects_data or not isinstance(projects_data['projects'], list):
        print(f"Warning: 'projects' key missing or not a list in '{PROJECTS_DATA_PATH}'. Initializing.")
        projects_data['projects'] = []

    # Check for duplicate ID
    if any(p.get('id') == project_id for p in projects_data['projects']):
        print(f"Error: Project with ID '{project_id}' already exists in '{PROJECTS_DATA_PATH}'. Please use a unique title or manually edit the JSON.")
        sys.exit(1)

    # Construct new project dictionary
    new_project = {
        "id": project_id,
        "title": metadata.get('title'),
        "shortDescription": metadata.get('shortDescription'),
        "longDescription": metadata.get('longDescription'),
        "technologies": metadata.get('technologies', []),
        "featuredImage": metadata.get('featuredImage'),
        "images": metadata.get('images', []),
        "githubUrl": metadata.get('githubUrl', ""), # Use empty string if missing
        "liveUrl": metadata.get('liveUrl', ""),     # Use empty string if missing
        "blogPostUrl": metadata.get('blogPostUrl', ""), # Use empty string if missing
        "featured": metadata.get('featured', False),
        "completionDate": metadata.get('completionDate')
    }

    # Add new project to the beginning of the list
    projects_data['projects'].insert(0, new_project)

    # Write updated data back to JSON
    try:
        with open(PROJECTS_DATA_PATH, 'w', encoding='utf-8') as f:
            json.dump(projects_data, f, indent=2, ensure_ascii=False) # Use indent=2 for readability
        print(f"Successfully added project '{new_project['title']}' (ID: {project_id}) to '{PROJECTS_DATA_PATH}'.")
    except Exception as e:
        print(f"Error writing updated projects data to '{PROJECTS_DATA_PATH}': {e}")
        # Attempting to rollback is complex, maybe just warn?
        print("CRITICAL ERROR: JSON update failed. The projects file might be in an inconsistent state.")
        sys.exit(1)


    # 7. Archive Input File
    print("Archiving input file...")
    input_filename = os.path.basename(input_file)
    destination_path = os.path.join(PROCESSED_DIR, input_filename)
    try:
        shutil.move(input_file, destination_path)
        print(f"Successfully moved '{input_filename}' to '{PROCESSED_DIR}'.")
    except Exception as e:
        print(f"Error moving input file '{input_file}' to '{destination_path}': {e}")
        print("Warning: The project data was updated, but the input file could not be archived.")
        # Don't exit, but the user should be aware.

    # 8. Optional: Submit to Google for indexing
    if '--index' in sys.argv:
        print("\n📝 Submitting to Google Indexing API...")
        project_url = f"https://helloemily.dev/projects/{project_id}/"
        indexing_script = os.path.join(os.path.dirname(__file__), 'google-indexing-api.js')
        
        try:
            import subprocess
            subprocess.run(['node', indexing_script, project_url], check=True)
            print("✓ Successfully submitted to Google\n")
        except Exception as e:
            print(f"⚠️  Failed to submit to Google: {e}\n")
            print("You can manually index this project later with:")
            print(f"  node scripts/google-indexing-api.js \"{project_url}\"\n")

    print(f"--- Project addition process complete for '{new_project['title']}' ---")


if __name__ == "__main__":
    main()
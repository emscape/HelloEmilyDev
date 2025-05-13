# Managing Presentations

This document outlines how to add and manage presentations displayed on the website using the automated processing script.

## Overview: Single Source of Truth & Automation

The system uses Markdown files as the **single source of truth** for presentation card content (title, description, tags). A Node.js script, [`process-new-presentations.js`](process-new-presentations.js:1), automates the process of moving assets and updating the central data index.

-   **Content Source:** The `.md` file in `presentations/posted/` defines the card's text.
    -   Frontmatter: `title`, `tags`
    -   Body: Description/content shown on the card.
-   **Data Index:** [`presentations/presentations-data.json`](presentations/presentations-data.json:1) stores pointers to assets (`cardMarkdownPath`, `pdfPath`, `thumbnail`) and related links (`relatedBlogPostUrl`).
-   **Automation Script:** [`process-new-presentations.js`](process-new-presentations.js:1) processes new assets, moves them to the correct locations, and updates the JSON index.
-   **Display Script:** [`js/presentations-loader.js`](js/presentations-loader.js:1) (runs in the browser) reads the JSON index and fetches the Markdown content to display presentation cards.

## File Structure

-   `presentations/new/`: **Drop new presentation assets here.** The processing script scans this directory.
-   `presentations/posted/`: **Processed assets live here.** Contains the final PDFs and Markdown card files referenced by the JSON index. **Do not manually edit files here unless fixing an issue.**
-   `images/presentations/`: Destination for processed thumbnail/featured images.
-   [`presentations/template-presentation-card.md`](presentations/template-presentation-card.md:1): Template for creating new Markdown card files.
-   [`presentations/presentations-data.json`](presentations/presentations-data.json:1): The central data index (updated by the script).
-   [`process-new-presentations.js`](process-new-presentations.js:1): The Node.js script to process new presentations.

## Adding a New Presentation (Automated Workflow)

1.  **Create Assets in `presentations/new/`:**
    *   **Markdown Card File:**
        *   Copy [`presentations/template-presentation-card.md`](presentations/template-presentation-card.md:1) into the `presentations/new/` directory.
        *   Rename it following the convention `your-presentation-slug-card.md` (e.g., `ai-ethics-talk-card.md`).
        *   Edit the file: Set the `title` and `tags` in the frontmatter. Write the desired description in the **body** of the file.
    *   **PDF File:**
        *   Place the corresponding PDF in `presentations/new/`.
        *   Name it to match the Markdown file's base, without `-card` (e.g., `ai-ethics-talk.pdf`).
    *   **Featured Image:**
        *   Place the corresponding image (e.g., `.png`, `.jpg`) in `presentations/new/`.
        *   Name it following the convention `your-presentation-slug-featured.ext` (e.g., `ai-ethics-talk-featured.png`).

2.  **Run the Processing Script:**
    *   Open your terminal in the project root directory (`c:/repos/HelloEmilyDev`).
    *   Execute the command: `node process-new-presentations.js`
    *   The script will:
        *   Find the new `.md` file in `presentations/new/`.
        *   Verify the corresponding `.pdf` and featured image exist.
        *   Parse the `title` and `tags` from the `.md` file.
        *   Move the `.md` file to `presentations/posted/`.
        *   Move the `.pdf` file to `presentations/posted/`.
        *   Move the image file to `images/presentations/` (renaming it like `ai-ethics-talk-featured.png`).
        *   Add a new entry to [`presentations/presentations-data.json`](presentations/presentations-data.json:1) with the correct paths.
    *   Review the script's output in the terminal for any warnings or errors.

3.  **Verify:**
    *   Check that the files have been moved correctly to `presentations/posted/` and `images/presentations/`.
    *   Check [`presentations/presentations-data.json`](presentations/presentations-data.json:1) for the new entry.
    *   Open `presentations.html` in your browser/dev server to ensure the new card appears correctly.

4.  **(Optional) Add Blog Link:**
    *   Manually edit the new entry in [`presentations/presentations-data.json`](presentations/presentations-data.json:1) to add a value for `relatedBlogPostUrl` if needed.

## Important Notes

*   **Naming Convention:** The script relies on specific naming conventions (`-card.md`, `.pdf`, `-featured.ext`) based on a common slug. Ensure your files in `presentations/new/` follow this pattern.
*   **Error Handling:** The script includes basic checks but might not cover all edge cases. Review terminal output.
*   **Manual Edits:** Avoid manually editing files in `presentations/posted/` or the JSON file unless necessary to correct an error made by the script. The script is designed to manage these.

This automated workflow significantly streamlines adding new presentations and maintains consistency.
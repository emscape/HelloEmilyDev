# Blog Post Processing Script (`process-blog-posts.js`)

This Node.js script automates the processing of new blog posts written in Markdown and integrates them into the website's data structure.

## Prerequisites

1.  **Node.js and npm:** Ensure you have Node.js (which includes npm) installed on your system.
2.  **Dependencies:** If you haven't already, install the necessary dependencies by running the following command in the project root directory (`c:/repos/HelloEmilyDev`):
    ```bash
    npm install js-yaml marked fs-extra
    ```
    (This step only needs to be done once, or if `package.json` changes.)

## Workflow

1.  **Create Your Blog Post:**
    *   Write your blog post content in a Markdown file (e.g., `my-awesome-post.md`).
    *   Include YAML front matter at the very beginning of the file, enclosed by `---` on both sides. See the example below.
    *   Reference all images (both featured and those within the content) using simple relative paths (e.g., `![My Cat](cat-photo.jpg)`).

2.  **Place Files in `blog-drafts/new/`:**
    *   Create a directory named `new` inside the `blog-drafts` folder if it doesn't already exist (`c:/repos/HelloEmilyDev/blog-drafts/new/`).
    *   Place your new markdown file (e.g., `my-awesome-post.md`) into this `blog-drafts/new/` directory.
    *   Place the **featured image** for your post into the *same* `blog-drafts/new/` directory. The featured image filename **must** follow the convention: `[your-markdown-filename-slug]-featured.[extension]`. For example, if your markdown file is `my-awesome-post.md`, your featured image should be named something like `my-awesome-post-featured.png` or `my-awesome-post-featured.jpg`.
    *   Place **all other images** referenced in your markdown content into the *same* `blog-drafts/new/` directory.

3.  **Run the Script:**
    *   Open your terminal or command prompt.
    *   Navigate to the root directory of the project (`c:/repos/HelloEmilyDev`).
    *   Execute the script using the command:
        ```bash
        node process-blog-posts.js
        ```

4.  **Review Script Output:**
    *   The script will log its progress in the terminal.
    *   If there are any errors (e.g., missing required YAML fields, missing image files), the script will report them and skip processing the problematic post. The erroneous markdown file and its associated images (if any were found) will remain in the `blog-drafts/new/` directory for you to correct.
    *   Successfully processed posts will have their markdown files moved to `blog-drafts/processed/` and their images moved to a new subdirectory under `images/blog/[slug]/`.

5.  **Commit Changes:**
    *   After the script runs successfully, new JSON files will be created in `blog-data/`, new image files will be in `images/blog/[slug]/`, and `blog-index.json` will be updated.
    *   Use Git to add, commit, and push these changes to your repository.
    *   Redeploy your website to see the new post live.

## Example YAML Front Matter

Here's an example of the YAML front matter to include at the top of your markdown file:

```yaml
---
title: "Your Blog Post Title"
date: "YYYY-MM-DD" # (Required) Format: Year-Month-Day
author: "Author Name" # (Required)
tags: # (Required) Must be a list, even if only one tag.
  - "Tag1"
  - "Tag2"
  - "Another Tag"
shortDescription: "A concise summary of your blog post, appearing in listings." # (Required)
featuredImage: "your-featured-image-filename.png" # (Required) Filename of the main image for this post (e.g., image.jpg, image.png). This file should be placed in the 'blog-drafts/new/' directory alongside the .md file. The script will move it to 'images/blog/[slug]/'.
featured: false # (Optional) Boolean (true/false). Set to true to mark as a featured post. Defaults to false if omitted.
---

Your markdown content starts here...
![An example image in content](example-content-image.png)
```

**Required YAML Fields:**

*   `title`: "Your Blog Post Title"
*   `date`: "YYYY-MM-DD" # (Required) Format: Year-Month-Day
*   `author`: "Author Name" # (Required)
*   `tags`: # (Required) Must be a list, even if only one tag.
*   `shortDescription`: "A concise summary of your blog post, appearing in listings." # (Required)
*   `featuredImage`: "your-featured-image-filename.png" # (Required) Filename of the main image for this post.
*   `featured`: false # (Optional) Boolean (true/false). Defaults to false if omitted.

The script will use the markdown filename (without the `.md` extension) as the `slug` for the post (e.g., `my-awesome-post.md` becomes slug `my-awesome-post`).
# Instructions 48: Rename Image Files to Follow Naming Convention

## Task
Rename image files to fit the established image file naming convention.

## Steps Completed

1. **Analyzed the existing image naming convention**
   - Examined image folders to identify the established naming pattern
   - Determined that the convention is:
     - [folder-name]-[number].jpg for regular images (e.g., gen-ai-enterprise-1.jpg)
     - [folder-name]-featured.jpg for featured images (e.g., gen-ai-enterprise-featured.jpg)

2. **Identified files that needed renaming**
   - In personal-ai folder:
     - 2025-03-11_13-47-44.jpg → personal-ai-1.jpg
     - 2025-03-11_13-51-46.jpg → personal-ai-2.jpg
     - b1e198c582df240b901136c8cf730f5c.jpg → personal-ai-3.jpg
   - In panel-facilitation folder:
     - PXL_20230421_001409160.jpg → panel-facilitation-2.jpg

3. **Created featured images for consistency**
   - Created personal-ai-featured.jpg (copied from personal-ai-2.jpg)
   - Created panel-facilitation-featured.jpg (copied from panel-facilitation-2.jpg)

4. **Updated blog-data.json references**
   - Updated the featuredImage references to point to the new featured image files:
     - Changed "images/blog/personal-ai/2025-03-11_13-51-46.jpg" to "images/blog/personal-ai/personal-ai-featured.jpg"
     - Changed "images/blog/panel-facilitation/PXL_20230421_001409160.jpg" to "images/blog/panel-facilitation/panel-facilitation-featured.jpg"

5. **Verified other image folders**
   - Confirmed that other image folders (ai-ethics, ai-guardrails, gen-ai-enterprise, io-puzzle, sean-website) already follow the naming convention
   - Noted that knitting-tech folder exists but is currently empty

## Technical Details

### Image Naming Convention
- Regular images: [folder-name]-[number].jpg
  - Example: gen-ai-enterprise-1.jpg
- Featured images: [folder-name]-featured.jpg
  - Example: gen-ai-enterprise-featured.jpg

### Files Modified
- Renamed image files:
  - images/blog/personal-ai/2025-03-11_13-47-44.jpg → images/blog/personal-ai/personal-ai-1.jpg
  - images/blog/personal-ai/2025-03-11_13-51-46.jpg → images/blog/personal-ai/personal-ai-2.jpg
  - images/blog/personal-ai/b1e198c582df240b901136c8cf730f5c.jpg → images/blog/personal-ai/personal-ai-3.jpg
  - images/blog/panel-facilitation/PXL_20230421_001409160.jpg → images/blog/panel-facilitation/panel-facilitation-2.jpg
- Created new image files:
  - images/blog/personal-ai/personal-ai-featured.jpg
  - images/blog/panel-facilitation/panel-facilitation-featured.jpg
- Updated references in blog/blog-data.json

## Next Steps
- Continue to follow the established naming convention for any new images added to the blog
- Consider adding a README.md file in the images/blog folder to document the naming convention for future reference
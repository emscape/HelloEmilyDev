# 🧠 Roo Architect Mode: Image Optimization Directive

## 🚨 Issue Summary

The current blog post rendering lacks image performance optimizations:

- ❌ No modern image format fallbacks (e.g., WebP, AVIF)
- ❌ No lazy loading for off-screen images
- ❌ No compression or size optimization for featured or inline images

---

## 🛠️ Proposed Solution

### 1. Add Responsive Image Styles to CSS

```css
img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.5rem auto;
  object-fit: contain;
  border-radius: 12px;
}

.featured-image {
  max-height: 400px;
  object-fit: cover;
  width: 100%;
  border-radius: 12px;
}
```

---

### 2. Inject `srcset` and Fallback Logic into Blog Templates

Use the `<picture>` element to allow browsers to choose optimal formats:

```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Descriptive alt text" loading="lazy">
</picture>
```

Automate this using Roo’s Markdown-to-HTML pipeline or templating logic.

---

### 3. Enable Lazy Loading on All Images

Ensure all images use native browser lazy loading:

```html
<img src="image.jpg" alt="..." loading="lazy" />
```

This can be implemented as a default behavior during image injection.

---

### 4. Compress Existing Images

Optimize current assets with batch tools:

- [`imagemin`](https://www.npmjs.com/package/imagemin) (Node.js CLI)
- [`squoosh-cli`](https://github.com/GoogleChromeLabs/squoosh)
- [`ImageMagick`](https://imagemagick.org/index.php) (for lossless batch operations)

---

## 🎯 Goal

Improve performance, accessibility, and SEO through:

- Faster page load times
- Smaller payload sizes
- Better compatibility across devices and bandwidth conditions
- Higher Lighthouse scores

---

## 🧩 Notes for Roo

- Consider a pre-deploy hook to auto-convert and compress `.png`/`.jpg` assets to `.webp`
- Default to `loading="lazy"` for all Markdown image renders unless explicitly overridden


---

## 📋 Final Implementation Plan (2025-04-16 00:39)

Based on the initial directive and subsequent analysis, here is the refined plan:

1.  **CSS Modifications (`styles.css`):**
    *   **Add Global Styles:** Integrate the recommended global `img` styles from the directive.
    *   **Add Featured Image Styles:** Add the `.featured-image` class styles.
    *   **Review & Refactor:** Examine existing image-related CSS rules (e.g., `.blog-post img`, `.blog-card-image img`, `.blog-post-banner img`, `.blog-post-inline-image`) to ensure they work correctly with the new global styles, adjusting or removing them as needed to avoid conflicts.

2.  **JavaScript Updates (`js/blog-content-parser.js`):**
    *   **Modify Renderers:** Update `renderImageBlock` and `renderImageGridBlock`.
    *   **Implement `<picture>` Element:** Change functions to output `<picture>`.
    *   **Add WebP Source (Improved Hybrid Logic):**
        *   Determine the `srcset` for the WebP `<source>`:
            *   Check if the image data object has a `webpSrc` property. If yes, use its value.
            *   If `webpSrc` is not present, **validate** if the original `src` property ends with `.jpg` or `.png`.
            *   If validation passes, derive the path by replacing the extension with `.webp`.
            *   If validation fails (no standard extension), **do not generate the WebP `<source>` tag**.
        *   If a WebP path is determined, add the `<source srcset="determined_webp_path" type="image/webp">` tag inside `<picture>`.
    *   **Maintain Fallback & Lazy Load:** Keep the original `<img>` tag within the `<picture>` element (or as the only element if WebP source is skipped). Ensure `loading="lazy"` remains on the `<img>` tag.
    *   **Add Documentation:** Add comments within `js/blog-content-parser.js` explaining the hybrid WebP source logic (override via `webpSrc`, fallback via derivation, and the extension validation).

3.  **Image Asset Generation & Compression (Manual/Tooling):**
    *   **Process Images:** Use a batch image processing tool (like `imagemin`, `squoosh-cli`, or `ImageMagick`) on the `images/` and `blog/` directories.
    *   **Compress:** Optimize the file size of existing `.jpg` and `.png` images.
    *   **Generate WebP:** Create `.webp` versions for all relevant `.jpg` and `.png` images, placing them alongside the originals (with the same base name but `.webp` extension) to support the default path derivation logic.

4.  **Data Source Update (Optional Override):**
    *   Only if specific images require a different `.webp` path than the auto-derived one, update the corresponding entry in `blog/blog-data.json` to include a `webpSrc` field with the explicit path. *(Documentation now handled in JS)*.

5.  **Testing:**
    *   **Cross-Browser:** Verify images load correctly, testing WebP support, override logic, and fallback behavior.
    *   **Lazy Loading:** Confirm images outside the initial viewport are loaded only upon scrolling.
    *   **Styling:** Check that all images are styled correctly and responsively.
    *   **Performance:** Use tools like Lighthouse to measure the impact.

### Visualizing the Refined `<picture>` Logic:

```mermaid
graph LR
    A[JS Parser: renderImageBlock/GridBlock] --> B{Get Image Data (src, webpSrc?)};
    B --> C{Has webpSrc field?};
    C -- Yes --> D[Use webpSrc value];
    C -- No --> E{Does src end with .jpg/.png?};
    E -- Yes --> F[Derive .webp path from src];
    E -- No --> G[Skip WebP Source];
    D --> H{Generate <picture>};
    F --> H;
    G --> I{Generate only <img>}; // Fallback if no WebP
    H --> J[<source srcset="determined_webp_path" type="image/webp">];
    H --> K[<img src="original_src" alt="..." loading="lazy">];
    I --> K; // Connect fallback img generation
    B --> K; // Connect original src to img tag
```

- Template-level fallback logic should be reusable for both blog and documentation posts

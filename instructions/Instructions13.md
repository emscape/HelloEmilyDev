# Instructions 13: Image Integration and Website Updates

## Task Overview
Integrate the newly added images into the website and update the necessary files to display them properly.

## Files Added and Confirmed
The following requested files have been successfully added to the repository:

1. **Profile Photo**:
   - `images/profile.jpg` - Added successfully
   - Current status: Not yet integrated into the website (placeholder still in use)

2. **Background Image**:
   - `images/background-hero.jpg` - Added successfully
   - Current status: Not yet integrated into the website

3. **Project Screenshots**:
   - Multiple `images/projects/io-puzzle-*.jpeg` files (1 through 19) - Added successfully
   - `projects/sean-website-main.jpg` - Added successfully
   - `projects/website-main.jpg` - Added successfully
   - `projects/website-mobile.png` - Added successfully (note: .png format instead of .jpg as referenced in projects-data.json)
   - Current status: Not yet integrated into the website

## Required Updates

### 1. Update index.html to use the profile image
Replace the profile image placeholder with the actual image:
```html
<!-- Replace this: -->
<div class="about-image-placeholder">
    <div class="profile-image-circle">
        <span>E</span>
        <p class="image-note">Add your photo here</p>
    </div>
</div>

<!-- With this: -->
<div class="about-image">
    <img src="images/profile.jpg" alt="Emily's profile photo" class="profile-image">
</div>
```

### 2. Update the hero section to use the background image
Add CSS to use the background image in the hero section:
```css
#hero {
    background-image: url('images/background-hero.jpg');
    background-size: cover;
    background-position: center;
    /* Other existing styles */
}
```

### 3. Update projects.js to display project images
Modify the project card HTML in the displayProjects function to include images:
```javascript
// Build card HTML
projectCard.innerHTML = `
    ${project.featuredImage ? `<div class="project-image"><img src="${project.featuredImage}" alt="${project.title}"></div>` : ''}
    <h3>${project.title}</h3>
    <p>${project.shortDescription}</p>
    <div class="project-tags">
        ${tagsHTML}
    </div>
    <div class="project-links">
        ${project.liveUrl ? `<a href="${project.liveUrl}" class="btn" target="_blank">View Project</a>` : ''}
        ${project.githubUrl ? `<a href="${project.githubUrl}" class="btn btn-secondary" target="_blank">View Source</a>` : ''}
    </div>
`;
```

### 4. Update projects-data.json to fix the file extension
Change the reference to `website-mobile.jpg` to `website-mobile.png` in the projects-data.json file.

### 5. Add CSS for the new image elements
Add appropriate CSS styles for the profile image and project images in styles.css.

## Next Steps
1. Implement the updates outlined above
2. Test the website to ensure all images display correctly
3. Optimize images for web if needed (compression, responsive sizing)
4. Continue with mobile optimization as mentioned in PromptContext.md
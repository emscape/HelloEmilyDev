document.addEventListener('DOMContentLoaded', () => {
    const presentationsList = document.getElementById('presentations-list');
    if (!presentationsList) {
        console.error('Error: Element with ID "presentations-list" not found.');
        return;
    }

    fetch('../presentations/presentations-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                console.error('Error: Presentation data is not an array.');
                return;
            }
            data.forEach(presentation => {
                const presentationItem = document.createElement('div');
                presentationItem.classList.add('presentation-item');

                const thumbnail = document.createElement('img');
                thumbnail.src = presentation.thumbnail;
                thumbnail.alt = `Thumbnail for ${presentation.title}`;
                thumbnail.classList.add('presentation-thumbnail'); // Optional: for specific thumbnail styling if needed

                const title = document.createElement('h3');
                title.textContent = presentation.title;

                const description = document.createElement('p');
                description.textContent = presentation.description;

                const pdfLink = document.createElement('a');
                pdfLink.href = presentation.pdfPath;
                pdfLink.textContent = 'View/Download PDF';
                pdfLink.target = '_blank';
                pdfLink.classList.add('presentation-link'); // Optional: for specific link styling

                const contentDiv = document.createElement('div');
                contentDiv.classList.add('presentation-item-content');

                contentDiv.appendChild(title);
                contentDiv.appendChild(description);

                // Display Tags
                if (presentation.tags && presentation.tags.length > 0) {
                    const tagsDiv = document.createElement('div');
                    tagsDiv.classList.add('presentation-tags');
                    presentation.tags.forEach(tagText => {
                        const tagSpan = document.createElement('span');
                        tagSpan.classList.add('tag');
                        tagSpan.textContent = tagText;
                        tagsDiv.appendChild(tagSpan);
                    });
                    contentDiv.appendChild(tagsDiv);
                }

                contentDiv.appendChild(pdfLink);

                // Display Related Blog Post Button
                if (presentation.relatedBlogPostUrl && presentation.relatedBlogPostUrl.trim() !== '') {
                    const blogPostBtn = document.createElement('a');
                    blogPostBtn.href = presentation.relatedBlogPostUrl;
                    blogPostBtn.textContent = 'Read Blog Post';
                    blogPostBtn.target = '_blank';
                    blogPostBtn.classList.add('btn', 'blog-post-btn');
                    contentDiv.appendChild(blogPostBtn);
                }

                presentationItem.appendChild(thumbnail);
                presentationItem.appendChild(contentDiv);

                presentationsList.appendChild(presentationItem);
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing presentations data:', error);
            presentationsList.innerHTML = '<p>Error loading presentations. Please try again later.</p>';
        });
});
document.addEventListener('DOMContentLoaded', function() {
    console.log('load-header.js: Script started.');
    const headerPath = '/_includes/header.html';
    const fullUrl = window.location.origin + headerPath;
    console.log('load-header.js: Attempting to fetch header from:', fullUrl);

    fetch(headerPath) // Ensure this path is correct from the root
        .then(response => {
            console.log('load-header.js: Fetch response received. Status:', response.status, 'StatusText:', response.statusText);
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}, StatusText: ${response.statusText}, URL: ${response.url}`);
            }
            return response.text();
        })
        .then(data => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                console.log('load-header.js: Header placeholder found. Injecting HTML.');
                headerPlaceholder.innerHTML = data;
                console.log('load-header.js: Header HTML injected successfully.');
            } else {
                console.error('load-header.js: Critical error - Header placeholder element with ID "header-placeholder" not found in the DOM.');
            }
        })
        .catch(error => {
            console.error('load-header.js: Error fetching or processing header:', error.message, error);
        });
});
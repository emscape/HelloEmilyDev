document.addEventListener('DOMContentLoaded', function() {
    const headerPath = '/header.html';

    fetch(headerPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}, StatusText: ${response.statusText}, URL: ${response.url}`);
            }
            return response.text();
        })
        .then(data => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = data;
            } else {
                console.error('Header placeholder element with ID "header-placeholder" not found in the DOM.');
            }
        })
        .catch(error => {
            console.error('load-header.js: Error fetching or processing header:', error.message, error);
        });
});
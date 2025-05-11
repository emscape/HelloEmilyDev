document.addEventListener('DOMContentLoaded', function() {
    fetch('/_includes/header.html') // Ensure this path is correct from the root
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = data;
            } else {
                console.error('Header placeholder not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching header:', error);
        });
});
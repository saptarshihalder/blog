document.addEventListener('DOMContentLoaded', function () {
    const blogPosts = document.querySelectorAll('.blog-post');

    blogPosts.forEach(post => {
        post.addEventListener('click', function () {
            const postTitle = this.querySelector('h2').textContent;
            const postContent = this.querySelector('p').textContent;

            const sliderBlogContent = document.querySelector('.slider-blog-content');
            sliderBlogContent.innerHTML = `
                <h2>${postTitle}</h2>
                <p>${postContent}</p>
            `;

            const sliderOverlay = document.querySelector('.slider-overlay');
            sliderOverlay.style.display = 'block';
        });
    });

    const closeSlider = document.querySelector('.close-slider');
    closeSlider.addEventListener('click', function () {
        const sliderOverlay = document.querySelector('.slider-overlay');
        sliderOverlay.style.display = 'none';
    });
});

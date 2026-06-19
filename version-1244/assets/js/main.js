(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    const previousButton = document.querySelector('[data-hero-prev]');
    const nextButton = document.querySelector('[data-hero-next]');
    let currentSlide = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    function startCarousel() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    function resetCarousel() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startCarousel();
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            resetCarousel();
        });
    });

    if (previousButton) {
        previousButton.addEventListener('click', function () {
            showSlide(currentSlide - 1);
            resetCarousel();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showSlide(currentSlide + 1);
            resetCarousel();
        });
    }

    showSlide(0);
    startCarousel();

    const searchInputs = Array.from(document.querySelectorAll('[data-movie-search]'));

    searchInputs.forEach(function (input) {
        const scope = input.closest('main') || document;
        const cards = Array.from(scope.querySelectorAll('.movie-card'));
        const message = document.createElement('div');
        message.className = 'no-results';
        message.textContent = '没有找到匹配的影片';

        input.addEventListener('input', function () {
            const keyword = input.value.trim().toLowerCase();
            let visibleCount = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' ').toLowerCase();
                const matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visibleCount += 1;
                }
            });

            const firstGrid = scope.querySelector('.movie-grid, .horizontal-grid, .ranking-list');
            if (firstGrid) {
                if (visibleCount === 0 && !message.parentNode) {
                    firstGrid.appendChild(message);
                } else if (visibleCount > 0 && message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }
        });
    });
})();

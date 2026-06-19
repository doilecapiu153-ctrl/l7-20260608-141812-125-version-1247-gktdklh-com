(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === heroIndex);
    });

    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-page-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var empty = document.querySelector('[data-filter-empty]');

  function applyFilter(value) {
    var term = String(value || '').trim().toLowerCase();
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var matched = !term || text.indexOf(term) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visibleCount += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  if (filterInput && cards.length) {
    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }

  var globalInput = document.querySelector('[data-global-search]');
  var globalButton = document.querySelector('[data-global-search-button]');
  var globalResults = document.querySelector('[data-global-results]');
  var globalTitle = document.querySelector('[data-global-title]');

  function safe(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderGlobalSearch() {
    if (!globalInput || !globalResults || !window.SEARCH_MOVIES) {
      return;
    }

    var term = String(globalInput.value || '').trim().toLowerCase();
    var list = window.SEARCH_MOVIES.filter(function (movie) {
      return !term || movie.text.indexOf(term) !== -1;
    }).slice(0, 80);

    if (globalTitle) {
      globalTitle.textContent = term ? '搜索结果' : '热门推荐';
    }

    globalResults.innerHTML = list.map(function (movie) {
      return '<article class="movie-card compact">'
        + '<a class="poster-link" href="' + safe(movie.url) + '">'
        + '<img src="' + safe(movie.cover) + '" alt="' + safe(movie.title) + '" loading="lazy">'
        + '<span class="play-float">▶</span>'
        + '</a>'
        + '<div class="card-body">'
        + '<a class="card-title" href="' + safe(movie.url) + '">' + safe(movie.title) + '</a>'
        + '<p class="card-meta">' + safe(movie.year) + ' · ' + safe(movie.region) + ' · ' + safe(movie.type) + '</p>'
        + '</div>'
        + '</article>';
    }).join('');
  }

  if (globalInput && globalResults) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      globalInput.value = q;
    }
    globalInput.addEventListener('input', renderGlobalSearch);
    if (globalButton) {
      globalButton.addEventListener('click', renderGlobalSearch);
    }
    renderGlobalSearch();
  }
})();

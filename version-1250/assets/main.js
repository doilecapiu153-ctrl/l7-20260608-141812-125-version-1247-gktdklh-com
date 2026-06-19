(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        play();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function initLocalFilter() {
    var input = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        card.style.display = text.indexOf(keyword) >= 0 ? '' : 'none';
      });
    });
  }

  function createSearchCard(item) {
    var article = document.createElement('article');
    article.className = 'movie-card';

    var link = document.createElement('a');
    link.className = 'movie-card-link';
    link.href = item.url;

    var figure = document.createElement('figure');
    figure.className = 'movie-poster';

    var img = document.createElement('img');
    img.src = item.cover;
    img.alt = item.title;
    img.loading = 'lazy';

    var score = document.createElement('span');
    score.className = 'score-badge';
    score.textContent = item.score;

    var duration = document.createElement('span');
    duration.className = 'duration-badge';
    duration.textContent = item.duration;

    var body = document.createElement('div');
    body.className = 'movie-card-body';

    var meta = document.createElement('div');
    meta.className = 'movie-meta';
    [item.year, item.region, item.type].forEach(function (value) {
      var span = document.createElement('span');
      span.textContent = value;
      meta.appendChild(span);
    });

    var title = document.createElement('h3');
    title.textContent = item.title;

    var copy = document.createElement('p');
    copy.textContent = item.oneLine;

    var tags = document.createElement('div');
    tags.className = 'tag-row';
    item.tags.slice(0, 3).forEach(function (value) {
      var tag = document.createElement('span');
      tag.textContent = value;
      tags.appendChild(tag);
    });

    figure.appendChild(img);
    figure.appendChild(score);
    figure.appendChild(duration);
    body.appendChild(meta);
    body.appendChild(title);
    body.appendChild(copy);
    body.appendChild(tags);
    link.appendChild(figure);
    link.appendChild(body);
    article.appendChild(link);
    return article;
  }

  function initSearchPage() {
    var results = document.getElementById('searchResults');
    var fallback = document.getElementById('searchFallback');
    var input = document.getElementById('searchPageInput');
    if (!results || !input || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(keyword) {
      var q = keyword.trim().toLowerCase();
      results.innerHTML = '';
      if (!q) {
        if (fallback) {
          fallback.style.display = '';
        }
        return;
      }
      if (fallback) {
        fallback.style.display = 'none';
      }
      var matches = window.MOVIE_SEARCH_DATA.filter(function (item) {
        return item.searchText.toLowerCase().indexOf(q) >= 0;
      }).slice(0, 120);
      if (!matches.length) {
        var empty = document.createElement('div');
        empty.className = 'detail-card';
        empty.textContent = '没有找到匹配影片';
        results.appendChild(empty);
        return;
      }
      matches.forEach(function (item) {
        results.appendChild(createSearchCard(item));
      });
    }

    render(initial);
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
  });
})();

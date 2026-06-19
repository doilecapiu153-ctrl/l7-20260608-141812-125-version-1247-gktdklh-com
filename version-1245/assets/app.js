(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var filterType = scope.querySelector('[data-filter-type]');
    var filterRegion = scope.querySelector('[data-filter-region]');
    var filterYear = scope.querySelector('[data-filter-year]');
    var sortSelect = scope.querySelector('[data-sort]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty]');
    var sortContainer = scope.querySelector('[data-sort-container]');

    function applyFilters() {
      var query = normalize(input && input.value);
      var typeValue = normalize(filterType && filterType.value);
      var regionValue = normalize(filterRegion && filterRegion.value);
      var yearValue = normalize(filterYear && filterYear.value);
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !typeValue || normalize(card.dataset.type) === typeValue;
        var matchesRegion = !regionValue || normalize(card.dataset.region) === regionValue;
        var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
        var visible = matchesQuery && matchesType && matchesRegion && matchesYear;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    function applySort() {
      if (!sortSelect || !sortContainer) {
        return;
      }
      var value = sortSelect.value;
      var sorted = cards.slice();
      if (value === 'year-desc') {
        sorted.sort(function (a, b) {
          return normalize(b.dataset.year).localeCompare(normalize(a.dataset.year), 'zh-Hans-CN');
        });
      }
      if (value === 'title-asc') {
        sorted.sort(function (a, b) {
          return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-Hans-CN');
        });
      }
      if (value === 'default') {
        sorted = cards.slice();
      }
      sorted.forEach(function (card) {
        sortContainer.appendChild(card);
      });
      applyFilters();
    }

    [input, filterType, filterRegion, filterYear].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
    }

    applyFilters();
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');
    var hlsInstance = null;

    function prepare() {
      if (!video || player.dataset.ready === 'true') {
        return;
      }
      var url = player.dataset.playUrl;
      if (!url) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
      player.dataset.ready = 'true';
    }

    function play() {
      prepare();
      if (!video) {
        return;
      }
      player.classList.add('playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        prepare();
        player.classList.add('playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var section = form.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-filter-card]"));
      var input = form.querySelector("[data-filter-input]");
      var region = form.querySelector("[data-filter-region]");
      var kind = form.querySelector("[data-filter-kind]");
      var empty = section.querySelector("[data-filter-empty]");

      function filter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var kindValue = kind ? kind.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardRegion = card.getAttribute("data-region") || "";
          var cardType = card.getAttribute("data-type") || "";
          var ok = true;
          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            ok = false;
          }
          if (kindValue && cardType.indexOf(kindValue) === -1) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, region, kind].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filter);
          control.addEventListener("change", filter);
        }
      });
      filter();
    });
  }

  function setupRails() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-target]"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-target"));
        var dir = button.getAttribute("data-scroll-dir") === "left" ? -1 : 1;
        if (target) {
          target.scrollBy({ left: dir * 320, behavior: "smooth" });
        }
      });
    });
  }

  function setupImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    images.forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-missing");
      }, { once: true });
    });
  }

  function playVideo(video, cover) {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  }

  function initPlayer(id, stream) {
    var video = document.getElementById(id);
    if (!video || !stream) {
      return;
    }
    var box = video.closest("[data-player]");
    var cover = box ? box.querySelector("[data-play-cover]") : null;
    var loaded = false;

    function loadAndPlay() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (!loaded) {
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          playVideo(video, cover);
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(stream);
          });
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo(video, cover);
          });
          video.__hls = hls;
        } else {
          video.src = stream;
          playVideo(video, cover);
        }
      } else {
        playVideo(video, cover);
      }
    }

    if (cover) {
      cover.addEventListener("click", loadAndPlay);
    }
    video.addEventListener("click", function () {
      if (!loaded) {
        loadAndPlay();
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupRails();
    setupImages();
  });
})();

(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("open");
        document.body.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var hero = document.querySelector(".hero");
    var index = 0;
    var timer = null;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        var active = position === index;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (slides.length) {
      showSlide(0);
      startHero();
      var prev = document.querySelector(".hero-control.prev");
      var next = document.querySelector(".hero-control.next");
      if (prev) {
        prev.addEventListener("click", function () {
          stopHero();
          showSlide(index - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          stopHero();
          showSlide(index + 1);
        });
      }
      dots.forEach(function (dot, position) {
        dot.addEventListener("click", function () {
          stopHero();
          showSlide(position);
        });
      });
      if (hero) {
        hero.addEventListener("mouseenter", stopHero);
        hero.addEventListener("mouseleave", startHero);
      }
    }

    document.querySelectorAll("[data-scroll-left], [data-scroll-right]").forEach(function (button) {
      button.addEventListener("click", function () {
        var wrap = button.closest(".rail-wrap");
        var rail = wrap ? wrap.querySelector(".movie-rail") : null;
        if (!rail) {
          return;
        }
        var distance = button.hasAttribute("data-scroll-left") ? -320 : 320;
        rail.scrollBy({ left: distance, behavior: "smooth" });
      });
    });

    document.querySelectorAll(".js-search-form").forEach(function (form) {
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var inputs = Array.prototype.slice.call(form.querySelectorAll("input, select"));

      function applyFilter() {
        var data = new FormData(form);
        var keyword = String(data.get("keyword") || "").trim().toLowerCase();
        var region = String(data.get("region") || "");
        var type = String(data.get("type") || "");
        var year = String(data.get("year") || "");

        cards.forEach(function (card) {
          var query = String(card.getAttribute("data-query") || "").toLowerCase();
          var cardRegion = String(card.getAttribute("data-region") || "");
          var cardType = String(card.getAttribute("data-type") || "");
          var cardYear = String(card.getAttribute("data-year") || "");
          var match = true;
          if (keyword && query.indexOf(keyword) === -1) {
            match = false;
          }
          if (region && cardRegion !== region) {
            match = false;
          }
          if (type && cardType !== type) {
            match = false;
          }
          if (year && cardYear !== year) {
            match = false;
          }
          card.classList.toggle("is-hidden-card", !match);
        });
      }

      inputs.forEach(function (input) {
        input.addEventListener("input", applyFilter);
        input.addEventListener("change", applyFilter);
      });
    });

    document.querySelectorAll(".player-wrap").forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var sourceTag = video ? video.querySelector("source") : null;
      var overlay = wrap.querySelector(".play-overlay");
      if (!video || !sourceTag) {
        return;
      }
      var source = sourceTag.src;
      var loaded = false;
      var hls = null;

      function loadVideo() {
        if (loaded) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }

      function startVideo() {
        loadVideo();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startVideo);
      }
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          startVideo();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("error", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });

    var backTop = document.createElement("button");
    backTop.className = "back-top";
    backTop.type = "button";
    backTop.setAttribute("aria-label", "返回顶部");
    backTop.textContent = "↑";
    document.body.appendChild(backTop);
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("show", window.scrollY > 600);
    });
  });
})();

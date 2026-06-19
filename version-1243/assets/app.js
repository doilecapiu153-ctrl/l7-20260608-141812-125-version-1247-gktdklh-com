(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function norm(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var button = $(".menu-toggle");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            document.body.classList.toggle("nav-open");
        });
        $all(".nav-menu a").forEach(function (link) {
            link.addEventListener("click", function () {
                document.body.classList.remove("nav-open");
            });
        });
    }

    function setupHero() {
        var root = $(".hero-slider");
        if (!root) {
            return;
        }
        var slides = $all(".hero-slide", root);
        var dots = $all(".hero-dot", root);
        var prev = $(".hero-prev", root);
        var next = $(".hero-next", root);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
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
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        $all(".filter-scope").forEach(function (scope) {
            var search = $(".search-input", scope);
            var year = $(".year-select", scope);
            var group = $(".filter-select", scope);
            var cards = $all(".movie-card", scope);
            var empty = $(".empty-state", scope);

            function apply() {
                var q = norm(search && search.value);
                var y = year && year.value ? year.value : "";
                var g = group && group.value ? group.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = norm(card.getAttribute("data-search"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardGroup = card.getAttribute("data-group") || "";
                    var ok = (!q || text.indexOf(q) !== -1) && (!y || cardYear === y) && (!g || cardGroup === g);
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [search, year, group].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function setupBackTop() {
        var button = $(".back-top");
        if (!button) {
            return;
        }
        function toggle() {
            button.classList.toggle("show", window.scrollY > 520);
        }
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        window.addEventListener("scroll", toggle, { passive: true });
        toggle();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupBackTop();
    });
})();

function setupMoviePlayer(source) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playMovieButton");
    if (!video || !button || !source) {
        return;
    }
    var ready = false;
    var hls = null;

    function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {});
        }
    }

    function loadVideo() {
        if (ready) {
            return;
        }
        ready = true;
        video.controls = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                hls.loadSource(source);
            });
            hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
            video.src = source;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
        }
    }

    function start() {
        button.classList.add("is-hidden");
        loadVideo();
        playVideo();
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}

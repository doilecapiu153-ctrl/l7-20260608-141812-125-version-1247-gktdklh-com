(function () {
    function bindSource(video, src) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            return null;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            return hls;
        }

        video.src = src;
        return null;
    }

    window.initMoviePlayer = function (videoId, src) {
        const video = document.getElementById(videoId);
        if (!video || !src) {
            return;
        }

        const frame = video.closest('[data-player-shell]');
        const button = frame ? frame.querySelector('[data-play-button]') : null;
        let attached = false;

        function start() {
            if (!attached) {
                bindSource(video, src);
                attached = true;
            }
            if (button) {
                button.classList.add('hidden');
            }
            const attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('hidden');
            }
        });
    };
})();

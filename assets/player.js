(function () {
    function attachStream(video, url) {
        if (video.getAttribute('data-ready') === 'true') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.hlsInstance = hls;
        } else {
            video.src = url;
        }

        video.setAttribute('data-ready', 'true');
    }

    window.initializeMoviePlayer = function (videoId, url) {
        var video = document.getElementById(videoId);
        var cover = document.querySelector('[data-player-cover="' + videoId + '"]');

        if (!video) {
            return;
        }

        function start() {
            attachStream(video, url);
            video.controls = true;

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var playTask = video.play();

            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.getAttribute('data-ready') !== 'true') {
                start();
            }
        });
    };
})();

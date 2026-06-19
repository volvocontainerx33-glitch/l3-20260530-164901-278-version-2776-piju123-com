(function () {
  window.initMoviePlayer = function (settings) {
    var video = document.getElementById(settings.videoId || 'moviePlayer');
    var overlay = document.getElementById(settings.overlayId || 'movieOverlay');
    var message = document.getElementById(settings.messageId || 'playerMessage');
    var source = settings.source;
    var hls = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function attachSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('视频加载失败，请稍后再试');
          }
        });
      } else {
        video.src = source;
      }
    }

    function start() {
      attachSource();
      hideOverlay();
      var playRequest = video.play();

      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {
          setMessage('点击播放器继续观看');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('canplay', function () {
      setMessage('');
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();

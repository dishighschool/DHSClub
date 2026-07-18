document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const videoCard = document.querySelector('.video-card');

  if (window.location.protocol === 'file:' && videoCard) {
    videoCard.innerHTML = `
      <a
        class="video-fallback"
        href="https://www.youtube.com/watch?v=fMaGdsfXHKM"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="在 YouTube 觀看共創社群導覽影片"
      >
        <img src="https://i.ytimg.com/vi/fMaGdsfXHKM/maxresdefault.jpg" alt="">
        <span class="video-fallback-content">
          <span class="video-play" aria-hidden="true">&#9654;</span>
          <strong>觀看共創社群導覽影片</strong>
          <small>將在 YouTube 開啟</small>
        </span>
      </a>
    `;
  }

  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }
});

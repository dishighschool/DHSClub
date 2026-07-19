document.documentElement.classList.add('js');

const DISCORD_INVITE_URL = 'https://discord.gg/jx5rBTGXQN';
const DISCORD_OPENS_AT = new Date('2026-07-19T18:00:00+08:00').getTime();
const MAX_TIMEOUT_DELAY = 2_147_483_647;

document.addEventListener('DOMContentLoaded', () => {
  const discordJoin = document.querySelector('#discord-join');
  const discordJoinLabel = document.querySelector('#discord-join-label');
  const discordAvailability = document.querySelector('#discord-availability');

  const updateDiscordAvailability = () => {
    if (!discordJoin || !discordJoinLabel || !discordAvailability) return;

    const remainingTime = DISCORD_OPENS_AT - Date.now();

    if (remainingTime <= 0) {
      discordJoin.href = DISCORD_INVITE_URL;
      discordJoin.target = '_blank';
      discordJoin.rel = 'noopener noreferrer';
      discordJoin.removeAttribute('aria-disabled');
      discordJoin.removeAttribute('tabindex');
      discordJoin.classList.remove('is-locked');
      discordJoinLabel.textContent = '加入 Discord 共創團隊';
      discordAvailability.textContent = 'Discord 共創社群現已開放加入。';
      return;
    }

    window.setTimeout(
      updateDiscordAvailability,
      Math.min(remainingTime + 100, MAX_TIMEOUT_DELAY),
    );
  };

  updateDiscordAvailability();

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

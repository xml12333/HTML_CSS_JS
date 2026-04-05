const WordScroll = (() => {

  const defaults = {
    snap: true,
    animate: true,
    start: Math.floor(Math.random() * 100),
    end: Math.floor(900 + Math.random() * 100),
    startIndex: 0,
    debug: false };


  const init = (selector = ".word-scroll", options = {}) => {

    const root = document.querySelector(selector);
    if (!root) return;

    const config = { ...defaults, ...options };

    const list = root.querySelector("ul");
    const items = [...list.children];

    list.style.setProperty("--count", items.length);

    items.forEach((item, i) => {
      item.style.setProperty("--i", i);
    });

    root.dataset.snap = config.snap;
    root.dataset.animate = config.animate;
    root.dataset.debug = config.debug;

    root.style.setProperty("--start", config.start);
    root.style.setProperty("--hue", config.start);
    root.style.setProperty("--end", config.end);

    const index = Math.max(0, Math.min(config.startIndex, items.length - 1));
    const target = items[index];

    if (target) {
      requestAnimationFrame(() => {
        const offset = target.offsetTop - root.clientHeight / 2 + target.clientHeight / 2;
        root.scrollTop = offset;
      });
    }

  };

  return { init };

})();

WordScroll.init(".word-scroll", {
  snap: true,
  animate: true,
  start: 25,
  end: 100,
  startIndex: 4 });
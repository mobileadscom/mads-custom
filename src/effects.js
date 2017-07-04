/* global window, requestAnimationFrame */

const fadeIn = (el) => {
  const tmpEl = el;
  let opacity = 0;

  tmpEl.style.display = 'block';
  tmpEl.style.opacity = 0;
  tmpEl.style.filter = '';

  let last = +new Date();
  let anim;
  const tick = () => {
    opacity += (new Date() - last) / 400;
    tmpEl.style.opacity = opacity;
    tmpEl.style.filter = `alpha(opacity=${(100 * opacity) | 0})`; // eslint-disable-line no-bitwise

    last = +new Date();

    if (opacity < 1) {
      // eslint-disable-next-line no-unused-expressions
      anim = (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
    } else {
      (window.cancelAnimationFrame && cancelAnimationFrame(anim)) || clearTimeout(anim);
      tmpEl.style.display = 'block';
    }
  };

  tick();
};

const fadeOut = (el) => {
  const tmpEl = el;
  let opacity = 1;

  tmpEl.style.opacity = 1;
  tmpEl.style.filter = `alpha(opacity=${(100 * opacity) | 1})`; // eslint-disable-line no-bitwise

  let last = +new Date();
  let anim;
  const tick = () => {
    opacity -= (new Date() - last) / 400;
    tmpEl.style.opacity = opacity;
    tmpEl.style.filter = `alpha(opacity=${(100 * opacity) | 0})`; // eslint-disable-line no-bitwise

    last = +new Date();

    if (opacity > 0) {
      // eslint-disable-next-line no-unused-expressions
      anim = (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
    } else {
      (window.cancelAnimationFrame && cancelAnimationFrame(anim)) || clearTimeout(anim);
      tmpEl.style.display = 'none';
    }
  };

  tick();
};

const fadeOutIn = (elOut, elIn) => {
  fadeOut(elOut);
  fadeIn(elIn);
};

export default null;

export { fadeIn, fadeOut, fadeOutIn };

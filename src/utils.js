/* global window */

const getParameterByName = (name, url) => {
  let tmpUrl = url;
  let tmpName = name;
  if (!tmpUrl) tmpUrl = window.location.href;
  tmpName = tmpName.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${tmpName}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(tmpUrl);
  if (!results) return null;
  if (!results[2]) return '';
  try {
    return JSON.parse(decodeURIComponent(results[2].replace(/\+/g, ' ')));
  } catch (e) {
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
};

export default null;

export { getParameterByName };

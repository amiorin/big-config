window.decode = (s) => {
  return s
    .replaceAll("%25", "%")
    .replaceAll("%27", "'")
    .replaceAll("%22", "\"");
};

window.isFullyInViewport = (element) => {
  if (element) {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= viewportHeight &&
      rect.right <= viewportWidth
    );
  } else {
    return null;
  }
};

window.getNthNextElementSibling = (element, n) => {
  let current = element;

  for (let i = 0; i < n; i++) {
    if (current && current.nextElementSibling) {
      current = current.nextElementSibling;
    } else {
      return null;
    }
  }
  return current;
}

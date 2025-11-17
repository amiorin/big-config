window.decode = (s) => {
  return s
    .replaceAll("%25", "%")
    .replaceAll("%27", "'")
    .replaceAll("%22", "\"");
};

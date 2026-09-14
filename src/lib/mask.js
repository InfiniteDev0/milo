// An svg used as a mask, not an image: the file only supplies the shape, and
// the element's own background supplies the colour — so state can recolour it.
export const maskStyle = (url) => ({
  WebkitMaskImage: `url(${url})`,
  maskImage: `url(${url})`,
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
});

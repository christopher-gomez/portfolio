export function detectLineWrap(textContainer, onWrapped, onSingleLine) {
  if (!textContainer) return;

  const { lineHeight } = getComputedStyle(textContainer);
  const lineHeightParsed = parseInt(lineHeight.split("px")[0]);
  const amountOfLinesTilAdjust = 2;

  if (
    textContainer.offsetHeight >= lineHeightParsed * amountOfLinesTilAdjust
  ) {
    if (onWrapped) onWrapped();
  } else {
    if (onSingleLine) onSingleLine();
  }
}

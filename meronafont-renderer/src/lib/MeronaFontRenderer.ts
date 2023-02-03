import { Font, FontCharacter, FontCharacterVariation, FontMetadata } from "./MeronaFontLoader";

export interface PreloadedFont {
  metadata: FontMetadata,
  image: ImageBitmap
}

export async function preloadFont(font: Font): Promise<PreloadedFont> {
  return ({
    metadata: font.metadata,
    image: await createImageBitmap(font.image)
  });
}

export function renderText(ctx: CanvasRenderingContext2D, text: string, preloadedFont: PreloadedFont, x = 0, y = 0) {
  const fontMetadata = preloadedFont.metadata;
  const fontImage = preloadedFont.image;

  let chars = text.split('');
  let xShift = 0;
  const charsTranformed = chars.map(char => {
    let charVariations = fontMetadata[char as FontCharacter];
    if (charVariations.length === 0) return null;
    let randomIndex = Math.floor(Math.random() * charVariations.length);
    return charVariations[randomIndex];
  }).filter(val => val !== null) as FontCharacterVariation[];
  const totalTextWidth = charsTranformed.map(char => char.width).reduce((prev, current) => current + prev, 0);
  const totalTextHeight = Math.max(...charsTranformed.map(char => char.height + char.margin.top));
  charsTranformed.forEach(charObj => {
    const {x: charX, y: charY, width, height, margin: {top: mTop, right: mRight, bottom: mBottom, left: mLeft}} = charObj;

    const calculatedWidth = width + mLeft + mRight;
    const calculatedHeight = height + mTop + mBottom;

    const sx = charX - mLeft;
    const sy = charY - mTop;

    let dx = x + xShift - mLeft;
    switch(ctx.textAlign) {
      case 'left':
      case 'start':
        break;
      case 'right':
      case 'end':
        dx -= totalTextWidth;
        break;
      case 'center':
        dx -= Math.round(totalTextWidth / 2);
        break;
    }
    let dy = y;
    switch(ctx.textBaseline) {
      case 'alphabetic':
      case 'bottom':
        dy += -height - mTop;
        break;
      case 'middle':
        dy += Math.round(totalTextHeight / 2) - height - mTop;
        break;
      case 'top':
      default:
        dy += totalTextHeight - height - mTop;
        break;
    }

    ctx.drawImage(fontImage, sx, sy, calculatedWidth, calculatedHeight, dx, dy, calculatedWidth, calculatedHeight);

    xShift += width;
  });
}
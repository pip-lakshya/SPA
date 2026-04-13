const sharp = require("sharp")

/**
 * Improve OCR on phone photos: normalize size, greyscale, mild sharpen.
 * @param {Buffer} input
 * @returns {Promise<Buffer>}
 */
const preprocessForOcr = async (input) => {
  const meta = await sharp(input).metadata()
  const width = meta.width || 0

  // Upscale small images so Tesseract sees larger glyphs (common on mobile uploads).
  const minWidth = 1600
  let pipeline = sharp(input).rotate() // respect EXIF orientation

  if (width > 0 && width < minWidth) {
    pipeline = pipeline.resize({
      width: minWidth,
      fit: "inside",
      withoutEnlargement: false
    })
  }

  return pipeline
    .greyscale()
    .normalize()
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 3 })
    .png()
    .toBuffer()
}

module.exports = { preprocessForOcr }

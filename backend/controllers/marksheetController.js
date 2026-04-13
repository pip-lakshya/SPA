const multer = require("multer")
const { createWorker, PSM, OEM } = require("tesseract.js")
const { normalizeOcrText, parseMarksheetText } = require("../utils/marksheetParser")
const { preprocessForOcr } = require("../utils/preprocessMarksheetImage")

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"))
    }
    cb(null, true)
  }
})

const scoreParsed = (parsed) => {
  if (!parsed?.subjects?.length) {
    return (parsed?.sgpa != null ? 5 : 0) - 1
  }

  const nameChars = parsed.subjects.reduce((sum, s) => sum + (s.name?.length || 0), 0)

  return (
    parsed.subjects.length * 220 +
    nameChars +
    (parsed.sgpa != null ? 40 : 0)
  )
}

/**
 * Try several page layouts; tabular marksheets differ a lot by scan angle and template.
 */
const runOcrBest = async (buffer) => {
  const worker = await createWorker("eng", OEM.DEFAULT, {
    logger: () => {}
  })

  let bestText = ""
  let bestParsed = null
  let bestScore = -1

  try {
    await worker.setParameters({
      preserve_interword_spaces: "1",
      user_defined_dpi: "300"
    })

    const modes = [PSM.SINGLE_BLOCK, PSM.SINGLE_COLUMN, PSM.AUTO]

    for (const psm of modes) {
      await worker.setParameters({ tessedit_pageseg_mode: psm })
      const {
        data: { text }
      } = await worker.recognize(buffer)
      const cleaned = normalizeOcrText(text || "")
      const parsed = parseMarksheetText(cleaned)
      const score = scoreParsed(parsed)

      if (score > bestScore) {
        bestScore = score
        bestText = cleaned
        bestParsed = parsed
      }
    }
  } finally {
    await worker.terminate()
  }

  return { text: bestText, parsed: bestParsed }
}

const uploadMarksheet = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "No image file provided (use field name: marksheet)" })
    }

    let imageBuffer = req.file.buffer
    try {
      imageBuffer = await preprocessForOcr(req.file.buffer)
    } catch {
      imageBuffer = req.file.buffer
    }

    let rawText = ""
    let parsed = null

    try {
      const result = await runOcrBest(imageBuffer)
      rawText = result.text
      parsed = result.parsed
    } catch (err) {
      return res.status(422).json({
        message: "OCR failed — please enter marks manually",
        ocrError: true,
        semester: "Sem 1",
        sgpa: null,
        subjects: []
      })
    }

    const cleaned = normalizeOcrText(rawText)
    if (!cleaned || cleaned.length < 3) {
      return res.json({
        message: "Could not read enough text from the image — try a straighter, well-lit photo or enter manually",
        lowConfidence: true,
        semester: "Sem 1",
        sgpa: null,
        subjects: []
      })
    }

    if (!parsed) {
      parsed = parseMarksheetText(cleaned)
    }

    const lowConfidence = !parsed.subjects.length

    return res.json({
      message: lowConfidence
        ? "No subject rows met quality checks — try a clearer image or enter manually"
        : "Parsed marksheet",
      ...(lowConfidence ? { lowConfidence: true } : {}),
      semester: parsed.semester,
      sgpa: parsed.sgpa,
      subjects: parsed.subjects
    })
  } catch (err) {
    return res.status(500).json({ message: "Failed to process marksheet" })
  }
}

module.exports = {
  upload,
  uploadMarksheet
}

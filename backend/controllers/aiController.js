const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const NVIDIA_MODELS_URL = "https://integrate.api.nvidia.com/v1/models"

/**
 * Validate an NVIDIA API key
 */
const validateApiKey = async (req, res) => {
  try {
    const apiKey = (
      req.body?.apiKey ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "") ||
      ""
    ).trim()

    if (!apiKey) {
      return res.status(400).json({ valid: false, message: "API key is required" })
    }

    if (!apiKey.startsWith("nvapi-")) {
      return res.status(400).json({
        valid: false,
        message: 'Invalid key format. NVIDIA NIM API keys must start with "nvapi-".'
      })
    }

    const response = await fetch(NVIDIA_MODELS_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json"
      }
    })

    if (response.status === 401 || response.status === 403) {
      return res.status(401).json({
        valid: false,
        message: "NVIDIA API key rejected (Unauthorized). Please check your key on build.nvidia.com."
      })
    }

    if (!response.ok) {
      const errText = await response.text()
      return res.status(response.status).json({
        valid: false,
        message: `NVIDIA API returned error (${response.status}): ${errText.slice(0, 120)}`
      })
    }

    return res.json({
      valid: true,
      message: "API key is valid and successfully verified with NVIDIA NIM!"
    })
  } catch (error) {
    console.error("Validation error:", error)
    return res.status(500).json({
      valid: false,
      message: "Failed to connect to NVIDIA servers. Please check your network connection."
    })
  }
}

/**
 * Chat proxy to NVIDIA NIM
 */
const chat = async (req, res) => {
  try {
    const apiKey = (
      req.body?.apiKey ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "") ||
      ""
    ).trim()
    const {
      messages,
      model = 'meta/llama-3.2-11b-vision-instruct',
      temperature = 0.6,
      max_tokens = 1500
    } = req.body

    if (!apiKey) {
      return res.status(400).json({ message: "NVIDIA API key is required" })
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Messages array is required" })
    }

    const payload = {
      model: model || "nvidia/llama-3.1-nemotron-70b-instruct",
      messages,
      temperature: Number(temperature) || 0.6,
      max_tokens: Number(max_tokens) || 1500,
      top_p: 0.95
    }

    const response = await fetch(NVIDIA_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("NVIDIA NIM API Error:", data)
      return res.status(response.status).json({
        message: data?.error?.message || data?.message || "NVIDIA NIM API returned an error",
        details: data
      })
    }

    return res.json(data)
  } catch (error) {
    console.error("Chat error:", error)
    return res.status(500).json({
      message: error?.message || "Failed to communicate with NVIDIA NIM API"
    })
  }
}

module.exports = {
  validateApiKey,
  chat
}

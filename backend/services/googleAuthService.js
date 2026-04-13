const getOAuth2Client = () => {
  try {
    // Lazy-load so the server can boot even if Google auth isn't configured yet.
    const { OAuth2Client } = require("google-auth-library")
    return OAuth2Client
  } catch (e) {
    const err = new Error(
      "Google auth dependency missing. Run `npm install google-auth-library` in backend/"
    )
    err.code = "GOOGLE_DEPENDENCY_MISSING"
    err.cause = e
    throw err
  }
}

const getClient = () => {
  const OAuth2Client = getOAuth2Client()
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
}

/**
 * @param {string} credential - Google ID token (JWT) from the client
 * @returns {Promise<import("google-auth-library").TokenPayload>}
 */
const verifyGoogleCredential = async (credential) => {
  const audience = process.env.GOOGLE_CLIENT_ID
  if (!audience) {
    const err = new Error("GOOGLE_CLIENT_ID is not configured")
    err.code = "GOOGLE_NOT_CONFIGURED"
    throw err
  }

  const client = getClient()
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience
  })

  const payload = ticket.getPayload()
  if (!payload?.email) {
    const err = new Error("Invalid token payload")
    err.code = "INVALID_GOOGLE_TOKEN"
    throw err
  }

  return payload
}

module.exports = {
  verifyGoogleCredential
}

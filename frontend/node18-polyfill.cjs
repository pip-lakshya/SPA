const crypto = require("crypto")

if (!crypto.hash) {
  crypto.hash = (algorithm, data, outputEncoding) => {
    return crypto.createHash(algorithm).update(data).digest(outputEncoding)
  }
}

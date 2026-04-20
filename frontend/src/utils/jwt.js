const normalizeToken = (token) => {
  if (typeof token !== 'string') {
    return null
  }

  const trimmed = token.trim()
  if (!trimmed) {
    return null
  }

  return trimmed.startsWith('Bearer ') ? trimmed.slice(7).trim() : trimmed
}

export const normalizeExpiryMs = (expValue) => {
  if (expValue === null || expValue === undefined) {
    return null
  }

  const exp = Number(expValue)
  if (!Number.isFinite(exp)) {
    return null
  }

  return exp < 1e12 ? exp * 1000 : exp
}

export const decodeJwtPayload = (token) => {
  const normalized = normalizeToken(token)
  if (!normalized) {
    return null
  }

  const parts = normalized.split('.')
  if (parts.length < 2) {
    return null
  }

  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '==='.slice((base64.length + 3) % 4)

  try {
    return JSON.parse(atob(padded))
  } catch (error) {
    return null
  }
}

export const getTokenExpiryMs = (token) => {
  const payload = decodeJwtPayload(token)
  return normalizeExpiryMs(payload?.exp)
}

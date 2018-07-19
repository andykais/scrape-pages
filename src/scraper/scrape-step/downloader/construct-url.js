import format from 'string-template'

const getTemplateVars = (config, { input }, { value, incrementIndex }) => {
  const { initialIndex, increment } = config.download
  const index = initialIndex + incrementIndex * increment
  const templateVals = { ...input, value, index }
  return templateVals
}

const constructUrl = (config, templateVals) => {
  if (!config.download) return new URL()

  const populatedUriString = format(config.download.urlTemplate, templateVals)
  try {
    return new URL(populatedUriString)
  } catch (e) {
    throw new Error(`cannot create url from "${populatedUriString}"`)
  }
}

const constructHeaders = (config, templateVals) => {
  const headers = {}
  for (const [key, val] of Object.entries(config.download.headerTemplates)) {
    headers[key] = format(val, templateVals)
  }
  return headers
}

const constructCookieString = (config, templateVals) => {
  let cookies = ''
  for (const [key, val] of Object.entries(config.download.cookieTemplates)) {
    const populatedVal = format(val, templateVals)
    cookies += `${key}=${populatedVal};`
  }
  return cookies
}

const constructFetch = (config, runParams, downloadParams) => {
  const templateVals = getTemplateVars(config, runParams, downloadParams)
  const url = constructUrl(config, templateVals)
  const headers = constructHeaders(config, templateVals)
  const cookies = constructCookieString(config, templateVals)
  if (cookies) {
    headers['cookie'] = headers['cookie']
      ? headers['cookie'] + cookies
      : cookies
  }
  return {
    url,
    fetchOptions: {
      headers,
      method: config.download.method
    }
  }
}

export { constructFetch }

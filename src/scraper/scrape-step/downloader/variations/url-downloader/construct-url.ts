import { URL } from 'url'
import { compileTemplate } from '../../../../../util/handlebars'
// type imports
import { ScrapeConfig } from '../../../../../configuration/site-traversal/types'
import { RunOptions } from '../../../../../configuration/run-options/types'
import { Dependencies } from '../../../../types'
import { DownloadParams } from '../../'

const getTemplateVars = (
  config: ScrapeConfig,
  { input }: RunOptions,
  { value, incrementIndex }: DownloadParams
) => {
  const index = incrementIndex
  const templateVals = { ...input, value, index }
  return templateVals
}
type TemplateVars = ReturnType<typeof getTemplateVars>

// TODO memoize compileTemplates
const constructUrl = (config: ScrapeConfig, templateVals: TemplateVars) => {
  const populatedUriString = compileTemplate(config.download.urlTemplate)(
    templateVals
  )
  try {
    return new URL(populatedUriString)
  } catch (e) {
    throw new Error(`cannot create url from "${populatedUriString}"`)
  }
}

const constructHeaders = (config: ScrapeConfig, templateVals: TemplateVars) => {
  const headers: { [HeaderName: string]: string } = {}
  for (const [key, val] of Object.entries(config.download.headerTemplates)) {
    headers[key] = compileTemplate(val)(templateVals)
  }
  return headers
}

const constructCookieString = (
  config: ScrapeConfig,
  templateVals: TemplateVars
) => {
  let cookies = ''
  for (const [key, val] of Object.entries(config.download.cookieTemplates)) {
    const populatedVal = compileTemplate(val)(templateVals)
    cookies += `${key}=${populatedVal};`
  }
  return cookies
}

const constructFetch = (
  config: ScrapeConfig,
  runParams: RunOptions,
  downloadParams: DownloadParams
) => {
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
export type ConstructedFetch = ReturnType<typeof constructFetch>

export { constructFetch }

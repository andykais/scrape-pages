import { resolve, basename } from 'path'
import sanitize from 'sanitize-filename'
import format from 'string-template'
import {
  downloadToFileAndMemory,
  downloadToMemoryOnly,
  downloadToFileOnly,
  readFromFile
} from '../fetchers'

const sanitizeUrl = url => sanitize(url.toString(), { replacement: '_' })

const populateTemplate = (config, { input }, { value, incrementIndex }) => {
  const { initialIndex, increment } = config.download
  const index = initialIndex + incrementIndex * increment
  const templateVals = { ...input, value, index }
  const populatedUriString = format(config.download.template, templateVals)
  try {
    return new URL(populatedUriString)
  } catch (e) {
    throw new Error(`cannot create url from "${populatedUriString}"`)
  }
}

export default config => (runParams, dependencies) => {
  const { store, queue } = dependencies

  const shouldDownloadToMemory = Boolean(
    config.scrapeEach.length || config.parse
  )
  const shouldDownloadToFile = runParams.cache
  const completedDownloadFetcher =
    shouldDownloadToMemory && shouldDownloadToFile
      ? readFromFile
      : shouldDownloadToMemory
        ? downloadToMemoryOnly
        : () => {}

  const incompleteDownloadFetcher =
    shouldDownloadToMemory && shouldDownloadToFile
      ? downloadToFileAndMemory
      : shouldDownloadToMemory
        ? downloadToMemoryOnly
        : downloadToFileOnly

  return async url => {
    const { downloadValue, filename } = await incompleteDownloadFetcher(
      runParams,
      dependencies,
      url
    )
    return { downloadValue, filename }
  }
}

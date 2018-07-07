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

export default config => runParams => {
  const { store, options, queue } = runParams

  const shouldDownloadToMemory = Boolean(
    config.scrapeEach.length || config.parse
  )
  const shouldDownloadToFile = options.cache
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

  return async downloadParams => {
    const { incrementIndex, loopIndex, value } = downloadParams
    const url = populateTemplate(config, runParams, downloadParams)
    const urlString = url.toString()

    const completedDownload = await store.getCachedDownload(urlString)

    const downloadIntoMemory = Boolean(config.scrapeEach.length || config.parse)
    const downloadIntoFile = options.cache

    if (completedDownload && completedDownload.complete) {
      const { downloadValue } = await completedDownloadFetcher(runParams, url)
      return { downloadValue, downloadId: completedDownload.id }
    } else {
      const downloadId =
        completedDownload && completedDownload.id
          ? completedDownload.id
          : await store.insertQueuedDownload({
              scraper: config.name,
              loopIndex: 0,
              incrementIndex,
              url: url.toString()
            })

      const { downloadValue, filename } = await incompleteDownloadFetcher(
        runParams,
        url
      )
      await store.markDownloadComplete({ downloadId, filename })
      return { downloadValue, downloadId }
    }
  }
}

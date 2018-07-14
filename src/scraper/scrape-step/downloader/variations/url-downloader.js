import { resolve, basename } from 'path'
import sanitize from 'sanitize-filename'
import format from 'string-template'
import { constructUrl } from '../construct-url'
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

  // const completedDownloadFetcher =
  // shouldDownloadToMemory && shouldDownloadToFile
  // ? readFromFile
  // : shouldDownloadToMemory
  // ? downloadToMemoryOnly
  // : () => {}

  const fetcher =
    shouldDownloadToMemory && shouldDownloadToFile
      ? downloadToFileAndMemory
      : shouldDownloadToMemory
        ? downloadToMemoryOnly
        : downloadToFileOnly

  return async ({ value, parentId, loopIndex, incrementIndex }) => {
    // console.log({ incrementIndex })
    const url = constructUrl(config, runParams, {
      value,
      incrementIndex
    })
    const downloadId = await store.insertQueuedDownload({
      scraper: config.name,
      parentId,
      loopIndex,
      incrementIndex,
      url: url.toString()
    })
    const { downloadValue, filename } = await fetcher(
      runParams,
      dependencies,
      url
    )
    return { downloadValue, downloadId, filename }
  }
}

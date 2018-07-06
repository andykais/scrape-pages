import format from 'string-template'
import {
  downloadToFileAndMemory,
  downloadToFileOnly,
  downloadToMemoryOnly
} from '../fetchers'

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

const chooseFetcher = (config, options) => {
  if (config.scrapeEach.length || config.parse) return downloadToFileAndMemory
  else return downloadToFileOnly
}
const saveUrl = (config, { options, logger, queue }, url) => {
  const { folder } = options
  const fetcher = chooseFetcher(config, options)

  return queue.add(() => fetcher(url, folder, logger))
}

export default config => {
  return runParams => async downloadParams => {
    const { store } = runParams
    const { incrementIndex, loopIndex, value } = downloadParams
    const url = populateTemplate(config, runParams, downloadParams)
    const downloadId = await store.insertQueuedDownload(
      config.name,
      0,
      incrementIndex,
      url
    )
    const downloadValue = await saveUrl(config, runParams, url)
    await store.markDownloadComplete(downloadId)
    return { downloadValue, downloadId }
  }
}

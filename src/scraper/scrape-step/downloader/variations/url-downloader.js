import format from 'string-template'
import {
  downloadToFileAndMemory,
  downloadToFileOnly,
  downloadToMemoryOnly
} from '../fetchers'

const populateTemplate = ({ config }, { input }, { value, incrementIndex }) => {
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

const saveUrl = ({ config, logger }, { options }, url) => {
  // if (config.name === 'level_0_index_0') logger.warn(url)
  // logger.debug(config.name, url)
  const { folder } = options
  if (config.scrapeEach.length || config.parse) {
    return downloadToFileAndMemory(url, folder, logger)
  } else {
    return downloadToFileOnly(url, folder, logger)
  }
}

export default setupParams => {
  const { config, store } = setupParams

  return runParams => async downloadParams => {
    const { incrementIndex, loopIndex, value } = downloadParams
    const url = populateTemplate(setupParams, runParams, downloadParams)
    const downloadId = await store.insertQueuedDownload(
      config.name,
      0,
      incrementIndex,
      url
    )
    const downloadValue = await saveUrl(setupParams, runParams, url)
    await store.markDownloadComplete(downloadId)
    return { downloadValue, downloadId }
  }
}

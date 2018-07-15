import urlDownloader from './variations/url-downloader'
import identityDownloader from './variations/identity-downloader'

export const incrementShouldKeepGoing = config => (
  parsedValues,
  incrementIndex
) => {
  if (config.download && config.download.incrementUntil) {
    const { increment, initialIndex, incrementUntil } = config.download
    return incrementUntil > incrementIndex * increment + initialIndex
  } else {
    return parsedValues.length
  }
}

export default config => {
  if (config.download) return urlDownloader(config)
  else return identityDownloader(config)
}

import urlDownloader from './variations/url-downloader'
import identityDownloader from './variations/identity-downloader'

export const incrementShouldKeepGoing = config => (
  { parsedValues },
  incrementIndex
) => {
  const { increment, initialIndex, incrementUntil } = config.download
  if (increment && incrementUntil) {
    return incrementUntil > incrementIndex * increment + initialIndex
  } else if (increment) {
    return parsedValues.length
  } else {
    return false
  }
}

export default config => {
  if (config.download) return urlDownloader(config)
  else return identityDownloader(config)
}

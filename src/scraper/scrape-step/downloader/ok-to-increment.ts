import {
  DownloadConfig,
  ScrapeConfig
} from '../../../configuration/site-traversal/types'

const okToIncrement = ({ incrementUntil }: ScrapeConfig): Boolean =>
  !!incrementUntil

export { okToIncrement }

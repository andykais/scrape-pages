import { DownloadConfig, ScrapeConfig } from '../../../configuration/site-traversal/types'

const okToIncrement = ({ download }: ScrapeConfig): Boolean =>
  Boolean((download || { incrementUntil: null }).incrementUntil)

export { okToIncrement }

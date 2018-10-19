import { DownloadConfig, ScrapeConfig } from '../../../configuration/types'

const okToIncrement = ({ download }: ScrapeConfig): Boolean =>
  Boolean((download || { incrementUntil: null }).incrementUntil)

export { okToIncrement }

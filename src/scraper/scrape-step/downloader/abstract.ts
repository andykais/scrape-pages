// type imports
import { ScrapeSettings } from '../../../settings'
import { ScraperName, DownloadConfig } from '../../../settings/config/types'
import { Tools } from '../../../tools'

type ParseTreeId = number
type DownloadId = number
export type DownloadParams = {
  parentId?: ParseTreeId
  downloadId: DownloadId
  incrementIndex: number
  value: string
}
interface RetrieveValue {
  cacheId?: number
  downloadValue: string
  filename?: string
  mimeType?: string
  byteLength?: number
}
/**
 * base abstract class which other downloaders derive from
 */
export abstract class AbstractDownloader<DownloadData> {
  public type: DownloadConfig['protocol'] | 'identity'
  public postProcess: (value: string) => string
  protected scraperName: ScraperName
  protected downloadConfig: DownloadConfig | undefined
  protected config: ScrapeSettings['config']
  protected options: ScrapeSettings['options']
  protected params: ScrapeSettings['params']
  protected tools: Tools
  protected scraperLogger: ReturnType<Tools['logger']['scraper']>

  public constructor(
    downloadConfig: DownloadConfig | undefined,
    settings: ScrapeSettings,
    tools: Tools
  ) {
    const scraperName = settings.config.name
    const scraperLogger = tools.logger.scraper(scraperName)!
    Object.assign(this, { scraperName, downloadConfig, ...settings, tools, scraperLogger })
    this.postProcess = this.getPostProcessing(downloadConfig)
  }
  public run = async (downloadParams: DownloadParams): Promise<RetrieveValue> => {
    const { store, emitter } = this.tools

    const downloadData = this.constructDownload(downloadParams)

    if (this.options.cache) {
      const cachedDownload = store.qs.selectMatchingCachedDownload(this.scraperName, downloadData)
      if (cachedDownload) {
        this.scraperLogger.info(
          `scraper '${this.scraperName}' grabbed download from cache id ${cachedDownload.id}`
        )
        return cachedDownload
      }
    }
    emitter.scraper(this.scraperName).emit('queued', downloadParams.downloadId)
    console.log('queued')

    const { downloadValue, filename, mimeType, byteLength } = await this.retrieve(
      downloadParams.downloadId,
      downloadData
    )
    const processedDownloadValue = this.postProcess(downloadValue)

    // ignore this step for identity downloader
    const cacheId = this.downloadConfig
      ? store.qs.insertDownloadCache({
          scraper: this.scraperName,
          downloadData,
          protocol: this.type,
          downloadValue: processedDownloadValue!,
          filename,
          mimeType,
          byteLength,
          failed: false // TODO make this flag useful
        })
      : undefined

    this.scraperLogger.info(
      `scraper '${this.scraperName}' downloaded ${downloadParams.downloadId}${
        cacheId !== undefined ? ` and saved cache to ${cacheId}` : ''
      }`
    )

    return {
      cacheId,
      downloadValue: processedDownloadValue,
      filename,
      mimeType,
      byteLength
    }
  }

  private getRegexCleanup = ({ regexCleanup }: DownloadConfig) => {
    if (regexCleanup) {
      const regex = new RegExp(regexCleanup.selector, regexCleanup.flags)
      return (value: string) => value.replace(regex, regexCleanup.replacer)
    } else {
      return (value: string) => value
    }
  }
  private valueNeedsPostProcessing = ({ regexCleanup }: DownloadConfig) => regexCleanup
  private getPostProcessing = (downloadConfig?: DownloadConfig) => {
    if (downloadConfig) {
      const regexReplace = this.getRegexCleanup(downloadConfig)
      if (this.valueNeedsPostProcessing(downloadConfig)) return regexReplace
    }
    return (values: string) => values
  }

  // implement these methods
  public abstract constructDownload(downloadParams: DownloadParams): DownloadData
  public abstract retrieve(
    downloadId: number,
    downloadParams: DownloadData
  ): RetrieveValue | Promise<RetrieveValue>
}

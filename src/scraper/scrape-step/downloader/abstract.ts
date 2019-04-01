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
}
interface RunValue extends Exclude<RetrieveValue, 'mimeType'> {}
/**
 * base abstract class which other downloaders derive from
 */
export abstract class AbstractDownloader<DownloadData> {
  public type: DownloadConfig['protocol'] | 'identity'
  protected scraperName: ScraperName
  protected downloadConfig: DownloadConfig | undefined
  protected config: ScrapeSettings['config']
  protected options: ScrapeSettings['options']
  protected params: ScrapeSettings['params']
  protected tools: Tools
  protected scraperLogger: ReturnType<Tools['logger']['scraper']>

  public constructor(
    scraperName: ScraperName,
    downloadConfig: DownloadConfig | undefined,
    settings: ScrapeSettings,
    tools: Tools
  ) {
    const scraperLogger = tools.logger.scraper(scraperName)!
    Object.assign(this, { scraperName, downloadConfig, ...settings, tools, scraperLogger })
  }
  public run = async (downloadParams: DownloadParams): Promise<RunValue> => {
    const { store, emitter } = this.tools

    const downloadData = this.constructDownload(downloadParams)

    let cachedDownload: ReturnType<typeof store.qs.selectMatchingCachedDownload>
    if (this.options.cache) {
      cachedDownload = store.qs.selectMatchingCachedDownload(this.scraperName, downloadData)
      if (cachedDownload) return cachedDownload
    }
    emitter.scraper(this.scraperName).emit.queued(downloadParams.downloadId)

    const { downloadValue, filename, mimeType } = await this.retrieve(
      downloadParams.downloadId,
      downloadData
    )

    // ignore this step for identity downloader
    const cacheId = this.downloadConfig
      ? store.qs.insertDownloadCache({
          scraper: this.scraperName,
          downloadData,
          protocol: this.type,
          downloadValue: downloadValue!,
          filename,
          mimeType,
          failed: false
        })
      : undefined

    if (cachedDownload) {
      this.scraperLogger.info(
        `scraper '${this.scraperName}' grabbed download from cache id ${cachedDownload.id}`
      )
    } else {
      this.scraperLogger.info(
        `scraper '${this.scraperName}' downloaded ${downloadParams.downloadId}${
          cacheId !== undefined ? ` and saved cache to ${cacheId}` : ''
        }`
      )
    }

    return {
      cacheId,
      downloadValue,
      filename
    }
  }
  // implement these methods
  public abstract constructDownload(downloadParams: DownloadParams): DownloadData
  public abstract retrieve(
    downloadId: number,
    downloadParams: DownloadData
  ): RetrieveValue | Promise<RetrieveValue>
}

import {
  ScraperName,
  DownloadConfig,
  ScrapeConfig
} from '../../../settings/config/types'
import { Options } from '../../../settings/options/types'
import { Tools } from '../../../tools'

export type DownloadParams = {
  parentId?: number
  incrementIndex: number
  value?: string
}
type RetrieveValue = { downloadValue?: string; filename?: string }
/**
 * base abstract class which other downloaders derive from
 */
export abstract class AbstractDownloader<DownloadData> {
  protected scraperName: ScraperName
  protected config: DownloadConfig | undefined
  protected options: Options
  protected tools: Tools

  public constructor(
    scraperName: ScraperName,
    config: DownloadConfig | undefined,
    options: Options,
    tools: Tools
  ) {
    Object.assign(this, { scraperName, config, options, tools })
  }
  public run = async (downloadParams: DownloadParams) => {
    const downloadData = this.constructDownload(downloadParams)
    const downloadId = this.tools.store.qs.insertQueuedDownload(
      this.scraperName,
      downloadParams,
      downloadData
    )
    this.tools.emitter.scraper(this.scraperName).emit.queued(downloadId)
    const { downloadValue, filename } = await this.retrieve(
      downloadId,
      downloadData
    )

    return {
      downloadId,
      // downloadValue conditional is for identity parser,
      // essentially, if there was no data that went into a download, then nothing important was recieved
      downloadValue: downloadData ? downloadValue : downloadParams.value,
      filename
    }
  }
  // implement these methods
  protected abstract constructDownload(
    downloadParams: DownloadParams
  ): DownloadData
  protected abstract retrieve(
    downloadId: number,
    downloadParams: DownloadData
  ): RetrieveValue | Promise<RetrieveValue>
}

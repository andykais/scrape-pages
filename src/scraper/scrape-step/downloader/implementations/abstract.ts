import { ScrapeConfig } from '../../../../configuration/site-traversal/types'
import { RunOptions } from '../../../../configuration/run-options/types'
import { Dependencies } from '../../../types'

export type DownloadParams = {
  parentId?: number
  scrapeNextIndex: number
  incrementIndex: number
  value: string
}
type RetrieveValue = { downloadValue?: string; filename?: string }
/**
 * base abstract class which other downloaders derive from
 */
export abstract class AbstractDownloader<DownloadData> {
  protected config: ScrapeConfig
  protected runParams: RunOptions
  protected deps: Dependencies
  protected insertDownloadData = true

  public constructor(
    config: ScrapeConfig,
    runParams: RunOptions,
    deps: Dependencies
  ) {
    Object.assign(this, { config, runParams, deps })
  }
  public run = async (downloadParams: DownloadParams) => {
    const downloadData = this.constructDownload(downloadParams)
    const downloadId = this.deps.store.qs.insertQueuedDownload(
      this.config.name,
      downloadParams,
      this.insertDownloadData ? downloadData : undefined
    )
    // this.logger.queuedDownload(downloadId)
    const { downloadValue, filename } = await this.retrieve(
      downloadId,
      downloadData
    )

    return { downloadId, downloadValue, filename }
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

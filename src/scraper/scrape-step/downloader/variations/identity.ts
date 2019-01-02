import { AbstractDownloader, DownloadParams } from './abstract'

type DownloadData = { value: string }
class IdentityDownloader extends AbstractDownloader {
  constructDownload = ({ value }: DownloadParams): DownloadData => ({ value })

  retrieve = (
    downloadId: number,
    downloadParams: DownloadData
  ): { downloadValue: string; filename?: string } => ({
    downloadValue: downloadParams.value,
    filename: null
  })
}

import { AbstractDownloader, DownloadParams } from '../abstract'

type DownloadData = string
/**
 * identitiy downloader, does nothing and passes value through itself
 */
export class Downloader extends AbstractDownloader<DownloadData> {
  protected insertDownloadData = false

  protected constructDownload = ({ value }: DownloadParams): DownloadData =>
    value

  protected retrieve = (
    downloadId: number,
    value: DownloadData
  ): { downloadValue: string; filename?: string } => ({
    downloadValue: value,
    filename: null
  })
}

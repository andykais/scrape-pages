import { AbstractDownloader, DownloadParams } from '../abstract'

type DownloadData = void
/**
 * identitiy downloader, does nothing and passes value through itself
 */
export class Downloader extends AbstractDownloader<DownloadData> {
  protected insertDownloadData = false

  protected constructDownload = ({ value }: DownloadParams): DownloadData => {}

  protected retrieve = (downloadId: number, downloadData: DownloadData) => ({
    downloadValue: undefined,
    filename: undefined
  })
}

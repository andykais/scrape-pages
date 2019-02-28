import { AbstractDownloader, DownloadParams } from '../abstract'

type DownloadData = string | undefined
/**
 * identitiy downloader, does nothing and passes value through itself
 */
export class Downloader extends AbstractDownloader<DownloadData> {
  protected insertDownloadData = false

  protected constructDownload = ({ value }: DownloadParams): DownloadData => value

  protected retrieve = (downloadId: number, parentValue: DownloadData) => ({
    downloadValue: parentValue,
    filename: undefined
  })
}

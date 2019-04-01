import { AbstractDownloader, DownloadParams } from '../abstract'

type DownloadData = string
/**
 * identitiy downloader, does nothing and passes value through itself
 */
export class Downloader extends AbstractDownloader<DownloadData> {
  public type = 'identity' as 'identity'

  public constructDownload = ({ value }: DownloadParams): DownloadData => value

  public retrieve = (downloadId: number, parentValue: DownloadData) => ({
    downloadValue: parentValue,
    filename: undefined,
    byteLength: undefined
  })
}

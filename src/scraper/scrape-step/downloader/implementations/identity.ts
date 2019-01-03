import { AbstractDownloader } from '../abstract'

type DownloadData = void
/**
 * identitiy downloader, does nothing and passes value through itself
 */
export class Downloader extends AbstractDownloader<DownloadData> {
  protected insertDownloadData = false

  protected constructDownload = (): DownloadData => {}

  protected retrieve = () => ({
    downloadValue: undefined,
    filename: undefined
  })
}

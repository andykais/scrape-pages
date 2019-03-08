import fetch from 'node-fetch'
import { createWriteStream } from 'fs'
import * as path from 'path'
import { mkdirp, sanitizeFilename } from '../../../../util/fs'
import { FMap } from '../../../../util/map'
import { ResponseError } from '../../../../util/error'

import { AbstractDownloader, DownloadParams } from '../abstract'
import { compileTemplate } from '../../../../util/handlebars'
// type imports
import { URL } from 'url'
import * as Fetch from 'node-fetch'
import { ScrapeSettings } from '../../../../settings'
import { ScraperName, DownloadConfig } from '../../../../settings/config/types'
import { Tools } from '../../../../tools'

type Headers = { [header: string]: string }
type DownloadData = [string, { headers: Headers; method: DownloadConfig['method'] }]
type FetchFunction = (
  downloadId: number,
  DownloadData: DownloadData
) => Promise<{
  downloadValue: string
  filename?: string
}>

/**
 * downloader pertaining to all http/https requests
 */
export class Downloader extends AbstractDownloader<DownloadData> {
  public type = 'http' as 'http'
  protected downloadConfig: DownloadConfig
  private urlTemplate: ReturnType<typeof compileTemplate>
  private headerTemplates: FMap<string, ReturnType<typeof compileTemplate>>
  private fetcher: FetchFunction
  private scraperEmitter: ReturnType<Tools['emitter']['scraper']>

  public constructor(
    scraperName: ScraperName,
    downloadConfig: DownloadConfig,
    settings: ScrapeSettings,
    tools: Tools
  ) {
    super(scraperName, downloadConfig, settings, tools)
    this.downloadConfig = downloadConfig // must be set on again on child classes https://github.com/babel/babel/issues/9439

    const { read, write, urlTemplate, headerTemplates } = downloadConfig
    // set templates
    this.urlTemplate = compileTemplate(urlTemplate)
    this.headerTemplates = new FMap()
    Object.entries(headerTemplates).forEach(([key, templateStr]) =>
      this.headerTemplates.set(key, compileTemplate(templateStr))
    )

    this.scraperEmitter = this.tools.emitter.scraper(this.scraperName)
    // choose fetcher
    if (read && write) {
      this.fetcher = this.downloadToFileAndMemory
    } else if (read) {
      this.fetcher = this.downloadToMemoryOnly
    } else if (write) {
      this.fetcher = this.downloadToFileOnly
    } else {
      this.fetcher = this.downloadOnly
    }
  }

  public constructDownload = ({ value, incrementIndex: index }: DownloadParams): DownloadData => {
    const templateVals = { ...this.params.input, value, index }
    // construct url
    const url = new URL(this.urlTemplate(templateVals)).toString()
    // construct headers
    const headers = this.headerTemplates.toObject(template => template(templateVals))
    return [url, { headers, method: this.downloadConfig.method }]
  }

  public retrieve = (downloadId: number, downloadData: DownloadData) =>
    this.tools.queue.add(() => {
      this.scraperEmitter.emit.progress(downloadId, 0)
      return this.fetcher(downloadId, downloadData)
    }, this.options.downloadPriority)

  private downloadToFileAndMemory: FetchFunction = async (downloadId, [url, fetchOptions]) => {
    const downloadFolder = path.resolve(this.params.folder, downloadId.toString())
    const filename = path.resolve(downloadFolder, sanitizeFilename(url))

    const response = await fetch(url, fetchOptions)
    if (!response.ok) throw new ResponseError(response, url)

    await mkdirp(downloadFolder)
    const dest = createWriteStream(filename)
    const buffers: Buffer[] = []

    const buffer = await new Promise((resolve, reject) => {
      response.body.pipe(dest)
      response.body.on('error', error => reject(error))
      response.body.on('data', chunk => buffers.push(chunk))
      this.emitBodyProgress(downloadId, response)
      dest.on('error', error => reject(error))
      dest.on('close', () => resolve(Buffer.concat(buffers)))
    })
    return {
      downloadValue: buffer.toString(),
      filename
    }
  }
  private downloadToFileOnly: FetchFunction = async (downloadId, [url, fetchOptions]) => {
    const downloadFolder = path.resolve(this.params.folder, downloadId.toString())
    const filename = path.resolve(downloadFolder, sanitizeFilename(url))

    const response = await fetch(url, fetchOptions)
    if (!response.ok) throw new ResponseError(response, url)

    await mkdirp(downloadFolder)
    const dest = createWriteStream(filename)
    await new Promise((resolve, reject) => {
      response.body.pipe(dest)
      this.emitBodyProgress(downloadId, response)
      response.body.on('error', error => reject(error))
      dest.on('error', error => reject(error))
      dest.on('close', resolve)
    })
    return {
      downloadValue: '',
      filename
    }
  }
  private downloadToMemoryOnly: FetchFunction = (downloadId, [url, fetchOptions]) =>
    fetch(url, fetchOptions)
      .then(response => {
        if (!response.ok) throw new ResponseError(response, url)
        this.emitBodyProgress(downloadId, response)
        return response.text()
      })
      .then(downloadValue => ({ downloadValue }))

  private downloadOnly: FetchFunction = (downlodaId, [url, fetchOptions]) =>
    fetch(url, fetchOptions).then(() => ({ downloadValue: '' }))

  private emitBodyProgress = (downloadId: number, response: Fetch.Response) => {
    if (this.scraperEmitter.hasListenerFor(this.scraperEmitter.listenable.PROGRESS)) {
      const contentLength = parseInt(response.headers.get('content-length') || '0')
      let bytesLength = 0
      response.body.on('data', chunk => {
        bytesLength += chunk.length
        // emitting Infinity signals that content-length was zero
        const progress = bytesLength / contentLength
        this.scraperEmitter.emit.progress(downloadId, progress)
      })
    }
  }
}

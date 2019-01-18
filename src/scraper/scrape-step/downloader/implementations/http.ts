import fetch, * as Fetch from 'node-fetch'
import { createWriteStream } from 'fs'
import path from 'path'
import { mkdirp, sanitizeFilename } from '../../../../util/fs'

import { AbstractDownloader, DownloadParams } from '../abstract'
import { compileTemplate } from '../../../../util/handlebars'
// type imports
import { URL } from 'url'
import { ScrapeConfig } from '../../../../settings/config/types'
import { Options } from '../../../../settings/options/types'
import { Tools } from '../../../../tools'
import { DownloadConfig } from '../../../../settings/config/types'

type Headers = { [header: string]: string }
type DownloadData = [
  string,
  { headers: Headers; method: DownloadConfig['method'] }
]
type FetchFunction = (
  downloadId: number,
  DownloadData: DownloadData
) => Promise<{
  downloadValue?: string
  filename?: string
}>

/**
 * downloader pertaining to all http/https requests
 */
export class Downloader extends AbstractDownloader<DownloadData> {
  private urlTemplate: ReturnType<typeof compileTemplate>
  private headerTemplates: Map<string, ReturnType<typeof compileTemplate>>
  private verifyResponseOk = (response: Fetch.Response, url: string) => {
    if (!response.ok) {
      throw new Error(`status ${response.status} for ${url}`)
    }
  }
  private fetcher: FetchFunction

  public constructor(config: ScrapeConfig, options: Options, tools: Tools) {
    super(config, options, tools)
    // set templates
    this.urlTemplate = compileTemplate(config.download!.urlTemplate)
    this.headerTemplates = new Map()
    Object.entries(config.download!.headerTemplates).forEach(
      ([key, templateStr]) =>
        this.headerTemplates.set(key, compileTemplate(templateStr))
    )
    // choose fetcher
    // TODO change this to manual options option ONLY
    const shouldDownloadToMemory =
      this.config.scrapeEach.length || this.config.parse
    const shouldDownloadToFile = this.options.cache
    if (shouldDownloadToMemory && shouldDownloadToFile) {
      this.fetcher = this.downloadToFileAndMemory
    } else if (shouldDownloadToMemory) {
      this.fetcher = this.downloadToMemoryOnly
    } else {
      this.fetcher = this.downloadToFileOnly
    }
  }

  protected constructDownload = ({
    value,
    incrementIndex: index
  }: DownloadParams): DownloadData => {
    const templateVals = { ...this.options.input, value, index }
    // construct url
    const url = new URL(this.urlTemplate(templateVals)).toString()
    // construct headers
    const headers: Headers = {}
    for (const [key, template] of this.headerTemplates) {
      headers[key] = template(templateVals)
    }
    return [url, { headers, method: this.config.download!.method }]
  }

  protected retrieve = (downloadId: number, downloadData: DownloadData) => {
    return this.fetcher(downloadId, downloadData)
  }

  private downloadToFileAndMemory: FetchFunction = async (
    downloadId,
    [url, fetchOptions]
  ) => {
    const downloadFolder = path.resolve(
      this.options.folder,
      downloadId.toString()
    )
    const filename = path.resolve(downloadFolder, sanitizeFilename(url))

    const response = await this.tools.queue.add(
      () => fetch(url, fetchOptions),
      this.options.downloadPriority
    )
    await mkdirp(downloadFolder)
    this.verifyResponseOk(response, url)
    const dest = createWriteStream(filename)
    const buffers: Buffer[] = []

    const buffer = await new Promise((resolve, reject) => {
      response.body.pipe(dest)
      response.body.on('error', error => reject(error))
      response.body.on('data', chunk => buffers.push(chunk))
      this.tools.emitter.scraper[this.config.name].emitProgress(
        downloadId,
        response
      )
      dest.on('error', error => reject(error))
      dest.on('close', () => resolve(Buffer.concat(buffers)))
    })
    return {
      downloadValue: buffer.toString(),
      filename
    }
  }
  private downloadToFileOnly: FetchFunction = async (
    downloadId,
    [url, fetchOptions]
  ) => {
    const downloadFolder = path.resolve(
      this.options.folder,
      downloadId.toString()
    )
    const filename = path.resolve(downloadFolder, sanitizeFilename(url))

    const response = await this.tools.queue.add(
      () => fetch(url.toString(), fetchOptions),
      this.options.downloadPriority
    )
    await mkdirp(downloadFolder)
    await new Promise((resolve, reject) => {
      this.verifyResponseOk(response, url)
      const dest = createWriteStream(filename)
      response.body.pipe(dest)
      this.tools.emitter.scraper[this.config.name].emitProgress(
        downloadId,
        response
      )
      response.body.on('error', error => reject(error))
      dest.on('error', error => reject(error))
      dest.on('close', resolve)
    })
    return {
      downloadValue: undefined,
      filename
    }
  }
  private downloadToMemoryOnly: FetchFunction = (
    downloadId,
    [url, fetchOptions]
  ) =>
    this.tools.queue
      .add(() => fetch(url, fetchOptions), this.options.downloadPriority)
      .then(response => {
        this.verifyResponseOk(response, url)
        this.tools.emitter.scraper[this.config.name].emitProgress(
          downloadId,
          response
        )
        return response.text()
      })
      .then(downloadValue => ({
        downloadValue
      }))
}
import fetch from 'node-fetch'
import * as path from 'path'
import { createWriteStream } from 'fs'
import * as fs from '@scrape-pages/util/fs'
import { BaseCommand } from './base-command'
import { ResponseError } from '@scrape-pages/util/error'
import * as templates from '@scrape-pages/util/handlebars'
import { FMap } from '@scrape-pages/util/map'
// type imports
import * as Fetch from 'node-fetch'
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'
import * as I from '@scrape-pages/types/instructions'

// TODO queues and cache:
// when cache is enabled
// check for matching in-flight request
// if none, check for matching request in database
// if none, add it to the queue
type ReadInfo = { bytes: number; value: string; filename: null }
type WriteInfo = { bytes: number; value: null; filename: string }
type DownloadInfoWithValue = Stream.DownloadInfo & { value: string }

class FetchCommand extends BaseCommand<I.FetchCommand, typeof FetchCommand.DEFAULT_PARAMS> {
  private static DEFAULT_PARAMS = {
    METHOD: 'GET' as 'GET',
    HEADERS: {},
    READ: true,
    WRITE: false,
    CACHE: false,
    PRIORITY: -1
  }
  private writeFolder: string
  private urlTemplate: templates.Template
  private headerTemplates: FMap<string, templates.Template>

  constructor(settings: Settings, tools: Tools, command: I.FetchCommand) {
    super(settings, tools, command, FetchCommand.DEFAULT_PARAMS)
    const { URL, HEADERS = {} } = command.params
    this.urlTemplate = templates.compileTemplate(URL)
    this.headerTemplates = FMap.fromObject(HEADERS).map(templates.compileTemplate)
  }

  async stream(payload: Stream.Payload) {
    // check cache or write to cache (transactional)
    // write queued command output to db (we need this because we need an id inside here)
    // create url, create headers
    const { LABEL, PRIORITY, METHOD } = this.params
    // const { LABEL, PRIORITY } = this.params
    const url = this.urlTemplate(payload)
    const headers = this.headerTemplates.map(template => template(payload)).toObject()
    const requestParams = { url, headers, method: METHOD }
    const requestId = this.tools.store.qs.insertQueuedNetworkRequest(
      this.commandId,
      JSON.stringify(requestParams)
    )
    const task = () => this.fetch(requestParams, requestId)
    // const cacheId = undefined // TODO add in memory caching and database caching of this.fetch
    // TODO wrap this in a try/catch and write a FAILED status
    const { bytes, filename, value } = await this.tools.queue.push(task, PRIORITY)

    this.tools.store.qs.updateNetworkRequestStatus(requestId, value, filename, bytes, 'COMPLETE')
    const newPayload = this.saveValue(payload, 0, value, requestId)

    return [newPayload]
  }

  private async fetch(
    {
      url,
      headers,
      method
    }: {
      url: string
      headers: { [headerName: string]: string }
      method: string
    },
    id: number
  ): Promise<DownloadInfoWithValue> {
    const { READ, WRITE, METHOD } = this.params

    const response = await fetch(url, { method, headers })
    if (!response.ok) throw new ResponseError(response, url)

    this.notifyProgress(response, id)

    if (READ && WRITE) {
      const results = await Promise.all([
        this.read(response, url, id),
        this.write(response, url, id)
      ])
      const [{ value }, { filename, bytes }] = results
      return { value, bytes, filename }
    } else if (READ) {
      const { value, bytes } = await this.read(response, url, id)
      return { value, bytes, filename: null }
    } else if (WRITE) {
      const { filename, bytes } = await this.write(response, url, id)
      return { value: '', bytes, filename }
    } else {
      return { value: '', bytes: 0, filename: null }
    }
  }

  private async read(response: Fetch.Response, url: string, id: number): Promise<ReadInfo> {
    const buffers: Buffer[] = []

    const buffer: Buffer = await new Promise((resolve, reject) => {
      response.body.on('error', error => reject(error))
      response.body.on('data', chunk => buffers.push(chunk))
      response.body.on('end', () => resolve(Buffer.concat(buffers)))
    })
    const value = buffer.toString()
    const bytes = Buffer.byteLength(value)
    return { bytes, value, filename: null }
  }

  private async write(response: Fetch.Response, url: string, id: number): Promise<WriteInfo> {
    const filename = path.resolve(this.writeFolder, id.toString() + path.extname(url))
    const dest = createWriteStream(filename)

    await new Promise((resolve, reject) => {
      response.body.pipe(dest)
      dest.on('error', reject)
      dest.on('close', () => resolve())
    })

    return { filename, bytes: dest.bytesWritten, value: null }
  }

  private notifyProgress(response: Fetch.Response, id: Stream.Id) {
    const { command } = this.command
    const { LABEL } = this.command.params
    const metadata = { url: response.url }
    if (this.tools.notify.hasProgressListeners(command)) {
      try {
        const contentLength = parseInt(response.headers.get('content-length') || '0')
        if (contentLength === 0) {
          this.tools.notify.asyncCommandProgress(command, { id, LABEL, progress: NaN, metadata })
        } else {
          let bytes = 0
          response.body.on('data', chunk => {
            bytes += chunk.length
            const progress = bytes / contentLength
            this.tools.notify.asyncCommandProgress(this.command.command, {
              id,
              LABEL,
              progress,
              metadata
            })
          })
        }
      } catch (e) {}
    }
  }

  async initialize() {
    super.initialize()
    this.writeFolder = path.resolve(this.settings.folder, this.commandId.toString())
    if (this.command.params.WRITE) {
      await fs.mkdirp(this.writeFolder)
    }
  }
  async cleanup() {
    // cancel in-flight requests here
  }
}

export { FetchCommand }

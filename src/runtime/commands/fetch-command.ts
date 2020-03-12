import fetch from 'node-fetch'
import * as path from 'path'
import { createWriteStream } from 'fs'
import * as fs from '@scrape-pages/util/fs'
import { BaseCommand } from './base-command'
import { ResponseError } from '@scrape-pages/util/error'
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

class FetchCommand extends BaseCommand {
  protected command: I.HttpCommand
  private folder: string

  constructor(settings: Settings, tools: Tools, command: I.HttpCommand) {
    super(settings, tools, command)
  }

  async stream(payload: Stream.Payload) {
    // check cache or write to cache (transactional)
    // write queued command output to db (we need this because we need an id inside here)
    // create url, create headers
    const url = ''
    const headers = {}
    const id = -1
    const { bytes, value } = await this.tools.queue.enqueue(() => this.fetch(url, headers, id))
    this.tools.notify.commandSucceeded(this.command.command, { id })
    // write completed to db
    return ['s']
  }

  async fetch(url: string, headers: {}, id: number): Promise<DownloadInfoWithValue> {
    const { READ, WRITE, METHOD } = this.command.params

    const response = await fetch(url, { method: METHOD, headers: headers })
    if (!response.ok) throw new ResponseError(response, url)

    // if progress listeners, add progress emitter

    if (READ && WRITE) {
      const [{ value }, { filename, bytes }] = await Promise.all([
        this.read(response, url, id),
        this.write(response, url, id)
      ])
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

  async read(response: Fetch.Response, url: string, id: number): Promise<ReadInfo> {
    const buffers: Buffer[] = []

    const buffer: Buffer = await new Promise((resolve, reject) => {
      response.body.on('error', error => reject(error))
      response.body.on('data', chunk => buffers.push(chunk))
      response.body.on('close', () => resolve(Buffer.concat(buffers)))
    })
    const value = buffer.toString()
    const bytes = Buffer.byteLength(value)
    return { bytes, value, filename: null }
  }

  async write(response: Fetch.Response, url: string, id: number): Promise<WriteInfo> {
    const filename = path.resolve(this.folder, id.toString() + path.extname(url))
    const dest = createWriteStream(filename)

    await new Promise((resolve, reject) => {
      response.body.pipe(dest)
      dest.on('error', reject)
      dest.on('close', () => resolve())
    })

    return { filename, bytes: dest.bytesWritten, value: null }
  }

  async initialize(folder: string) {
    this.folder = path.resolve(folder, this.LABEL)

    if (this.command.params.WRITE) {
      await fs.mkdirp(this.folder)
    }
  }
  async cleanup() {
    // cancel in-flight requests here
  }
}

export { FetchCommand }

import fetch, * as Fetch from 'node-fetch'
import { URL } from 'url'
import { createWriteStream } from 'fs'
import { resolve } from 'path'
import sanitize from 'sanitize-filename'
import { readFile, exists, mkdirp } from '../../../../../util/fs'
// type imports
import { ScrapeConfig } from '../../../../../configuration/site-traversal/types'
import { RunOptions } from '../../../../../configuration/run-options/types'
import { Dependencies } from '../../../../types'
import { ConstructedFetch } from './construct-url'

const sanitizeUrl = (url: URL) => sanitize(url.toString(), { replacement: '_' })

const verifyResponseOk = (
  name: ScrapeConfig['name'],
  response: Fetch.Response,
  url: URL
) => {
  if (!response.ok) {
    throw new Error(
      `scraper '${name}' status ${response.status} for ${url.toString()}`
    )
  }
}

const emitProgressIfListenersAttached = (
  emitter: Dependencies['emitter'],
  response: Fetch.Response,
  name: ScrapeConfig['name'],
  downloadId: number
) => {
  if (emitter.hasListenerFor(`${name}:progress`)) {
    const contentLength = parseInt(response.headers.get('content-length'))
    let bytesLength = 0
    response.body.on('data', chunk => {
      bytesLength += chunk.length
      emitter.forScraper[name].emitProgress(
        downloadId,
        bytesLength / contentLength
      )
    })
  }
}

interface FetchParams extends ConstructedFetch {
  downloadId: number
}
type Fetcher = (
  config: ScrapeConfig,
  runParams: RunOptions,
  dependencies: Dependencies,
  fetchParams: FetchParams
) => Promise<{
  downloadValue?: string
  filename?: string
}>
export const downloadToFileAndMemory: Fetcher = async (
  { name },
  { folder, downloadPriority },
  { queue, emitter },
  { downloadId, url, fetchOptions }
) => {
  const downloadFolder = resolve(folder, downloadId.toString())
  const filename = resolve(downloadFolder, sanitizeUrl(url))

  const response = await queue.add(
    () => fetch(url.toString(), fetchOptions),
    downloadPriority
  )
  await mkdirp(downloadFolder)
  verifyResponseOk(name, response, url)
  const contentLength = response.headers.get('content-length')
  const hasProgressListener = emitter.hasListenerFor(`${name}:progress`)
  const dest = createWriteStream(filename)
  const buffers: Buffer[] = []

  const buffer = await new Promise((resolve, reject) => {
    response.body.pipe(dest)
    response.body.on('error', error => reject(error))
    response.body.on('data', chunk => buffers.push(chunk))
    emitProgressIfListenersAttached(emitter, response, name, downloadId)
    dest.on('error', error => reject(error))
    dest.on('close', () => resolve(Buffer.concat(buffers)))
  })
  return {
    downloadValue: buffer.toString(),
    filename
  }
}
export const downloadToFileOnly: Fetcher = async (
  { name },
  { folder, downloadPriority },
  { queue, emitter },
  { downloadId, url, fetchOptions }
) => {
  const downloadFolder = resolve(folder, downloadId.toString())
  const filename = resolve(downloadFolder, sanitizeUrl(url))

  const response = await queue.add(
    () => fetch(url.toString(), fetchOptions),
    downloadPriority
  )
  await mkdirp(downloadFolder)
  const buffer = await new Promise((resolve, reject) => {
    verifyResponseOk(name, response, url)
    const dest = createWriteStream(filename)
    response.body.pipe(dest)
    emitProgressIfListenersAttached(emitter, response, name, downloadId)
    response.body.on('error', error => reject(error))
    dest.on('error', error => reject(error))
    dest.on('close', resolve)
  })
  return {
    filename
  }
}

export const downloadToMemoryOnly: Fetcher = (
  { name },
  { downloadPriority },
  { queue, emitter },
  { downloadId, url, fetchOptions }
) =>
  queue
    .add(() => fetch(url.toString(), fetchOptions), downloadPriority)
    .then(response => {
      verifyResponseOk(name, response, url)
      emitProgressIfListenersAttached(emitter, response, name, downloadId)
      return response.text()
    })
    .then(downloadValue => ({
      downloadValue
    }))

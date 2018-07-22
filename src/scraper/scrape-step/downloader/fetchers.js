import fetch from 'node-fetch'
import { createWriteStream } from 'fs'
import { resolve } from 'path'
import sanitize from 'sanitize-filename'
import { readFile, exists, mkdirp } from '../../../util/fs-promise'

const sanitizeUrl = url => sanitize(url.toString(), { replacement: '_' })

const verifyResponseOk = (name, response, url) => {
  if (!response.ok) {
    throw new Error(
      `scraper ${name} status ${response.status} for ${url.toString()}`
    )
  }
}

const emitProgressIfListenersAttached = (
  emitter,
  response,
  name,
  downloadId
) => {
  if (emitter.hasListenerFor(`${name}:progress`)) {
    const contentLength = response.headers.get('content-length')
    let bytesLength = 0
    response.body.on('data', chunk => {
      bytesLength += chunk.length
      emitter.forScraper[name].emitProgress(bytesLength / contentLength)
    })
  }
}

export const downloadToFileAndMemory = async (
  { name },
  { folder },
  { queue, emitter },
  { downloadId, url, fetchOptions }
) => {
  const downloadFolder = resolve(folder, downloadId.toString())
  const filename = resolve(downloadFolder, sanitizeUrl(url))

  const response = await queue.add(() => fetch(url, fetchOptions))
  await mkdirp(downloadFolder)
  verifyResponseOk(name, response, url)
  const contentLength = response.headers.get('content-length')
  const hasProgressListener = emitter.hasListenerFor(`${name}:progress`)
  const dest = createWriteStream(filename)
  const buffers = []

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
export const downloadToFileOnly = async (
  { name },
  { folder },
  { queue, emitter },
  { downloadId, url, fetchOptions }
) => {
  const downloadFolder = resolve(folder, downloadId.toString())
  const filename = resolve(downloadFolder, sanitizeUrl(url))

  const response = await queue.add(() => fetch(url, fetchOptions))
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

export const downloadToMemoryOnly = (
  { name },
  runParams,
  { queue, emitter },
  { downloadId, url, fetchOptions }
) =>
  queue
    .add(() => fetch(url, fetchOptions))
    .then(response => {
      verifyResponseOk(name, response, url)
      emitProgressIfListenersAttached(emitter, response, name, downloadId)
      return response.text()
    })
    .then(downloadValue => ({
      downloadValue
    }))

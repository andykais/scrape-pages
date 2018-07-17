import fetch from 'node-fetch'
import { createWriteStream } from 'fs'
import { resolve } from 'path'
import sanitize from 'sanitize-filename'
import { readFile, exists, mkdirp } from '../../../util/fs-promise'

const sanitizeUrl = url => sanitize(url.toString(), { replacement: '_' })

const verifyResponseOk = (response, url) => {
  if (!response.ok) {
    throw new Error(`${url.toString()} status ${response.status}`)
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
    response.body.on('data', data => {
      bytesLength += data.length
      emitter.forScraper[name].emitProgress(bytesLength / contentLength)
    })
  }
}

export const downloadToFileAndMemory = (
  { name },
  { folder },
  { queue, emitter },
  downloadId,
  url
) => {
  const filename = resolve(folder, sanitizeUrl(url))

  return queue
    .add(() => fetch(url))
    .then(response => {
      verifyResponseOk(response, url)
      const contentLength = response.headers.get('content-length')
      const hasProgressListener = emitter.hasListenerFor(`${name}:progress`)
      const dest = createWriteStream(filename)
      const buffers = []

      return new Promise((resolve, reject) => {
        response.body.pipe(dest)
        response.body.on('error', error => reject(error))
        response.body.on('data', data => buffers.push(data))
        emitProgressIfListenersAttached(emitter, response, name, downloadId)
        dest.on('error', error => reject(error))
        dest.on('close', () => resolve(Buffer.concat(buffers)))
      })
    })
    .then(buffer => ({
      downloadValue: buffer.toString(),
      filename
    }))
}
export const downloadToFileOnly = (
  { name },
  { folder },
  { queue, emitter },
  downloadId,
  url
) => {
  const filename = resolve(folder, sanitizeUrl(url))

  return queue
    .add(() => fetch(url))
    .then(
      response =>
        new Promise((resolve, reject) => {
          verifyResponseOk(response, url)
          const dest = createWriteStream(filename)
          response.body.pipe(dest)
          emitProgressIfListenersAttached(emitter, response, name, downloadId)
          response.body.on('error', error => reject(error))
          dest.on('error', error => reject(error))
          dest.on('close', resolve)
        })
    )
    .then(buffer => ({
      filename
    }))
}

export const downloadToMemoryOnly = (
  { name },
  runParams,
  { queue, emitter },
  downloadId,
  url
) =>
  queue
    .add(() => fetch(url))
    .then(response => {
      verifyResponseOk(response, url)
      emitProgressIfListenersAttached(emitter, response, name, downloadId)
      return response.text()
    })
    .then(downloadValue => ({
      downloadValue
    }))

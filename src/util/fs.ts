import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import sanitize from 'sanitize-filename'

const [exists, readFile, mkdir, readdir, stat, unlink, rmdir] = [
  fs.readFile,
  fs.exists,
  fs.mkdir,
  fs.readdir,
  fs.stat,
  fs.unlink,
  fs.rmdir
].map(promisify)

export { mkdir, exists, readFile, readdir, stat, unlink }

export const mkdirp = async (folder: string) => {
  try {
    await mkdir(folder)
  } catch (e) {
    if (e.code === 'ENOENT') {
      await mkdirp(path.dirname(folder))
      await mkdirp(folder)
    } else if (e.code !== 'EEXIST') {
      throw e
    }
  }
}

export const rmrf = async (folder: string) => {
  try {
    const files = await readdir(folder)
    for (const file of files) {
      const fullPath = path.resolve(folder, file)
      const fileStats = await stat(fullPath)
      if (fileStats.isDirectory()) {
        await rmrf(fullPath)
        await rmdir(fullPath)
      } else {
        await unlink(fullPath)
      }
    }
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    }
  }
}

export const sanitizeFilename = (filename: string) =>
  sanitize(filename, { replacement: '_' })

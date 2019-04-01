import * as path from 'path'
import * as fs from 'fs'
import { promisify } from 'util'
import * as sanitize from 'sanitize-filename'

const [mkdir, readdir, stat, unlink, rmdir, rename, access, writeFile] = [
  fs.mkdir,
  fs.readdir,
  fs.stat,
  fs.unlink,
  fs.rmdir,
  fs.rename,
  fs.access,
  fs.writeFile
].map(promisify)

export { readdir, stat, rename, writeFile }

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

export const exists = async (file: string): Promise<boolean> => {
  try {
    await access(file, fs.constants.F_OK)
    return true
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false
    } else {
      throw e
    }
  }
}

export const sanitizeFilename = (filename: string) => sanitize(filename, { replacement: '_' })

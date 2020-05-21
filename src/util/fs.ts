import * as path from 'path'
import * as fs from 'fs'
import { promisify } from 'util'

const [mkdir, readdir, stat, unlink, rmdir, rename, readFile, writeFile] = [
  fs.mkdir,
  fs.readdir,
  fs.stat,
  fs.unlink,
  fs.rmdir,
  fs.rename,
  fs.readFile,
  fs.writeFile
].map(promisify)

async function mkdirp(folder: string) {
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

async function rmrf(folder: string) {
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

async function findFiles(folder: string): Promise<string[]> {
  const endpointFiles = []
  const filesInDir = await readdir(folder)
  for (const file of filesInDir) {
    const fileStats = await stat(path.resolve(folder, file))
    if (fileStats.isDirectory()) {
      const recursedFiles = await findFiles(path.resolve(folder, file))
      endpointFiles.push(...recursedFiles)
    } else {
      endpointFiles.push(path.resolve(folder, file))
    }
  }
  return endpointFiles
}

const existsSync = fs.existsSync

export {
  existsSync,
  // promisified
  readdir,
  stat,
  rename,
  readFile,
  writeFile,
  rmdir,
  // custom file ops
  mkdirp,
  rmrf,
  findFiles
}

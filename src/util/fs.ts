import * as path from 'path'
import * as fs from 'fs'
import { promisify } from 'util'

const [mkdir, readdir, stat, unlink, rmdir, rename, access, readFile, writeFile] = [
  fs.mkdir,
  fs.readdir,
  fs.stat,
  fs.unlink,
  fs.rmdir,
  fs.rename,
  fs.access,
  fs.readFile,
  fs.writeFile
].map(promisify)

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

export {
  // promisified
  readdir,
  stat,
  rename,
  readFile,
  writeFile,
  rmdir,
  // custom file ops
  rmrf,
  findFiles
}

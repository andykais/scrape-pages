import path from 'path'
import { readdir, stat } from '../src/util/fs'
import nock from 'nock'

const findFilesRecursive = async (folder: string): Promise<string[]> => {
  const endpointFiles = []
  const filesInDir = await readdir(folder)
  for (const file of filesInDir) {
    const fileStats = await stat(path.resolve(folder, file))
    if (fileStats.isDirectory()) {
      const recursedFiles = await findFilesRecursive(path.resolve(folder, file))
      endpointFiles.push(...recursedFiles)
    } else {
      endpointFiles.push(path.resolve(folder, file))
    }
  }
  return endpointFiles
}

class PsuedoSeedRandom {
  _seed: number
  constructor(seed: number) {
    this._seed = seed % 2147483647
    if (this._seed <= 0) this._seed += 2147483646
  }
  next = () => (this._seed = (this._seed * 16807) % 2147483647)
  nextFloat = () => (this.next() - 1) / 2147483646
}

export class NockFolderMock {
  mockEndpointsFolder: string
  baseUrl: string
  scope: nock.Scope
  random: PsuedoSeedRandom

  constructor(
    mockEndpointsFolder: string,
    baseUrl: string,
    { randomSeed }: { randomSeed?: number } = {}
  ) {
    this.mockEndpointsFolder = mockEndpointsFolder
    this.baseUrl = baseUrl
    this.scope = nock(baseUrl)
    if (randomSeed) this.random = new PsuedoSeedRandom(randomSeed)
  }
  init = async () => {
    const files = await findFilesRecursive(this.mockEndpointsFolder)
    for (const file of files) {
      const relativePath = path.relative(this.mockEndpointsFolder, file)
      const fullPath = path.resolve(this.mockEndpointsFolder, file)
      if (this.random) {
        this.scope
          .get(`/${relativePath}`)
          .delay(this.random.nextFloat() * 100)
          .replyWithFile(200, fullPath)
      } else {
        this.scope.get(`/${relativePath}`).replyWithFile(200, fullPath)
      }
    }
  }
}

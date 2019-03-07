import * as path from 'path'
import { readdir, stat } from '../src/util/fs'
import * as nock from 'nock'

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

class SeedPsuedoRandom {
  private _seed: number
  public constructor(seed: number) {
    this._seed = seed % 2147483647
    if (this._seed <= 0) this._seed += 2147483646
  }
  public next = () => (this._seed = (this._seed * 16807) % 2147483647)
  public nextFloat = () => (this.next() - 1) / 2147483646
}

export const nockMockFolder = async (
  mockEndpointsFolder: string,
  baseUrl: string,
  { randomSeed, delay = 0 }: { randomSeed?: number; delay?: number } = {}
) => {
  const scope = nock(baseUrl)
  const random = randomSeed && new SeedPsuedoRandom(randomSeed)

  const files = await findFilesRecursive(mockEndpointsFolder)
  for (const file of files) {
    const relativePath = path.relative(mockEndpointsFolder, file)
    const fullPath = path.resolve(mockEndpointsFolder, file)
    if (random) {
      scope
        .get(`/${relativePath}`)
        .delay(random.nextFloat() * 100)
        .replyWithFile(200, fullPath)
    } else {
      scope
        .get(`/${relativePath}`)
        .delay({ head: delay })
        .replyWithFile(200, fullPath)
    }
  }
}

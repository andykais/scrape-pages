// necessary because mocha-webpack's global beforeEach this.currentFile does not know about webpack __dirname
import * as path from 'path'
import * as chaiJestSnapshot from 'chai-jest-snapshot'
// type imports
import { Query } from '../src/scraper'

type CurrentTestFileInfo = {
  __dirname: string
  __filename: string
  fullTitle: string
}
export const configureSnapshots = function({
  __dirname,
  __filename,
  fullTitle
}: CurrentTestFileInfo) {
  const filename = path.resolve(__dirname, '__snapshots__', path.basename(__filename) + '.snap')
  chaiJestSnapshot.setFilename(filename)
  chaiJestSnapshot.setTestName(fullTitle)
}

type Result = ReturnType<Query>
export const stripResult = (result: Result) =>
  result.map(g =>
    g.map(r => ({
      ...r,
      filename: typeof r.filename === 'string' ? true : false,
      id: typeof r.id === 'number' ? true : false
    }))
  )

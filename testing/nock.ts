import { resolve } from 'path'
import * as nock from 'nock'

nock.back.setMode('record')
nock.back.fixtures = resolve(__dirname, '..', '.fixtures')

export { nock }

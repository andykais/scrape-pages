import format from 'string-template'
import DB from './database'
import type { Config } from '../configuration/type'
import { makeFlatConfig } from '../configuration'
import {
  makeDynamicOrderLevelColumn,
  makeWaitingConditionalJoins
} from './sql-generators'
import {
  CREATE_TABLES,
  SELECT_ORDERED_AS_TREE,
  INSERT_QUEUED_DOWNLOAD,
  SELECT_DOWNLOAD_WHERE_URL_IS,
  MARK_DOWNLOAD_COMPLETE,
  INSERT_PARSED_VALUES,
  SELECT_PARSED_VALUES_WHERE_PARENT_ID_IS,
  SELECT_PARSED_VALUES_WHERE_DOWNLOAD_ID_IS,
  SELECT_COMPLETED_DOWNLOAD
} from './sql-templates'

class Store {
  constructor(config) {
    this.config = config
    this.flatConfig = makeFlatConfig(config)
  }

  init = async ({ folder }) => {
    this.db = new DB(folder)
    await this.db.run('PRAGMA journal_mode = WAL')
    await this.db.exec(CREATE_TABLES)
    // TODO optimize queries by creating dynamic sql ahead of time
  }

  insertCompletedFile = (scraper, value, url) => {}

  countCompletedFiles = () => {}

  isFileDownloaded = url => false

  areChildrenCompleted = url => false

  getCompletedDownload = async ({
    incrementIndex,
    loopIndex = 0,
    parentId = -1
  }) => {
    const result = await this.db.get(SELECT_COMPLETED_DOWNLOAD, [
      loopIndex,
      incrementIndex,
      parentId
    ])
    return result || {}
  }

  getCachedDownload = async url => {
    const result = await this.db.get(SELECT_DOWNLOAD_WHERE_URL_IS, [url])
    return result || {}
  }
  // TODO batch this call? (less readable but doable)
  insertQueuedDownload = ({
    scraper,
    parentId,
    loopIndex,
    incrementIndex,
    url
  }): number => {
    console.log({ scraper, parentId, incrementIndex, url })
    return this.db.run(
      INSERT_QUEUED_DOWNLOAD,
      [scraper, parentId, loopIndex, incrementIndex, url]
      // $scraper: scraper,
      // $loopIndex: loopIndex,
      // $incrementIndex: incrementIndex,
      // $url: url
      // }
    )
  }

  markDownloadComplete = ({ downloadId, filename }) => {
    return this.db.run(MARK_DOWNLOAD_COMPLETE, {
      $filename: filename,
      $downloadId: downloadId
    })
  }

  insertBatchParsedValues = ({ name, parentId, downloadId, parsedValues }) => {
    if (!parsedValues.length) return Promise.resolve([])
    const valuesString = Array(parsedValues.length)
      .fill('(?, ?, ?, ?, ?)')
      .join(',')
    if (name === 'post')
      console.log('batch', {
        parentId,
        downloadId,
        parsedValues: parsedValues.length
      })
    const insertBatchParsedValuesSql = format(INSERT_PARSED_VALUES, {
      values: valuesString
    })
    const insertRows = parsedValues.reduce(
      (acc, parsedValue, parseIndex) =>
        acc.concat([name, parentId, downloadId, parseIndex, parsedValue]),
      []
    )
    if (name === 'score') console.log(name, insertRows)
    return this.db.run(insertBatchParsedValuesSql, insertRows)
  }

  getParsedValuesFromParentId = (
    parentId = -1 // undefined is treated as -1 for selecting
  ): Array<{ id: number, parsedValue: string }> => {
    console.log({ parentId })
    return this.db.all(SELECT_PARSED_VALUES_WHERE_PARENT_ID_IS, [parentId])
  }

  getParsedValuesFromDownloadId = downloadId => {
    // console.log({ downloadId })
    return this.db.all(SELECT_PARSED_VALUES_WHERE_DOWNLOAD_ID_IS, [downloadId])
  }

  getOrderedScrapers = scrapers => {
    const scraperConfigs = scrapers.map(s => this.flatConfig[s]).filter(c => c)
    if (!scraperConfigs.length) return Promise.resolve([])

    console.log({ scraperConfigs })
    const lowestDepth = Math.max(...scraperConfigs.map(s => s.depth))
    const orderLevelColumnSql = makeDynamicOrderLevelColumn(
      this.flatConfig,
      scrapers
    )
    const waitingJoinsSql = makeWaitingConditionalJoins(
      this.flatConfig,
      scrapers
    )

    const selectedScrapers = scrapers.map(s => `'${s}'`).join(',')

    const selectOrderedSql = format(SELECT_ORDERED_AS_TREE, {
      orderLevelColumnSql,
      waitingJoinsSql,
      selectedScrapers,
      lowestDepth
    })
    console.log(selectOrderedSql)

    return this.db.all(selectOrderedSql)
  }
}

export default Store

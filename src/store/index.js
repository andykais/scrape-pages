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
  SELECT_PARSED_VALUES_WHERE_PARENT_ID_IS_NULL
} from './sql-templates'

class Store {
  constructor(config) {
    this.config = config
    this.flatConfig = makeFlatConfig(config)
  }

  init = async folder => {
    this.db = new DB(folder)
    await this.db.run('PRAGMA journal_mode = WAL')
    await this.db.exec(CREATE_TABLES)
    // TODO optimize queries by creating dynamic sql ahead of time
    // find which are returned from options, create one for each individually and one for all combined
  }

  insertCompletedFile = (scraper, value, url) => {}

  countCompletedFiles = () => {}

  isFileDownloaded = url => false

  areChildrenCompleted = url => false

  getCachedDownload = url => this.db.get(SELECT_DOWNLOAD_WHERE_URL_IS, [url])
  // TODO batch this call? (less readable but doable)
  insertQueuedDownload = ({
    scraper,
    loopIndex,
    incrementIndex,
    url
  }): number => {
    return this.db.run(INSERT_QUEUED_DOWNLOAD, {
      $scraper: scraper,
      $loopIndex: loopIndex,
      $incrementIndex: incrementIndex,
      $url: url
    })
  }

  markDownloadComplete = ({ downloadId, filename }) => {
    return this.db.run(MARK_DOWNLOAD_COMPLETE, {
      $filename: filename,
      $downloadId: downloadId
    })
  }

  insertBatchParsedValues = ({ name, parentId, downloadId, values }) => {
    const valuesString = Array(values.length)
      .fill('(?, ?, ?, ?, ?)')
      .join(',')
    const insertBatchParsedValuesSql = format(INSERT_PARSED_VALUES, {
      values: valuesString
    })
    const insertRows = values.reduce(
      (acc, parsedValue, parseIndex) =>
        acc.concat([name, parentId, downloadId, parseIndex, parsedValue]),
      []
    )
    console.log(parentId)
    return this.db.run(insertBatchParsedValuesSql, insertRows)
  }
  getParsedValuesFromParentId = (
    parentId = -1 // undefined is treated as -1 for selecting
  ): Array<{ id: number, parsedValue: string }> => {
    console.log({ parentId })
    return this.db.all(SELECT_PARSED_VALUES_WHERE_PARENT_ID_IS, [parentId])
  }
  // insertParsedValue = (
  // scraper,
  // downloadId,
  // parentId,
  // parseIndex,
  // value
  // ): number => -1

  getOrderedScrapers = scrapers => {
    const scraperConfigs = scrapers.map(s => this.flatConfig[s])
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

    console.log({ orderLevelColumnSql, waitingJoinsSql, selectedScrapers })
    const selectOrderedSql = format(SELECT_ORDERED_AS_TREE, {
      orderLevelColumnSql,
      waitingJoinsSql,
      selectedScrapers,
      lowestDepth
    })
    console.log(selectOrderedSql)

    return this.db.all(selectOrderedSql)
  }

  getOrderedFromTo = (startLevel, parentLevel): Promise<Array<{}>> =>
    this.db.all(RECURSIVE_ORDER_FROM_CHILD_TO_PARENT_SQL, [
      startLevel,
      parentLevel
    ])
}

export default Store

/*
new Store({ input: '', scrape: {} }, '').getLevelsNested([
  'media',
  'tags-copyright',
  'tags-artist'
])

const fullData = {
  gallery: [
    {
      file,
      complete: true,
      children: {
        post: [
          {
            file,
            complete: true,
            children: {
              tagsCopyright: [{ value: 'cool' }],
              media: [{ value: 'filename' }]
            }
          }
        ]
      }
    }
  ]
}

const expectedForJustImages = [filename1, filename2, filename3]

const expectedForImagesAndTags = [
  {
    tagsCopyright: ['cool', 'fun'],
    tagsArtist: ['banksy'],
    media: [filename]
  }
]

const expectedTagsForTaggedGallery = [
  {
    tagsCopyright: ['cool', 'fun'],
    tagsArtist: ['banksy'],
    media: [filename]
  }
]

const alternatively = [
  {
    name: 'media',
    filename
  },
  {
    name: 'tagsCopyright',
    value: 'cool'
  },
  {
    name: 'tagsCopyright',
    value: 'cool'
  },
  {
    name: 'tagsArtist',
    value: 'banksy'
  }
]
*/

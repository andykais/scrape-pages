// @flow
import format from 'string-template'
import DB from './database'
import type { Config } from '../configuration/type'
import { makeFlatConfig } from '../configuration'
import {
  makeDynamicOrderLevelColumn,
  makeWaitingConditionalJoins
} from './sql-generators'
import { CREATE_TABLES, SELECT_ORDERED_AS_TREE } from './sql-templates'

class Store {
  constructor(config) {
    this.config = config
    this.flatConfig = makeFlatConfig(config)
  }

  init = async folder => {
    this.db = new DB(folder)
    await this.db.exec(CREATE_TABLES)
    // TODO optimize queries by creating dynamic sql ahead of time
    // find which are returned from options, create one for each individually and one for all combined
  }

  insertCompletedFile = (scraper, value, url) => {}

  countCompletedFiles = () => {}

  isFileDownloaded = url => false

  areChildrenCompleted = url => false

  insertQueuedDownload = (scraper, loopIndex, incrementIndex, url): number =>
    Promise.resolve(-1)

  markDownloadComplete = (id, filename) => {}

  insertBatchParsedValues = ({
    name,
    parentId,
    parseIndex,
    downloadId,
    value
  }) => Promise.resolve(-1)
  // insertParsedValue = (
  // scraper,
  // downloadId,
  // parentId,
  // parseIndex,
  // value
  // ): number => -1

  getOrderedScrapers = scrapers => {
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
      selectedScrapers
    })

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

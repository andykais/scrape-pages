// @flow
import DB from './database'
import type { Config } from '../configuration/type'
import { RECURSIVE_ORDER_FROM_CHILD_TO_PARENT_SQL } from './sql-templates'

const reverseConfig = (config, parentName = null) => {
  const levelConfig = { ...config, parentName }
  levelConfig.scrapeEach = config.scrapeEach.map(childConfig =>
    reverseConfig(childConfig, config.name)
  )
  return levelConfig
}

class Store {
  config: Config
  db: DB

  constructor(config: Config, downloadFolder: string) {
    this.config = config
    this.db = new DB(downloadFolder)
  }

  insertCompletedFile = (configLevel: string, value: string, url: string) => {}

  countCompletedFiles = () => {}

  isFileDownloaded = (url: string): boolean => false

  getOrderedFromTo = (
    startLevel: string,
    parentLevel: string
  ): Promise<Array<{}>> =>
    this.db.all(RECURSIVE_ORDER_FROM_CHILD_TO_PARENT_SQL, [
      startLevel,
      parentLevel
    ])

  recurseCombineCommonParents = (
    levels: Array<string>
  ): Promise<Array<any>> => {
    const parentPointingConfig = reverseConfig(this.config.scrape)
    console.log(parentPointingConfig)
    return Promise.reject([])
  }

  getLevelsNested = (levels: Array<string>): Promise<Array<any>> => {
    if (levels.length === 1)
      return this.getOrderedFromTo(levels[0], this.config.parse.name)
    else return this.recurseCombineCommonParents(levels)
  }
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

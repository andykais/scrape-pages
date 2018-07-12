import { makeFlatConfig, fillInDefaults } from '../../configuration'
import { findLowestCommonParent } from '../sql-generators/util/find-lowest-common-parent'
import { makeDynamicOrderLevelColumn } from '../sql-generators'

// should only give the higher one when their depths are unequal
describe('make dynamic order level column', () => {
  const galleryPostImgTag = global.__GALLERY_POST_IMG_TAG__
  const fullConfig = fillInDefaults(galleryPostImgTag)
  const flatConfig = makeFlatConfig(fullConfig)

  it(`should always be '0' when there arent any cases`, () => {
    const scrapersToGetOut = ['tag']
    const caseSql = makeDynamicOrderLevelColumn(flatConfig, scrapersToGetOut)
    expect(caseSql).toBe('0')
  })
  it('should only order the higher of two when their depths are unequal', () => {
    const scrapersToGetOut = ['img', 'tag']
    const caseSql = makeDynamicOrderLevelColumn(flatConfig, scrapersToGetOut)
    expect(caseSql).toBe(
      `CASE WHEN pTree.currentScraper = 'post' AND cte.scraper = 'tag' THEN 100 ELSE 0 END`
      // `CASE WHEN pTree.level = 'post' AND cte.startLevel IN ('tag') THEN horizontalIndex ELSE 0 END`
    )
  })
  it('should keep both when they are approaching from the same depth', () => {
    const scrapersToGetOut = ['img-parse', 'tag']
    const caseSql = makeDynamicOrderLevelColumn(flatConfig, scrapersToGetOut)
    expect(caseSql).toBe(
      `CASE WHEN pTree.currentScraper = 'post' AND cte.scraper = 'img-parse' THEN 101 WHEN pTree.currentScraper = 'post' AND cte.scraper = 'tag' THEN 100 ELSE 0 END`
      // `CASE WHEN pTree.level = 'post' AND cte.startLevel IN ('img-parse','tag') THEN horizontalIndex ELSE 0 END`
    )
  })
  it.only(`should combined more than one case clause properly`, () => {
    const scrapersToGetOut = ['img-parse', 'img', 'tag']
    const caseSql = makeDynamicOrderLevelColumn(flatConfig, scrapersToGetOut)
    expect(caseSql).toBe(
      `CASE WHEN pTree.currentScraper = 'post' AND cte.scraper = 'tag' THEN 100 WHEN pTree.currentScraper = 'post' AND cte.scraper = 'img-parse' THEN 101 ELSE 0 END`
      // `CASE WHEN pTree.level = 'post' AND cte.startLevel IN ('tag') THEN horizontalIndex WHEN pTree.level = 'img-parse' AND cte.startLevel IN ('img-parse') THEN horizontalIndex ELSE 0 END`
    )
  })
})

import { makeFlatConfig, normalizeConfig } from '../../configuration/site-traversal'
import { makeWaitingConditionalJoins } from '../sql-generators'
import * as globalVals from '../../../tests/setup'

// should only give the higher one when their depths are unequal
describe('make waiting conditional joins', () => {
  const galleryPostImgTag = globalVals.__GALLERY_POST_IMG_TAG__
  const fullConfig = normalizeConfig(galleryPostImgTag)
  const flatConfig = makeFlatConfig(fullConfig)

  it('should wait for the lowest level respective to its own depth', () => {
    const scrapersToGetOut = ['tag', 'img']
    const joinSql = makeWaitingConditionalJoins(flatConfig, scrapersToGetOut)
    expect(joinSql).toBe(
      `CASE WHEN cte.scraper = 'tag' AND cte.recurseDepth IN (0) THEN cte.id ELSE cte.parentId END`
    )
  })

  it('should have separate WHENs for each level above the lowest', () => {
    const scrapersToGetOut = ['tag', 'img', 'img-parse']
    const joinSql = makeWaitingConditionalJoins(flatConfig, scrapersToGetOut)
    expect(joinSql).toBe(
      `CASE WHEN cte.scraper = 'tag' AND cte.recurseDepth IN (0) THEN cte.id WHEN cte.scraper = 'img-parse' AND cte.recurseDepth IN (0) THEN cte.id ELSE cte.parentId END`
    )
  })

  it('should wait multiple levels when scrapers are multiple depths apart', () => {
    const joinSql = makeWaitingConditionalJoins(flatConfig, ['gallery', 'tag'])
    expect(joinSql).toBe(
      `CASE WHEN cte.scraper = 'gallery' AND cte.recurseDepth IN (0,1) THEN cte.id ELSE cte.parentId END`
    )
  })
})

import { expect } from 'chai'
import { flattenConfig, normalizeConfig } from '../../../settings/config'
import { compileWaitingConditionalJoins } from '../sql-generators'
import * as testingConfigs from '../../../../testing/resources/testing-configs'

describe(__filename, () => {
  const galleryPostImgTag = testingConfigs.GALLERY_POST_IMG_TAG
  const fullConfig = normalizeConfig(galleryPostImgTag)
  const flatConfig = flattenConfig(fullConfig)

  it('should wait for the lowest level respective to its own depth', () => {
    const scrapersToGetOut = ['tag', 'img']
    const joinSql = compileWaitingConditionalJoins(flatConfig, scrapersToGetOut)
    expect(joinSql).to.equal(
      `CASE WHEN cte.scraper = 'tag' AND cte.recurseDepth < 1 THEN cte.id ELSE cte.parentId END`
    )
  })

  it('should have separate WHENs for each level above the lowest', () => {
    const scrapersToGetOut = ['tag', 'img', 'img-parse']
    const joinSql = compileWaitingConditionalJoins(flatConfig, scrapersToGetOut)
    expect(joinSql).to.equal(
      `CASE WHEN cte.scraper = 'tag' AND cte.recurseDepth < 1 OR cte.scraper = 'img-parse' AND cte.recurseDepth < 1 THEN cte.id ELSE cte.parentId END`
    )
  })

  it('should wait multiple levels when scrapers are multiple depths apart', () => {
    const joinSql = compileWaitingConditionalJoins(flatConfig, ['gallery', 'tag'])
    expect(joinSql).to.equal(
      `CASE WHEN cte.scraper = 'gallery' AND cte.recurseDepth < 2 THEN cte.id ELSE cte.parentId END`
    )
  })
})

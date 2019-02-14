import { expect } from 'chai'
import { flattenConfig, normalizeConfig } from '../../../settings/config'
import { makeDynamicOrderLevelColumn } from '../sql-generators'
import * as testingConfigs from '../../../../testing/resources/testing-configs'

// should only give the higher one when their depths are unequal
describe('make dynamic order level column', () => {
  const galleryPostImgTag = testingConfigs.__GALLERY_POST_IMG_TAG__
  const fullConfig = normalizeConfig(galleryPostImgTag)
  const flatConfig = flattenConfig(fullConfig)

  it(`should always be '0' when there arent any cases`, () => {
    const scrapersToGetOut = ['tag']
    const caseSql = makeDynamicOrderLevelColumn(flatConfig, scrapersToGetOut)
    expect(caseSql).to.be.equal('0')
  })
  it('should order when the one is higher than the other at the same depth', () => {
    const scrapersToGetOut = ['img', 'tag']
    const caseSql = makeDynamicOrderLevelColumn(flatConfig, scrapersToGetOut)
    expect(caseSql).to.be.equal(
      `CASE WHEN cte.scraper = 'img' AND recurseDepth = 1 THEN 1000 WHEN cte.scraper = 'tag' AND recurseDepth = 1 THEN 100 ELSE 10000 END`
    )
  })
  it('should keep order at the same recurseDepth when they are approaching from the same depth', () => {
    const scrapersToGetOut = ['img-parse', 'tag']
    const caseSql = makeDynamicOrderLevelColumn(flatConfig, scrapersToGetOut)
    expect(caseSql).to.be.equal(
      `CASE WHEN cte.scraper = 'img-parse' AND recurseDepth = 0 THEN 101 WHEN cte.scraper = 'tag' AND recurseDepth = 0 THEN 100 ELSE 1000 END`
    )
  })
  it(`should combine several approaching different depths properly`, () => {
    const scrapersToGetOut = ['img-parse', 'img', 'tag']
    const caseSql = makeDynamicOrderLevelColumn(flatConfig, scrapersToGetOut)
    expect(caseSql).to.be.equal(
      `CASE WHEN cte.scraper = 'img-parse' AND recurseDepth = 0 THEN 101 WHEN cte.scraper = 'img' AND recurseDepth = 0 THEN 1000 WHEN cte.scraper = 'tag' AND recurseDepth = 1 THEN 100 ELSE 10000 END`
    )
  })
})

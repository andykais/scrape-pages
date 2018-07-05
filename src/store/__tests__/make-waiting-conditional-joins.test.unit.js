import { makeFlatConfig, fillInDefaults } from '../../configuration'
import { findLowestCommonParent } from '../sql-generators/util/find-lowest-common-parent'
import { makeWaitingConditionalJoins } from '../sql-generators'

// should only give the higher one when their depths are unequal
describe('make waiting conditional joins', () => {
  const galleryPostImgTag = global.__GALLERY_POST_IMG_TAG__
  const fullConfig = fillInDefaults(galleryPostImgTag)
  const flatConfig = makeFlatConfig(fullConfig)

  it('should wait for the lowest level respective to its own depth', () => {
    const scrapersToGetOut = [flatConfig['tag'], flatConfig['img']]
    const joinSql = makeWaitingConditionalJoins(flatConfig, scrapersToGetOut)
    expect(joinSql).toBe(
      `CASE WHEN cte.startLevel = 'tag' AND cte.recurseDepth IN ('0') THEN cte.id ELSE cte.parentId END`
    )
  })

  it('should have separate WHENs for each level above the lowest', () => {
    const scrapersToGetOut = [
      flatConfig['tag'],
      flatConfig['img'],
      flatConfig['img-parse']
    ]
    const joinSql = makeWaitingConditionalJoins(flatConfig, scrapersToGetOut)
    expect(joinSql).toBe(
      `CASE WHEN cte.startLevel = 'tag' AND cte.recurseDepth IN ('0') THEN cte.id WHEN cte.startLevel = 'img-parse' AND cte.recurseDepth IN ('0') THEN cte.id ELSE cte.parentId END`
    )
  })
})

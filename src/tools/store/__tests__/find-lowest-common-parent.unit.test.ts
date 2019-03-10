import { expect } from 'chai'
import { flattenConfig, normalizeConfig } from '../../../settings/config'
import { findLowestCommonParent } from '../sql-generators/util/find-lowest-common-parent'
import * as testingConfigs from '../../../../testing/resources/testing-configs'

describe('find lowest common parent', () => {
  const galleryPostImgTag = testingConfigs.GALLERY_POST_IMG_TAG
  const fullConfig = normalizeConfig(galleryPostImgTag)
  const flatConfig = flattenConfig(fullConfig)

  it('should select the proper parent from flat config', () => {
    const parent = findLowestCommonParent(
      flatConfig,
      flatConfig.getOrThrow('img'),
      flatConfig.getOrThrow('tag')
    )
    expect(parent).to.deep.equal(flatConfig.getOrThrow('post'))
  })

  it('should select one of the two if one is a child of the other', () => {
    const parent = findLowestCommonParent(
      flatConfig,
      flatConfig.getOrThrow('img-parse'),
      flatConfig.getOrThrow('img')
    )
    expect(parent).to.deep.equal(flatConfig.getOrThrow('img-parse'))
  })

  it('should select one of the two if one is a child of the other (toplevel)', () => {
    const parent = findLowestCommonParent(
      flatConfig,
      flatConfig.getOrThrow('gallery'),
      flatConfig.getOrThrow('post')
    )
    expect(parent).to.deep.equal(flatConfig.getOrThrow('gallery'))
  })
})

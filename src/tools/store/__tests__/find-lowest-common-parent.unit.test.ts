import { expect } from 'chai'
import { makeFlatConfig, normalizeConfig } from '../../../settings/config'
import { findLowestCommonParent } from '../sql-generators/util/find-lowest-common-parent'
import * as testingConfigs from '../../../../testing/resources/testing-configs'

describe('find lowest common parent', () => {
  const galleryPostImgTag = testingConfigs.__GALLERY_POST_IMG_TAG__
  const fullConfig = normalizeConfig(galleryPostImgTag)
  const flatConfig = makeFlatConfig(fullConfig)

  it('should select the proper parent from flat config', () => {
    const parent = findLowestCommonParent(
      flatConfig,
      flatConfig['img'],
      flatConfig['tag']
    )
    expect(parent).to.be.deep.equal(flatConfig['post'])
  })

  it('should select one of the two if one is a child of the other', () => {
    const parent = findLowestCommonParent(
      flatConfig,
      flatConfig['img-parse'],
      flatConfig['img']
    )
    expect(parent).to.be.deep.equal(flatConfig['img-parse'])
  })

  it('should select one of the two if one is a child of the other (toplevel)', () => {
    const parent = findLowestCommonParent(
      flatConfig,
      flatConfig['gallery'],
      flatConfig['post']
    )
    expect(parent).to.be.deep.equal(flatConfig['gallery'])
  })
})

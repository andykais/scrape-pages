import { expect } from 'chai'
import { FMap } from '../../../util/map'
import { FlatConfig } from '../types'
import { normalizeConfig, flattenConfig } from '../'
import * as testingConfigs from '../../../../testing/resources/testing-configs'

describe(__filename, () => {
  const galleryPostImgTag = testingConfigs.GALLERY_POST_IMG_TAG

  const configForPieces = galleryPostImgTag as any
  const flatConfigGuess: FlatConfig = FMap.fromObject({
    gallery: {
      depth: 0,
      horizontalIndex: 0,
      name: 'gallery',
      parentName: undefined,
      mergeParent: false,
      configAtPosition: configForPieces.flow[0]
    },
    post: {
      depth: 1,
      horizontalIndex: 0,
      name: 'post',
      parentName: 'gallery',
      mergeParent: false,
      configAtPosition: configForPieces.flow[1]
    },
    'img-parse': {
      depth: 2,
      horizontalIndex: 1,
      name: 'img-parse',
      parentName: 'post',
      mergeParent: false,
      configAtPosition: configForPieces.flow[1].branch[1][0]
    },
    img: {
      depth: 3,
      horizontalIndex: 0,
      name: 'img',
      parentName: 'img-parse',
      mergeParent: false,
      configAtPosition: configForPieces.flow[0].branch[1][1]
    },
    tag: {
      depth: 2,
      horizontalIndex: 0,
      name: 'tag',
      parentName: 'post',
      mergeParent: false,
      configAtPosition: configForPieces.flow[0].branch[0][0]
    }
  })

  it('matches expected flat config', () => {
    const fullConfig = normalizeConfig(galleryPostImgTag)
    const flatConfig = flattenConfig(fullConfig)
    expect([...flatConfig]).to.have.deep.members([...flatConfigGuess])
  })
})

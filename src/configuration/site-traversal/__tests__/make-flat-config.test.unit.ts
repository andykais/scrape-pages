import { expect } from 'chai'
import { FlatConfig } from '../types'
import { normalizeConfig, makeFlatConfig } from '../'
import * as globalVals from '../../../../tests/setup'

describe('config recurser', () => {
  const galleryPostImgTag = globalVals.__GALLERY_POST_IMG_TAG__

  const flatConfigGuess: FlatConfig = {
    gallery: {
      depth: 0,
      horizontalIndex: 0,
      name: 'gallery',
      parentName: null
    },
    post: {
      depth: 1,
      horizontalIndex: 0,
      name: 'post',
      parentName: 'gallery'
    },
    'img-parse': {
      depth: 2,
      horizontalIndex: 1,
      name: 'img-parse',
      parentName: 'post'
    },
    img: {
      depth: 3,
      horizontalIndex: 0,
      name: 'img',
      parentName: 'img-parse'
    },
    tag: {
      depth: 2,
      horizontalIndex: 0,
      name: 'tag',
      parentName: 'post'
    }
  }

  it('matches expected flat config', () => {
    const fullConfig = normalizeConfig(galleryPostImgTag)
    const flatConfig = makeFlatConfig(fullConfig)
    expect(flatConfig).to.be.deep.equal(flatConfigGuess)
  })
})

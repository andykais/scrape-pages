import { fillInDefaults, makeFlatConfig } from '../'

describe('config recurser', () => {
  const galleryPostImgTag = global.__GALLERY_POST_IMG_TAG__

  const flatConfigGuess = {
    gallery: {
      depth: 0,
      name: 'gallery',
      parentName: null
    },
    post: {
      depth: 1,
      name: 'post',
      parentName: 'gallery'
    },
    'img-parse': {
      depth: 2,
      name: 'img-parse',
      parentName: 'post'
    },
    img: {
      depth: 3,
      name: 'img',
      parentName: 'img-parse'
    },
    tag: {
      depth: 2,
      name: 'tag',
      parentName: 'post'
    }
  }

  test('flat config matches expected', () => {
    const fullConfig = fillInDefaults(galleryPostImgTag)
    const flatConfig = makeFlatConfig(fullConfig)
    expect(flatConfig).toStrictEqual(flatConfigGuess)
  })
})

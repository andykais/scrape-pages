import { ScraperInit, ConfigInit } from '../../../src/settings/config/types'

const gallery = {
  name: 'gallery',
  download: `http://increment-gallery-site.com/gallery-page/{{'+' 1 index }}.html`,
  parse: {
    selector: 'li > a',
    attribute: 'href'
  },
  incrementUntil: 'failed-download' as 'failed-download'
}
const imagePage = {
  name: 'image-page',
  download: 'http://increment-gallery-site.com{{ value }}'
}
const tag = {
  name: 'tag',
  parse: '#tags > li'
}
const imagePageParse = {
  name: 'image-page-parse',
  parse: {
    selector: 'img',
    attribute: 'src'
  }
}
const image = {
  name: 'image',
  download: {
    urlTemplate: 'http://increment-gallery-site.com{{ value }}',
    read: false,
    write: true
  }
}

// normal (change back after fixing issue with merging)
// export const config: ConfigInit = {
//   flow: [
//     gallery,
//     {
//       scrape: imagePage,
//       branch: [[tag], [imagePageParse, image]]
//     }
//   ]
// }

export const config: ConfigInit = {
  flow: [
    gallery,
    {
      scrape: imagePage,
      branch: [
        [
          {
            scrape: { name: 'identity' },
            branch: [[tag], [imagePageParse, image]]
          }
        ]
      ]
    }
  ]
}

export const configWithLimit: ConfigInit = {
  flow: [
    {
      ...gallery,
      parse: {
        selector: 'li > a',
        attribute: 'href',
        limit: 1
      }
    },
    {
      scrape: imagePage,
      branch: [[tag], [imagePageParse, image]]
    }
  ]
}

export const configMerging: ConfigInit = {
  flow: [
    {
      scrape: gallery,
      branch: [
        [imagePage],
        // TODO add this when we get the existing working
        // [{ name: 'identity-a' }, { name: 'identity-b' }]
      ]
    },
    {
      scrape: {
        name: 'identity'
      },
      branch: [[tag], [imagePageParse, image]]
    }
  ]
}
// export const configMerging: ConfigInit = {
//   flow: [
//     {
//       scrape: gallery,
//       branch: [[{ name: 'identity' }]]
//     },
//     // { name: 'identity' },
//     {
//       scrape: imagePage,
//       branch: [[tag], [imagePageParse, image]]
//     }
//   ]
// }

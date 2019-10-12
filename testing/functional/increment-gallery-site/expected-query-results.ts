import { QueryResult } from '../../../src/tools/store/querier-entrypoint'

export const expected: { [queryStr: string]: QueryResult } = {
  '{"scrapers":["image"],"groupBy":"image"}': [
    {
      image: [
        {
          id: 1,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://increment-gallery-site.com/image/the.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/increment-gallery-site/image/7/7.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ]
    },
    {
      image: [
        {
          id: 2,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://increment-gallery-site.com/image/quick.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/increment-gallery-site/image/10/10.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ]
    },
    {
      image: [
        {
          id: 11,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://increment-gallery-site.com/image/brown.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/increment-gallery-site/image/16/16.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ]
    },
    {
      image: [
        {
          id: 12,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://increment-gallery-site.com/image/fox.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/increment-gallery-site/image/19/19.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ]
    }
  ],
  '{"scrapers":["image","tag"],"groupBy":"image-page"}': [
    {
      image: [
        {
          id: 1,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://increment-gallery-site.com/image/the.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/increment-gallery-site/image/7/7.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ],
      tag: [
        {
          id: 1,
          scraper: 'tag',
          parsedValue: 'one',
          downloadData: null,
          filename: null,
          byteLength: null,
          complete: 1
        },
        {
          id: 1,
          scraper: 'tag',
          parsedValue: 'two',
          downloadData: null,
          filename: null,
          byteLength: null,
          complete: 1
        }
      ]
    },
    {
      image: [
        {
          id: 2,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://increment-gallery-site.com/image/quick.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/increment-gallery-site/image/10/10.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ],
      tag: [
        {
          id: 2,
          scraper: 'tag',
          parsedValue: 'one',
          downloadData: null,
          filename: null,
          byteLength: null,
          complete: 1
        },
        {
          id: 2,
          scraper: 'tag',
          parsedValue: 'two',
          downloadData: null,
          filename: null,
          byteLength: null,
          complete: 1
        }
      ]
    },
    {
      image: [
        {
          id: 11,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://increment-gallery-site.com/image/brown.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/increment-gallery-site/image/16/16.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ],
      tag: [
        {
          id: 11,
          scraper: 'tag',
          parsedValue: 'four',
          downloadData: null,
          filename: null,
          byteLength: null,
          complete: 1
        },
        {
          id: 11,
          scraper: 'tag',
          parsedValue: 'five',
          downloadData: null,
          filename: null,
          byteLength: null,
          complete: 1
        }
      ]
    },
    {
      image: [
        {
          id: 12,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://increment-gallery-site.com/image/fox.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/increment-gallery-site/image/19/19.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ],
      tag: [
        {
          id: 12,
          scraper: 'tag',
          parsedValue: 'three',
          downloadData: null,
          filename: null,
          byteLength: null,
          complete: 1
        },
        {
          id: 12,
          scraper: 'tag',
          parsedValue: 'four',
          downloadData: null,
          filename: null,
          byteLength: null,
          complete: 1
        },
        {
          id: 12,
          scraper: 'tag',
          parsedValue: 'five',
          downloadData: null,
          filename: null,
          byteLength: null,
          complete: 1
        }
      ]
    }
  ]
}

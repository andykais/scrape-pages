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
            '["http://scrape-next-site.com/image/the.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/scrape-next-site/image/10/10.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ]
    },
    {
      image: [
        {
          id: 1,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://scrape-next-site.com/image/quick.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/scrape-next-site/image/13/13.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ]
    },
    {
      image: [
        {
          id: 5,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://scrape-next-site.com/image/brown.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/scrape-next-site/image/20/20.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ]
    },
    {
      image: [
        {
          id: 5,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://scrape-next-site.com/image/fox.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/scrape-next-site/image/23/23.jpg',
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
            '["http://scrape-next-site.com/image/the.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/scrape-next-site/image/10/10.jpg',
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
          id: 1,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://scrape-next-site.com/image/quick.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/scrape-next-site/image/13/13.jpg',
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
          id: 5,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://scrape-next-site.com/image/brown.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/scrape-next-site/image/20/20.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ],
      tag: [
        {
          id: 5,
          scraper: 'tag',
          parsedValue: 'four',
          downloadData: null,
          filename: null,
          byteLength: null,
          complete: 1
        },
        {
          id: 5,
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
          id: 5,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://scrape-next-site.com/image/fox.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/home/andrew/Build/dev/scrape-pages.after-force/testing/functional/.run-output/scrape-next-site/image/23/23.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ],
      tag: [
        {
          id: 5,
          scraper: 'tag',
          parsedValue: 'three',
          downloadData: null,
          filename: null,
          byteLength: null,
          complete: 1
        },
        {
          id: 5,
          scraper: 'tag',
          parsedValue: 'four',
          downloadData: null,
          filename: null,
          byteLength: null,
          complete: 1
        },
        {
          id: 5,
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

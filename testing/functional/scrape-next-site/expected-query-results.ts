import { SelectedRow as OrderedScrapersRow } from '../../../src/tools/store/queries/select-ordered-scrapers'

export const expected: { [queryStr: string]: OrderedScrapersRow[][] } = {
  '{"scrapers":["image"],"groupBy":"image"}': [
    [
      {
        id: 1,
        scraper: 'image',
        parsedValue: '',
        downloadData: '["http://scrape-next-site.com/image/the.jpg",{"headers":{},"method":"GET"}]',
        filename:
          '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/scrape-next-site/image/10/http___scrape-next-site.com_image_the.jpg',
        byteLength: '17.0',
        complete: 1
      }
    ],
    [
      {
        id: 1,
        scraper: 'image',
        parsedValue: '',
        downloadData:
          '["http://scrape-next-site.com/image/quick.jpg",{"headers":{},"method":"GET"}]',
        filename:
          '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/scrape-next-site/image/13/http___scrape-next-site.com_image_quick.jpg',
        byteLength: '17.0',
        complete: 1
      }
    ],
    [
      {
        id: 5,
        scraper: 'image',
        parsedValue: '',
        downloadData:
          '["http://scrape-next-site.com/image/brown.jpg",{"headers":{},"method":"GET"}]',
        filename:
          '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/scrape-next-site/image/20/http___scrape-next-site.com_image_brown.jpg',
        byteLength: '17.0',
        complete: 1
      }
    ],
    [
      {
        id: 5,
        scraper: 'image',
        parsedValue: '',
        downloadData: '["http://scrape-next-site.com/image/fox.jpg",{"headers":{},"method":"GET"}]',
        filename:
          '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/scrape-next-site/image/23/http___scrape-next-site.com_image_fox.jpg',
        byteLength: '17.0',
        complete: 1
      }
    ]
  ],

  '{"scrapers":["image","tag"],"groupBy":"image-page"}': [
    [
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
      },
      {
        id: 1,
        scraper: 'image',
        parsedValue: '',
        downloadData: '["http://scrape-next-site.com/image/the.jpg",{"headers":{},"method":"GET"}]',
        filename:
          '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/scrape-next-site/image/10/http___scrape-next-site.com_image_the.jpg',
        byteLength: '17.0',
        complete: 1
      }
    ],
    [
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
      },
      {
        id: 1,
        scraper: 'image',
        parsedValue: '',
        downloadData:
          '["http://scrape-next-site.com/image/quick.jpg",{"headers":{},"method":"GET"}]',
        filename:
          '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/scrape-next-site/image/13/http___scrape-next-site.com_image_quick.jpg',
        byteLength: '17.0',
        complete: 1
      }
    ],
    [
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
      },
      {
        id: 5,
        scraper: 'image',
        parsedValue: '',
        downloadData:
          '["http://scrape-next-site.com/image/brown.jpg",{"headers":{},"method":"GET"}]',
        filename:
          '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/scrape-next-site/image/20/http___scrape-next-site.com_image_brown.jpg',
        byteLength: '17.0',
        complete: 1
      }
    ],
    [
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
      },
      {
        id: 5,
        scraper: 'image',
        parsedValue: '',
        downloadData: '["http://scrape-next-site.com/image/fox.jpg",{"headers":{},"method":"GET"}]',
        filename:
          '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/scrape-next-site/image/23/http___scrape-next-site.com_image_fox.jpg',
        byteLength: '17.0',
        complete: 1
      }
    ]
  ]
}

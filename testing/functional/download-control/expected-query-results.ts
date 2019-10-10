import { QueryResult } from '../../../src/tools/store/querier-entrypoint'

export const expected: { [queryStr: string]: QueryResult } = {
  '{"scrapers":["postTitle"]}': [
    {
      postTitle: [
        {
          id: 1,
          scraper: 'postTitle',
          parsedValue: 'The',
          downloadData: '["http://download-control.com/post/1.html",{"headers":{},"method":"GET"}]',
          filename: null,
          byteLength: '35.0',
          complete: 1
        },
        {
          id: 2,
          scraper: 'postTitle',
          parsedValue: 'Quick',
          downloadData: '["http://download-control.com/post/2.html",{"headers":{},"method":"GET"}]',
          filename: null,
          byteLength: '37.0',
          complete: 1
        },
        {
          id: 3,
          scraper: 'postTitle',
          parsedValue: 'Brown',
          downloadData: '["http://download-control.com/post/3.html",{"headers":{},"method":"GET"}]',
          filename: null,
          byteLength: '37.0',
          complete: 1
        },
        {
          id: 4,
          scraper: 'postTitle',
          parsedValue: 'Fox',
          downloadData: '["http://download-control.com/post/4.html",{"headers":{},"method":"GET"}]',
          filename: null,
          byteLength: '35.0',
          complete: 1
        },
        {
          id: 5,
          scraper: 'postTitle',
          parsedValue: 'Jumped',
          downloadData: '["http://download-control.com/post/5.html",{"headers":{},"method":"GET"}]',
          filename: null,
          byteLength: '38.0',
          complete: 1
        }
      ]
    }
  ],
  // [
  // {
  //   image: [
  //     {
  //       id: 1,
  //       scraper: 'image',
  //       parsedValue: '',
  //       downloadData:
  //         '["http://increment-gallery-site.com/image/the.jpg",{"headers":{},"method":"GET"}]',
  //       filename:
  //         '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/increment-gallery-site/image/7/http___increment-gallery-site.com_image_the.jpg',
  //       byteLength: '17.0',
  //       complete: 1
  //     }
  //   ]
  // },
  // {
  //   image: [
  //     {
  //       id: 2,
  //       scraper: 'image',
  //       parsedValue: '',
  //       downloadData:
  //         '["http://increment-gallery-site.com/image/quick.jpg",{"headers":{},"method":"GET"}]',
  //       filename:
  //         '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/increment-gallery-site/image/10/http___increment-gallery-site.com_image_quick.jpg',
  //       byteLength: '17.0',
  //       complete: 1
  //     }
  //   ]
  // },
  // {
  //   image: [
  //     {
  //       id: 11,
  //       scraper: 'image',
  //       parsedValue: '',
  //       downloadData:
  //         '["http://increment-gallery-site.com/image/brown.jpg",{"headers":{},"method":"GET"}]',
  //       filename:
  //         '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/increment-gallery-site/image/16/http___increment-gallery-site.com_image_brown.jpg',
  //       byteLength: '17.0',
  //       complete: 1
  //     }
  //   ]
  // },
  // {
  //   image: [
  //     {
  //       id: 12,
  //       scraper: 'image',
  //       parsedValue: '',
  //       downloadData:
  //         '["http://increment-gallery-site.com/image/fox.jpg",{"headers":{},"method":"GET"}]',
  //       filename:
  //         '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/increment-gallery-site/image/19/http___increment-gallery-site.com_image_fox.jpg',
  //       byteLength: '17.0',
  //       complete: 1
  //     }
  //   ]
  // }
  // ],

  '{"scrapers":["image","tag"],"groupBy":"image-page"}': [
    {
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
      ],
      image: [
        {
          id: 1,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://increment-gallery-site.com/image/the.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/increment-gallery-site/image/7/http___increment-gallery-site.com_image_the.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ]
    },
    {
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
      ],
      image: [
        {
          id: 2,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://increment-gallery-site.com/image/quick.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/increment-gallery-site/image/10/http___increment-gallery-site.com_image_quick.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ]
    },
    {
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
      ],
      image: [
        {
          id: 11,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://increment-gallery-site.com/image/brown.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/increment-gallery-site/image/16/http___increment-gallery-site.com_image_brown.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ]
    },
    {
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
      ],
      image: [
        {
          id: 12,
          scraper: 'image',
          parsedValue: '',
          downloadData:
            '["http://increment-gallery-site.com/image/fox.jpg",{"headers":{},"method":"GET"}]',
          filename:
            '/Users/andrew/Code/scratchwork/scrape-pages.linux/testing/functional/.run-output/increment-gallery-site/image/19/http___increment-gallery-site.com_image_fox.jpg',
          byteLength: '17.0',
          complete: 1
        }
      ]
    }
  ]
}

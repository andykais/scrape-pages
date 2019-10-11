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
  ]
}

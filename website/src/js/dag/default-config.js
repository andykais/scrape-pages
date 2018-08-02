export default {
  input: [],
  scrape: {
    name: 'mainpage',
    download: {
      increment: 0,
      initialIndex: 0,
      headerTemplates: {},
      cookieTemplates: {},
      method: 'GET',
      urlTemplate: 'mainpage'
    },
    parse: { expect: 'html', selector: 'batchID' },
    scrapeEach: [
      {
        name: 'grid',
        download: {
          increment: 1,
          initialIndex: 0,
          headerTemplates: {},
          cookieTemplates: {},
          method: 'GET',
          urlTemplate: 'batchPage{batchID}'
        },
        scrapeNext: {
          name: 'next-batchid',
          parse: {
            selector: 'batchID',
            expect: 'html'
          }
        },
        scrapeEach: [
          {
            name: 'tag',
            parse: { expect: 'html', selector: 'span.tag' },
            scrapeEach: []
          },
          {
            name: 'parse-image-page',
            parse: { expect: 'html', selector: 'li a.images' },
            scrapeEach: [
              {
                name: 'image-page',
                download: {
                  increment: 0,
                  initialIndex: 0,
                  headerTemplates: {},
                  cookieTemplates: {},
                  method: 'GET',
                  urlTemplate: 'imagepage{imageID}'
                },
                parse: { expect: 'html', selector: 'img' },
                scrapeEach: [
                  {
                    name: 'image',
                    download: {
                      increment: 0,
                      initialIndex: 0,
                      headerTemplates: {},
                      cookieTemplates: {},
                      method: 'GET',
                      urlTemplate: '{src}'
                    },
                    scrapeEach: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}

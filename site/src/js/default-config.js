export default {
  scrape: {
    name: 'homepage',
    download: 'example.com',
    parse: '.special-id',
    scrapeEach: {
      name: 'paginated',
      download: {
        urlTemplate: 'example.com/?id={value}/{index}',
        increment: 1,
      },
      scrapeEach: [
        {
          name: 'title',
          parse: '.title',
        },
        {
          name: 'image-parse',
          parse: {
            selector: 'img',
            attribute: 'src',
          },
          scrapeEach: {
            name: 'image',
            download: '{value}',
          },
        },
      ],
    },
  },
}

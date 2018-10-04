export default {
  input: 'username',
  scrape: {
    download: {
      increment: 50,
      urlTemplate:
        'https://{username}.tumblr.com/api/read/json?start={_index}&num=50'
    },
    // TODO add this to type
    // regexCleanup: 'var tumblr_api_read = ',
    scrapeEach: {
      name: 'parse-json',
      parse: {
        expect: 'json',
        selector: 'posts[type:photo]'
      },
      scrapeEach: [
        {
          name: 'image',
          parse: {
            selector: 'photo-url-1280',
            regexCleanup: {
              select: 'https://d+?.',
              replace: 'https://'
            }
          },
          scrapeEach: {
            download: '{value}'
          }
        },
        {
          name: 'tags',
          parse: {
            selector: 'tags'
          }
        }
      ]
    }
  }
}

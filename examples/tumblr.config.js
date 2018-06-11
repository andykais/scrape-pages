export default {
  input: 'username',
  scrape: {
    build_url: {
      increment: true,
      increment_by: 50,
      template:
        'https://{username}.tumblr.com/api/read/json?start={_index}&num=50',
      regex_cleanup: 'var tumblr_api_read = '
    },
    scrape_each: {
      parse: {
        expect: 'json',
        selector: 'posts[type:photo]'
      },
      build_url: false,
      scrape_each: [
        {
          name: 'image',
          parse: {
            selector: 'photo-url-1280',
            regex_cleanup: {
              select: 'https://d+?.',
              replace: 'https://'
            }
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

export default {
  input: 'username',
  scrape: {
    build_url: {
      increment: true,
      increment_by: 50,
      url_template:
        'https://{username}.tumblr.com/api/read/json?start={_index}&num=50',
      regex_cleanup: 'var tumblr_api_read = '
    },
    expect: 'json',
    for_each: {
      criteria: {
        selector: 'posts[type:photo]',
        expect_url_for_download: false
      },
      expect: 'json',
      for_each: [
        {
          name: 'image',
          criteria: {
            selector: 'photo-url-1280',
            regex_cleanup: {
              select: 'https://d+?.',
              replace: 'https://'
            }
          }
        },
        {
          name: 'tag',
          criteria: {
            selector: 'tags'
          }
        }
      ]
    }
  }
}

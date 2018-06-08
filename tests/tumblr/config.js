export default {
  input: 'username',
  next_url: {
    type: 'increment',
    build_url:
      'https://{artist}.deviantart.com/gallery/?catpath=/&offset={_page}',
    increment_by: 50,
    regex_cleanup: {
      select: 'var tumblr_api_read = ',
      replace: ''
    },
    expect: 'json'
  },
  scrape_criteria: {
    criteria: {
      selector: 'posts[type:photo].photo-url-1280',
      regex_cleanup: {
        select: 'https://d+?.',
        replace: 'https://'
      }
    }
  }
}

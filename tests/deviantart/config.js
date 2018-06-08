export default {
  input: ['artist'],
  next_url: {
    type: 'increment',
    build_url:
      'https://{artist}.deviantart.com/gallery/?catpath=/&offset={_page}',
    increment_by: 24
  },
  scrape_criteria: {
    criteria: {
      selector: '.torpedo-thumb-link',
      attribute: 'href'
    },
    for_each: {
      criteria: {
        selector: '.dev-view-deviation',
        attribute: 'src'
      }
    }
  }
}

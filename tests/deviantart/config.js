export default {
  input: ['artist'],
  scrape: {
    build_url: {
      increment: true,
      increment_by: 24,
      url_template:
        'https://{artist}.deviantart.com/gallery/?catpath=/&offset={_index}'
    },
    for_each: {
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
}

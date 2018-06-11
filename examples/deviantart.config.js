export default {
  input: 'artist',
  scrape: {
    build_url: {
      increment: true,
      increment_by: 24,
      template:
        'https://{artist}.deviantart.com/gallery/?catpath=/&offset={_index}'
    },
    scrape_each: {
      parse: {
        selector: '.torpedo-thumb-link',
        attribute: 'href'
      },
      scrape_each: {
        parse: {
          singular: true,
          selector: '.dev-view-deviation',
          attribute: 'src'
        }
      }
    }
  }
}

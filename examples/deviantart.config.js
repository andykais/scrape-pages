export default {
  input: 'artist',
  scrape: {
    download: {
      increment: 24,
      urlTemplate:
        'https://{artist}.deviantart.com/gallery/?catpath=/&offset={_index}'
    },
    parse: {
      selector: '.torpedo-thumb-link',
      attribute: 'href'
    },
    scrapeEach: {
      download: '{value}',
      parse: {
        selector: '.dev-view-deviation',
        attribute: 'src'
      },
      scrapeEach: {
        download: '{value}'
      }
    }
  }
}

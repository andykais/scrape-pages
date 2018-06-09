export default {
  scrape: {
    build_url: {
      template: 'https://www.nasa.gov/multimedia/imagegallery/iotd.html'
    },
    scrape_each: {
      parse: {
        selector: '.gallery-card img',
        attribute: 'src'
      }
    }
  }
}

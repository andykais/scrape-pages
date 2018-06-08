export default {
  scrape: {
    build_url: {
      url_template: 'https://www.nasa.gov/multimedia/imagegallery/iotd.html'
    },
    for_each: {
      criteria: {
        selector: '.gallery-card img',
        attribute: 'src'
      }
    }
  }
}

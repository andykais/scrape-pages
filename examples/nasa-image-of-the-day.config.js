// TODO edit to work using json api
export default {
  scrape: {
    download: {
      template: 'https://www.nasa.gov/multimedia/imagegallery/iotd.html'
    },
    parse: {
      selector: '.gallery-card img',
      attribute: 'src'
    },
    scrapeEach: {
      download: '{value}'
    }
  }
}

const { resolve } = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  mode: 'development',
  devtool: 'source-map',
  entry: {
    index: resolve(__dirname, `./src/index.js`),
    'normalize-config/index': resolve(
      __dirname,
      './src/configuration/normalize'
    )
  },
  output: {
    path: resolve(__dirname, `${__dirname}/lib`),
    filename: '[name].js',
    library: 'scrape-pages',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.sql$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins: [],
  externals: [nodeExternals()]
}

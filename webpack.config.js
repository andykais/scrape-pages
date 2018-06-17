const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  mode: 'development',
  devtool: 'source-map',
  // entry: ['babel-polyfill', `${__dirname}/src/index.js`],
  entry: `${__dirname}/src/index.js`,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  plugins: [],
  output: {
    path: `${__dirname}/dist`,
    filename: 'main.js',
    library: 'scrape-pages',
    libraryTarget: 'umd',
  },
  externals: [nodeExternals()]
}

const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  mode: 'development',
  devtool: 'source-map',
  entry: {
    main: `${__dirname}/src/index.js`,
    'normalize-config': './src/configuration/normalize'
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
  output: {
    path: `${__dirname}/lib`,
    filename: '[name].js',
    library: 'scrape-pages',
    libraryTarget: 'umd'
  },
  externals: [nodeExternals()]
}

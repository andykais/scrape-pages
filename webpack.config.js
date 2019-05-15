const path = require('path')
const glob = require('glob')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

const sourceFiles = glob
  .sync('./src/**/*.ts', { ignore: './src/**/*.test.ts' })
  .reduce((acc, file) => {
    acc[file.replace(/^\.\/src\/(.*?)\.ts$/, (_, filename) => filename)] = file
    return acc
  }, {})

module.exports = (env, { mode = 'development' } = {}) => ({
  target: 'node',
  node: {
    __dirname: true,
    __filename: true
  },
  mode,
  devtool: 'source-map',
  entry: sourceFiles,
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    library: 'scrape-pages',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.ts']
  },
  module: {
    rules: [
      {
        test: content => env === 'coverage' && /\.ts$/.test(content),
        exclude: /node_modules|\.test.ts$/,
        loader: 'istanbul-instrumenter-loader',
        options: { esModules: true },
        enforce: 'post'
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'awesome-typescript-loader',
        options: { compiler: 'ttypescript', configFileName: 'tsconfig/tsconfig.json' }
      },
      {
        test: /\.sql$/,
        use: 'raw-loader'
      }
    ]
  },
  optimization: {
    minimize: false
  },
  plugins: [new CopyWebpackPlugin(['package.json', 'package-lock.json', 'LICENSE', 'README.md'])],
  externals: [nodeExternals()]
})

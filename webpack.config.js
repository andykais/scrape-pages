const { resolve } = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const TerserPlugin = require('terser-webpack-plugin')
const NodemonPlugin = require('nodemon-webpack-plugin')
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin')

const devPlugins = env => {
  if (env) {
    const plugins = [new CleanTerminalPlugin()]
    if (env.scratchfile !== true) {
      plugins.push(
        new NodemonPlugin({
          script: env.scratchfile,
          watch: [resolve('./lib'), resolve(env.scratchfile)]
        })
      )
    }
    return plugins
  }
  return []
}

module.exports = env => ({
  target: 'node',
  mode: 'development',
  devtool: 'source-map',
  entry: {
    index: './src/index.js',
    'normalize-config': './src/configuration/normalize'
  },
  output: {
    path: resolve(__dirname, 'lib'),
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
  plugins: [
    new CopyWebpackPlugin([
      'package.json',
      'package-lock.json',
      'LICENSE',
      'README.md'
    ]),
    ...devPlugins(env)
  ],
  optimization: {
    minimizer: [new TerserPlugin()]
  },
  externals: [nodeExternals()]
})

const path = require('path')
const glob = require('glob')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WebpackEmitAllPlugin = require('webpack-emit-all-plugin')
const nodeExternals = require('webpack-node-externals')

class ClearTerminalInWatchMode {
  apply(compiler) {
    compiler.hooks.afterCompile.tap('ClearTerminalInWatchMode', () => {
      if (compiler.watchMode) console.clear()
    })
  }
}

const sourceFiles = glob
  .sync('./src/**/*.ts', { ignore: './src/**/*.test.ts' })
  .reduce((acc, file) => {
    acc[file.replace(/^\.\/src\/(.*?)\.ts$/, (_, filename) => filename)] = file
    return acc
  }, {})

const config = {
  target: 'node',
  node: {
    __dirname: true,
    __filename: true
  },
  mode: 'development',
  devtool: 'source-map',
  entry: glob.sync('./src/**/*.ts', { ignore: './src/**/*.test.ts' }).reduce((acc, file) => {
    acc[file.replace(/^\.\/src\/(.*?)\.ts$/, (_, filename) => filename)] = file
    return acc
  }, {}),
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    library: 'scrape-pages',
    libraryTarget: 'commonjs'
  },
  resolve: {
    extensions: ['.ts']
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.runtime\.ts/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: { compiler: 'ttypescript', configFile: 'tsconfig/tsconfig.json' }
      },
      {
        test: /\.sql$/,
        use: 'raw-loader'
      },
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        enforce: 'pre'
      }
    ]
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new CopyWebpackPlugin(['package.json', 'package-lock.json', 'LICENSE', 'README.md']),
    new ClearTerminalInWatchMode()
  ],
  externals: [nodeExternals()]
}

module.exports = (env, { mode = 'development' } = {}) => {
  switch (env) {
    case 'coverage':
      return {
        ...config,
        module: {
          rules: [
            {
              test: /\.(ts|js)/,
              include: resolve('src'),
              loader: 'istanbul-instrumenter-loader',
              options: { esModules: true }
            },
            ...config.module.rules
          ]
        }
      }
    default:
      return config
  }
}

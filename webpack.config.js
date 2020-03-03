const path = require('path')
const typescriptIsTransformer = require('typescript-is/lib/transform-inline/transformer').default
const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'development',
  devtool: 'source-map',

  target: 'node',
  node: {
    __dirname: true,
    __filename: true
  },

  entry: {
    index: './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    library: 'scrape-pages',
    libraryTarget: 'umd'
  },

  resolve: {
    extensions: ['.ts'],
    alias: {
      'scrape-pages': path.resolve(__dirname, 'src')
    }
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          getCustomTransformers: program => ({
            before: [typescriptIsTransformer(program)]
          })
        }
      },
      {
        test: path.resolve(__dirname, 'src/dsl-parser/grammar.ne'),
        loader: 'nearley-loader'
      }
    ]
  }
}

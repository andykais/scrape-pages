const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: __dirname + '/dist'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader'
        ]
      }
    ]
  },
  resolve: {
    alias: {
      'flow-runtime': resolve(
        __dirname,
        'node_modules/flow-runtime/dist/flow-runtime.es2015.js'
      )
    }
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin([
      {
        from: 'CNAME'
      }
    ]),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ]
}

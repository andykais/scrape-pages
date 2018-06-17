const webpack = require('webpack')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
const nodemon = require('nodemon')

const config = require('./webpack.config')

config.plugins.push(
  new ProgressPlugin((percentage, msg, current, active, modulepath) => {
    if (percentage === 1) process.stdout.clearLine(0)
    else process.stdout.write(`${(percentage * 100).toFixed(0)}% ${msg}\r`)
  })
)

process.on('SIGINT', () => process.exit(0))
const initNodemon = (() => {
  let executed = false
  return () => {
    if (!executed) {
      executed = true
      nodemon({
        script: './scratchwork/index.js',
        watch: [`${__dirname}/dist`, `${__dirname}/scratchwork`]
      }).on('restart', () => console.log('Restarting scratchwork/index.js...\n'))
    }
  }
})()

const compiler = webpack(config)
compiler.watch({}, (err, stats) => {
  if (err) {
    console.log(err.stack || err)
    if (err.details) console.log(err.details)
  } else if (stats.hasErrors()) {
    const { errors } = stats.toJson()
    console.log(errors.join('\n\n'))
  } else {
    const minimal = stats.toJson({
      modules: false,
      publicPath: false,
      entrypoints: false,
      cachedAssets: false,
      cached: false,
      children: false,
      chunks: false,
      chunkModules: false,
      chunkOrigins: false,
      chunkGroups: false,
      assets: false,
      warnings: true,
      timings: true,
      colors: true,
      source: false
    })
    console.clear()
    console.log(`built ${minimal.outputPath} in ${minimal.time / 1000}s`)
    console.log(minimal.warnings.join('\n\n'))
    initNodemon()
  }
})

import LZUTF8 from 'lzutf8'
import defaultConfig from './default-config'

const getConfigFromUrl = () => {
  if (window.location.hash) {
    const compressedConfig = window.location.hash.substring(1)
    const config = LZUTF8.decompress(compressedConfig, {
      inputEncoding: 'Base64'
    })
    return JSON.parse(config)
  }
}

const setUrlToConfig = config => {
  const compressedConfig = LZUTF8.compress(config, { outputEncoding: 'Base64' })
  window.history.replaceState(null, '', '#' + compressedConfig)
}

export { setUrlToConfig, getConfigFromUrl }

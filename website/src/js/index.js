import { initDiagram, updateDiagram } from './dag'
import defaultConfig from './default-config'
import { getConfigFromUrl, setUrlToConfig } from './history'
import normalize from 'scrape-pages/normalize-config'

import '../css/index.css'

const thenRender = func => (...args) => {
  func(...args)
  render()
}

const initialConfig = getConfigFromUrl() || defaultConfig

const state = {
  configIsOpen: true,
  valid: true,
  inputConfig: JSON.stringify(initialConfig, null, 2),
  fullConfig: normalize(initialConfig)
}

const elements = {
  shareIcon: null,
  configInputDiv: null,
  configInput: null,
  normalizeButton: null,
  hideButton: null,
  hideButtonIcon: null,
  treeContainer: null,
  flowErrorBlock: null,
  d3Elements: null
}

const stateChangers = {
  handleConfigInput: thenRender(e => {
    try {
      state.inputConfig = e.target.value
      state.fullConfig = normalize(JSON.parse(state.inputConfig))
      state.valid = true
      state.flowError = null
      setUrlToConfig(state.inputConfig)
    } catch (e) {
      if (!['SyntaxError', 'RuntimeTypeError'].includes(e.name)) throw e
      if (e.name === 'RuntimeTypeError') {
        console.log('here')
        state.flowError = e.toString()
      }
      state.valid = false
    }
  }),
  handleHideButtonClick: thenRender(() => {
    state.configIsOpen = !state.configIsOpen
  }),
  handleNormalizeButtonClick: thenRender(() => {
    state.inputConfig = JSON.stringify(state.fullConfig, null, 2)
    setUrlToConfig(state.inputConfig)
  }),
  handleShareIconClick: thenRender(() => {
    window.alert('Just copy the url to share with someone!')
  })
}

const render = () => {
  elements.configInput.value = state.inputConfig
  updateDiagram(elements.d3Elements)(state.fullConfig)
  elements.configInputDiv.className = state.configIsOpen ? '' : 'hidden'
  elements.hideButtonIcon.className = state.configIsOpen
    ? 'fas fa-caret-left'
    : 'fas fa-caret-right'
  elements.configInput.className = state.valid ? '' : 'invalid'
  elements.normalizeButton.disabled = !state.valid
  elements.flowErrorBlock.textContent = state.flowError
  elements.treeContainer.className = state.flowError ? 'hide-tree' : ''
  elements.flowErrorBlock.className = state.flowError ? 'show-error' : ''
}

window.onload = () => {
  elements.shareIcon = document.getElementById('share')
  elements.configInputDiv = document.getElementById('user-input')
  elements.normalizeButton = document.getElementById('normalize-button')
  elements.configInput = document.getElementById('config-input')
  elements.hideButton = document.getElementById('hide-button')
  elements.hideButtonIcon = document.querySelector('#hide-button i')
  elements.treeContainer = document.getElementById('tree-container')
  elements.flowErrorBlock = document.getElementById('flow-error-block')
  elements.d3Elements = initDiagram()

  elements.configInput.oninput = stateChangers.handleConfigInput
  elements.hideButton.onclick = stateChangers.handleHideButtonClick
  elements.normalizeButton.onclick = stateChangers.handleNormalizeButtonClick
  elements.shareIcon.onclick = stateChangers.handleShareIconClick

  render()
}

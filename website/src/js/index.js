import { initDiagram, defaultConfig } from './dag'
// import normalize from 'scrape-pages/normalize-config'

import '../css/index.css'

window.onload = () => {
  const updater = initDiagram()
  updater(defaultConfig);

  const userInput = document.querySelector("#config-input");
  userInput.placeholder = JSON.stringify(defaultConfig, null, 2);
  const updateFromInput = e => {
    try {
      const newConfig = JSON.parse(e.target.value);
      updater(newConfig);
      userInput.className = ''
    } catch (e) {
      if (e.name !== "SyntaxError") throw e;
      userInput.className = 'invalid'
    }
  };
  userInput.onchange = updateFromInput;
  userInput.onkeyup = updateFromInput;
  const inputContainer = document.getElementById('user-input')

  const hideButton = document.getElementById('hide-button')
  let configOpen = true
  hideButton.onclick = () => {
    configOpen = !configOpen
    inputContainer.className = configOpen ? '' : 'hidden'
    const icon = hideButton.children[0]
    icon.className = configOpen ? 'fas fa-caret-left' : 'fas fa-caret-right'
  }
};

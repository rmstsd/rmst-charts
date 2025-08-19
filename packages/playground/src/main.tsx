import 'core-js/es/array'

import './utils/checkUpdate'

import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'antd/dist/reset.css'

import App from './App'

import './main.css'
import { StrictMode } from 'react'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <HashRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <App />
    </HashRouter>
  </StrictMode>
)

document.addEventListener('click', evt => {
  const el = evt.target as HTMLElement

  if (el.tagName === 'BUTTON') {
    el.blur()
  }
})

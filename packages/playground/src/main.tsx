import 'core-js/es/array'

import './utils/checkUpdate'

import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'antd/dist/reset.css'

import App from './App'

import './main.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <HashRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <App />
    </HashRouter>
  </>
)

document.addEventListener('click', evt => {
  const el = evt.target as HTMLElement

  if (el.tagName === 'BUTTON') {
    el.blur()
  }
})

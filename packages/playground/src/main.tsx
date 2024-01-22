import 'core-js/es/array'

import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'antd/dist/reset.css'

import App from './App'

import './main.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <HashRouter>
    <App />
  </HashRouter>
)

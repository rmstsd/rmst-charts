import { useLocation, useRoutes } from 'react-router-dom'

import { findRouteItem, routes } from './main-router/router'
import { useEffect } from 'react'
import { isProd } from './utils'

const App = () => {
  const element = useRoutes(routes)

  const loc = useLocation()

  useEffect(() => {
    const routeItem = findRouteItem(loc.pathname)

    if (routeItem?.uiConfig?.title) {
      document.title = routeItem.uiConfig.title
    }

    document.title = (isProd ? '' : 'dev - ') + document.title
  }, [loc.pathname])

  return element
}

export default App

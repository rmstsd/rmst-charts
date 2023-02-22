import { Button } from 'antd'
import { useRoutes, RouteObject, BrowserRouter } from 'react-router-dom'
import LayoutView from './LayoutView/LayoutView'

export const routes: RouteObject[] = [
  {
    path: 'charts',
    element: <LayoutView />,
    children: [
      {
        path: 'line',
        element: <div>line</div>
      }
    ]
  },
  {
    path: 'rmst-render',
    element: <LayoutView />,
    children: [
      {
        path: 'base',
        element: <div>base</div>
      }
    ]
  },
  {
    path: 'konva',
    element: <LayoutView />
  }
]

const App = () => {
  const element = useRoutes(routes)

  return <>{element}</>
}

export default App

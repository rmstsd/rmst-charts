import { RouteObject, Navigate } from 'react-router-dom'

import newCharts from './router.newCharts'
import rmstRender from './router.rmstRender'
import konva from './router.konva'
import oldCharts from './router.oldCharts'
import other from './router.other'

export type IRouteObject = RouteObject & {
  uiConfig?: { hidden?: boolean; title?: string; icon?: any }
  children?: IRouteObject[]
}

export const routes: IRouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/new-charts/line" replace={true} />,
    uiConfig: { hidden: true }
  },
  newCharts,
  rmstRender,
  konva,
  oldCharts,
  other
]

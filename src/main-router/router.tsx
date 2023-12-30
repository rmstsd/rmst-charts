import type { MenuProps } from 'antd'

import { RouteObject, Navigate } from 'react-router-dom'

import rmstChartsRouteConfig from './1-rmst-charts'
import rmstRenderRouteConfig from './2-rmst-render'
import zrenderRouteConfig from './3-zrender'
import leaferRouteConfig from './4-leafer'
import oldChartsRouteConfig from './5-oldCharts'
import otherRouteConfig from './6-other'

export type IRouteObject = {
  path: RouteObject['path']
  element: RouteObject['element']
  uiConfig?: { hidden?: boolean; title?: string; icon?: any }
  children?: IRouteObject[]
}

export const routes: IRouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/new-charts/line/base" replace={true} />,
    uiConfig: { hidden: true }
  },
  rmstChartsRouteConfig,
  rmstRenderRouteConfig,
  zrenderRouteConfig,
  leaferRouteConfig,
  oldChartsRouteConfig,
  otherRouteConfig
]

export const convertToAntdData = (array: IRouteObject[], recur: boolean, parentKey = ''): MenuProps['items'] => {
  return array
    .filter(item => !item.uiConfig?.hidden)
    .map(item => {
      const key = item.path.startsWith('/') ? item.path : `${parentKey}/${item.path}`

      return Object.assign(
        { label: item.uiConfig?.title || item.path, key },
        recur && item.children && { children: convertToAntdData(item.children, recur, key) }
      )
    })
}

export function findPath(routeObject: IRouteObject) {
  let path = ''

  const dfs = (routeObject: RouteObject) => {
    if (routeObject.path.startsWith('/')) {
      path += routeObject.path
    } else {
      path += '/' + routeObject.path
    }

    if (routeObject.children) {
      dfs(routeObject.children[0])
    }
  }

  dfs(routeObject)

  return path
}

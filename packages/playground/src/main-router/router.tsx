import { Tag, type MenuProps } from 'antd'

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
  uiConfig?: { hidden?: boolean; developing?: boolean; title?: string; icon?: any }
  children?: IRouteObject[]
}

export const routes: IRouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/charts/line/base" replace={true} />,
    uiConfig: { hidden: true }
  },
  rmstChartsRouteConfig,
  rmstRenderRouteConfig,
  zrenderRouteConfig,
  leaferRouteConfig,
  oldChartsRouteConfig,
  otherRouteConfig,
  {
    path: '*',
    element: <Navigate to="/" replace={true} />,
    uiConfig: { hidden: true }
  }
]

export const convertToAntdData = (array: IRouteObject[], recur: boolean, parentKey = ''): MenuProps['items'] => {
  return array
    .filter(item => !item.uiConfig?.hidden)
    .map(item => {
      const key = item.path.startsWith('/') ? item.path : `${parentKey}/${item.path}`

      return Object.assign(
        {
          label: (
            <div className="flex items-center">
              <div className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                {item.uiConfig?.title || item.path} {item.uiConfig?.icon}
              </div>
              {item.uiConfig?.developing && <Tag color="processing">dev</Tag>}
            </div>
          ),
          key
        },
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

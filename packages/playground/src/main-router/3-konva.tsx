import LayoutView from '@/components/LayoutView/LayoutView'

import { IRouteObject } from './router'

import { isProd } from '@/utils'
import Ko from '@/demo/3-konva'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/konva',
  element: <LayoutView />,
  uiConfig: { title: 'konva', hidden: isProd },
  children: [{ path: 'konva', element: <Ko /> }]
}

export default rmstRenderRouteConfig

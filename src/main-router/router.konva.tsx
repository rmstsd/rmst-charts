import LayoutView from '@/components/LayoutView/LayoutView'

import KonvaBase from '@/demo/konva/KonvaBase'
import KonvaLineAnimate from '@/demo/konva/KonvaLineAnimate'
import PolygonDe from '@/demo/konva/PolygonDe'
import ZIndex from '@/demo/konva/ZIndex'

import { IRouteObject } from './router'

const konvaRouteConfig: IRouteObject = {
  path: '/konva',
  element: <LayoutView />,
  uiConfig: { title: 'konva' },
  children: [
    {
      path: 'base',
      element: <KonvaBase />,
      uiConfig: { title: 'konva-体验' }
    },
    {
      path: 'KonvaLineAnimate',
      element: <KonvaLineAnimate />
    },
    {
      path: 'PolygonDe',
      element: <PolygonDe />
    },
    {
      path: 'ZIndex',
      element: <ZIndex />
    }
  ]
}

export default konvaRouteConfig

import LayoutView from '@/components/LayoutView/LayoutView'

import KonvaBase from '@/demo/3-konva/KonvaBase'
import KonvaLineAnimate from '@/demo/3-konva/KonvaLineAnimate'
import PolygonDe from '@/demo/3-konva/PolygonDe'
import ZIndex from '@/demo/3-konva/ZIndex'

import { IRouteObject } from './router'

const konvaRouteConfig: IRouteObject = {
  path: '/konva',
  element: <LayoutView />,
  uiConfig: { title: 'konva', hidden: import.meta.env.PROD },
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

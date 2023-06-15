import LayoutView from '@/LayoutView/LayoutView'

import KonvaBase from '@/demo/konva/KonvaBase'
import KonvaLineAnimate from '@/demo/konva/KonvaLineAnimate'
import PolygonDe from '@/demo/konva/PolygonDe'
import ZIndex from '@/demo/konva/ZIndex'

export default {
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

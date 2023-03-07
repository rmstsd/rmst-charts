import LayoutView from '../LayoutView/LayoutView'

import KonvaBase from '../demo/konva/KonvaBase'
import KonvaLineAnimate from '../demo/konva/KonvaLineAnimate'

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
    }
  ]
}

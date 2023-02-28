import LayoutView from '../LayoutView/LayoutView'

import KonvaBase from '../demo/konva/KonvaBase'

export default {
  path: '/konva',
  element: <LayoutView />,
  uiConfig: { title: 'konva' },
  children: [
    {
      path: 'konva-base',
      element: <KonvaBase />,
      uiConfig: { title: 'konva-体验' }
    }
  ]
}

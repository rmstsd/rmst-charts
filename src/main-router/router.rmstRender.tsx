import LayoutView, { LayoutOutlet } from '../LayoutView/LayoutView'

import RectDemo from '@/demo/render/base-shape/RectDemo'
import Circle from '@/demo/render/base-shape/CircleDemo'
import LineDemo from '@/demo/render/base-shape/LineDemo'
import TextDemo from '@/demo/render/base-shape/TextDemo'

import GroupDraggable from '@/demo/render/GroupDraggable'
import Animate from '@/demo/render/Animate'
import Draggable from '@/demo/render/Draggable'
import RmstLine from '@/demo/render/RmstLine'

export default {
  path: '/rmst-render',
  element: <LayoutView />,
  uiConfig: { title: 'render(primary)' },
  children: [
    {
      path: 'base',
      element: <LayoutOutlet />,
      uiConfig: { title: '基础图形' },
      children: [
        { path: 'rect', element: <RectDemo />, uiConfig: { title: '矩形' } },
        { path: 'circle', element: <Circle />, uiConfig: { title: '圆, 环, 扇, 扇环' } },
        { path: 'line', element: <LineDemo />, uiConfig: { title: '线' } },
        { path: 'text', element: <TextDemo />, uiConfig: { title: '文本' } }
      ]
    },
    {
      path: 'draggable',
      element: <Draggable />,
      uiConfig: { title: 'draggable' }
    },
    {
      path: 'group',
      element: <GroupDraggable />,
      uiConfig: { title: '成组 draggable' }
    },
    {
      path: 'animate',
      element: <Animate />,
      uiConfig: { title: 'Animate' }
    },
    {
      path: 'rmst-line',
      element: <RmstLine />,
      uiConfig: { title: 'RmstLine' }
    }
  ]
}

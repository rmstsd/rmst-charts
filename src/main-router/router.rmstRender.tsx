import LayoutView from '../LayoutView/LayoutView'

import RenderDemo from '../demo/render/BaseDemo'
import GroupDraggable from '../demo/render/GroupDraggable'
import Animate from '../demo/render/Animate'
import Draggable from '../demo/render/Draggable'
import RmstLine from '../demo/render/RmstLine'

export default {
  path: '/rmst-render',
  element: <LayoutView />,
  uiConfig: { title: 'render(主要)' },
  children: [
    {
      path: 'base',
      element: <RenderDemo />,
      uiConfig: { title: '基础图形' }
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

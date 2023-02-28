import LayoutView from '../LayoutView/LayoutView'

import RenderDemo from '../demo/render/BaseDemo'
import GroupDemo from '../demo/render/GroupDemo'
import Animate from '../demo/render/Animate'

export default {
  path: '/rmst-render',
  element: <LayoutView />,
  uiConfig: { title: 'render' },
  children: [
    {
      path: 'render-base',
      element: <RenderDemo />,
      uiConfig: { title: '基础图形' }
    },
    {
      path: 'render-group',
      element: <GroupDemo />,
      uiConfig: { title: '成组' }
    },

    {
      path: 'render-animate',
      element: <Animate />,
      uiConfig: { title: 'Animate' }
    }
  ]
}
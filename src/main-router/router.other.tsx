import LayoutView from '../LayoutView/LayoutView'

import Plum from '../demo/other/Plum'

export default {
  path: '/other',
  element: <LayoutView />,
  uiConfig: { title: '杂项' },
  children: [{ path: 'plum', element: <Plum /> }]
}

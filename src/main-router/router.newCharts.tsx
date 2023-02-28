import LayoutView from '../LayoutView/LayoutView'

import Pie from '../demo/new-charts/Pie'
import Line from '../demo/new-charts/Line'

export default {
  path: '/new-charts',
  element: <LayoutView />,
  uiConfig: { title: 'new-charts' },
  children: [
    { path: 'line', element: <Line /> },
    { path: 'pie', element: <Pie /> }
  ]
}

import LayoutView from '../LayoutView/LayoutView'

import Pie from '../demo/new-charts/Pie'
import Line from '../demo/new-charts/Line'
import Bar from '../demo/new-charts/Bar'

export default {
  path: '/new-charts',
  element: <LayoutView />,
  uiConfig: { title: 'new-charts' },
  children: [
    { path: 'line', element: <Line /> },
    { path: 'bar', element: <Bar /> },
    { path: 'pie', element: <Pie /> }
  ]
}

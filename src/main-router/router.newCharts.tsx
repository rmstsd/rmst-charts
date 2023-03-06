import LayoutView, { LayoutOutlet } from '../LayoutView/LayoutView'

import Pie from '../demo/new-charts/Pie'
import Line from '../demo/new-charts/Line'
import Bar from '../demo/new-charts/Bar'

export default {
  path: '/new-charts',
  element: <LayoutView />,
  uiConfig: { title: 'charts(主要)' },
  children: [
    {
      path: 'line',
      element: <LayoutOutlet />,
      uiConfig: { title: '折线图' },
      children: [{ path: 'base', element: <Line />, uiConfig: { title: '折线图' } }]
    },
    {
      path: 'bar',
      element: <LayoutOutlet />,
      uiConfig: { title: '柱状图' },
      children: [{ path: 'base', element: <Bar />, uiConfig: { title: '柱状图' } }]
    },

    {
      path: 'pie',
      element: <LayoutOutlet />,
      uiConfig: { title: '饼图' },
      children: [{ path: 'base', element: <Pie />, uiConfig: { title: '饼图' } }]
    }
  ]
}

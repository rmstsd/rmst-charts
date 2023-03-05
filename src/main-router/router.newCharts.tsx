import LayoutView from '../LayoutView/LayoutView'

import Pie from '../demo/new-charts/Pie'
import Line from '../demo/new-charts/Line'
import Bar from '../demo/new-charts/Bar'
import { Outlet } from 'react-router-dom'

const Layout2 = () => {
  return (
    <>
      <Outlet />
    </>
  )
}

export default {
  path: '/new-charts',
  element: <LayoutView />,
  uiConfig: { title: 'charts(主要)' },
  children: [
    // { path: 'line', element: <Line />, uiConfig: { title: '折线图' } },
    // { path: 'bar', element: <Bar />, uiConfig: { title: '柱状图' } },
    // { path: 'pie', element: <Pie />, uiConfig: { title: '饼图' } }

    {
      path: 'line',
      element: <Layout2 />,
      uiConfig: { title: '折线图' },

      children: [{ path: 'base', element: <div>line-base</div>, uiConfig: { title: '基础' } }]
    }
  ]
}

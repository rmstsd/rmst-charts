import LayoutView, { LayoutOutlet } from '../LayoutView/LayoutView'

import Line from '../demo/new-charts/line/Line'
import Area from '../demo/new-charts/line/Area'
import Stack from '../demo/new-charts/line/Stack'
import LineSmooth from '@/demo/new-charts/line/LineSmooth'
import Step from '@/demo/new-charts/line/Step'

import Base from '../demo/new-charts/bar/Base'
import Background from '../demo/new-charts/bar/Background'

import Pie from '../demo/new-charts/Pie'

export default {
  path: '/new-charts',
  element: <LayoutView />,
  uiConfig: { title: 'charts(primary)' },
  children: [
    {
      path: 'line',
      element: <LayoutOutlet />,
      uiConfig: { title: '折线图' },
      children: [
        { path: 'base', element: <Line />, uiConfig: { title: '基础折线图' } },
        { path: 'line-smooth', element: <LineSmooth />, uiConfig: { title: '基础平滑折线图' } },
        { path: 'area', element: <Area />, uiConfig: { title: '基础面积图' } },
        { path: 'stack', element: <Stack />, uiConfig: { title: '折线图堆叠' } },
        { path: 'step', element: <Step />, uiConfig: { title: '阶梯折线图' } }
      ]
    },
    {
      path: 'bar',
      element: <LayoutOutlet />,
      uiConfig: { title: '柱状图' },
      children: [
        { path: 'base', element: <Base />, uiConfig: { title: '基础柱状图' } },
        { path: 'background', element: <Background />, uiConfig: { title: '带背景色的柱状图' } }
      ]
    },

    {
      path: 'pie',
      element: <LayoutOutlet />,
      uiConfig: { title: '饼图' },
      children: [{ path: 'base', element: <Pie />, uiConfig: { title: '饼图' } }]
    }
  ]
}

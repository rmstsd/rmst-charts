import LayoutView, { LayoutOutlet } from '@/components/LayoutView/LayoutView'

import Line from '@/demo/new-charts/line/Line'
import Area from '@/demo/new-charts/line/Area'
import Stack from '@/demo/new-charts/line/Stack'
import LineSmooth from '@/demo/new-charts/line/LineSmooth'
import Step from '@/demo/new-charts/line/Step'
import ZExtreme from '@/demo/new-charts/line/ZExtreme'

import BarBase from '@/demo/new-charts/bar/Base'
import Background from '@/demo/new-charts/bar/Background'

import PieBase from '@/demo/new-charts/pie/Base'
import Ring from '@/demo/new-charts/pie/Ring'
import AreaStackGradient from '@/demo/new-charts/line/AreaStackGradient'
import AreaStack from '@/demo/new-charts/line/AreaStack'
import PolarLabelRadial from '@/demo/new-charts/bar/PolarLabelRadial'
import PolarLabelTangential from '@/demo/new-charts/bar/PolarLabelTangential'

import { IRouteObject } from './router'

const newChartsRouteConfig: IRouteObject = {
  path: '/new-charts',
  element: <LayoutView />,
  uiConfig: { title: 'charts (core), 基于render' },
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
        { path: 'areaStack', element: <AreaStack />, uiConfig: { title: '堆叠面积图' } },
        { path: 'areaStackGradient', element: <AreaStackGradient />, uiConfig: { title: '渐变堆叠面积图' } },
        { path: 'step', element: <Step />, uiConfig: { title: '阶梯折线图' } },
        { path: 'extreme', element: <ZExtreme />, uiConfig: { title: '极端的例子' } }
      ]
    },
    {
      path: 'bar',
      element: <LayoutOutlet />,
      uiConfig: { title: '柱状图' },
      children: [
        { path: 'base', element: <BarBase />, uiConfig: { title: '基础柱状图' } },
        { path: 'background', element: <Background />, uiConfig: { title: '带背景色的柱状图' } },
        { path: 'polarRadial', element: <PolarLabelRadial />, uiConfig: { title: '极坐标-角度轴' } },
        {
          path: 'polarTangential',
          element: <PolarLabelTangential />,
          uiConfig: { title: '极坐标-径向轴' }
        }
      ]
    },

    {
      path: 'pie',
      element: <LayoutOutlet />,
      uiConfig: { title: '饼图' },
      children: [
        { path: 'base', element: <PieBase />, uiConfig: { title: '基础饼图' } },
        { path: 'doughnut', element: <Ring />, uiConfig: { title: '环形饼图' } }
      ]
    }
  ]
}

export default newChartsRouteConfig

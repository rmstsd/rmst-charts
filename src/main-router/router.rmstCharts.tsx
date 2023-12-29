import LayoutView, { LayoutOutlet } from '@/components/LayoutView/LayoutView'

import Line from '@/demo/1-rmst-charts/line/Line'
import Area from '@/demo/1-rmst-charts/line/Area'
import Stack from '@/demo/1-rmst-charts/line/Stack'
import LineSmooth from '@/demo/1-rmst-charts/line/LineSmooth'
import Step from '@/demo/1-rmst-charts/line/Step'
import ZExtreme from '@/demo/1-rmst-charts/line/ZExtreme'
import AreaStackGradient from '@/demo/1-rmst-charts/line/AreaStackGradient'
import AreaStack from '@/demo/1-rmst-charts/line/AreaStack'

import BarBase from '@/demo/1-rmst-charts/bar/Base'
import Background from '@/demo/1-rmst-charts/bar/Background'
import PolarLabelRadial from '@/demo/1-rmst-charts/bar/PolarLabelRadial'
import PolarLabelTangential from '@/demo/1-rmst-charts/bar/PolarLabelTangential'

import PieBase from '@/demo/1-rmst-charts/pie/Base'
import Ring from '@/demo/1-rmst-charts/pie/Ring'
import ZExtremePie from '@/demo/1-rmst-charts/pie/ZExtreme'

import { IRouteObject } from './router'
import BasicCandlestick from '@/demo/1-rmst-charts/candlestick/基础K线图'
import DragCandlestick from '@/demo/1-rmst-charts/candlestick/可拖动K线图'

const newChartsRouteConfig: IRouteObject = {
  path: '/new-charts',
  element: <LayoutView />,
  uiConfig: { title: 'rmst-charts (基于 rmst-render)' },
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
        { path: 'ring', element: <Ring />, uiConfig: { title: '环形饼图' } },
        { path: 'extremePie', element: <ZExtremePie />, uiConfig: { title: '极端的例子' } }
      ]
    },
    {
      path: 'candlestick',
      element: <LayoutOutlet />,
      uiConfig: { title: 'K线图' },
      children: [
        { path: 'base', element: <BasicCandlestick />, uiConfig: { title: '基础 K 线图' } },
        { path: 'drag', element: <DragCandlestick />, uiConfig: { title: '可拖动 K 线图' } }
      ]
    }
  ]
}

export default newChartsRouteConfig

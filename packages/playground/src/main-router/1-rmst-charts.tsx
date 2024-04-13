import LayoutView, { LayoutOutlet } from '@/components/LayoutView/LayoutView'

import Line from '@/demo/1-rmst-charts/line/Line'
import Area from '@/demo/1-rmst-charts/line/Area'
import Stack from '@/demo/1-rmst-charts/line/Stack'
import LineSmooth from '@/demo/1-rmst-charts/line/LineSmooth'
import Step from '@/demo/1-rmst-charts/line/Step'
import ZExtreme from '@/demo/1-rmst-charts/line/ZExtreme'
import AreaStackGradient from '@/demo/1-rmst-charts/line/AreaStackGradient'
import AreaStack from '@/demo/1-rmst-charts/line/AreaStack'
import Drag from '@/demo/1-rmst-charts/line/Drag'

import BarBase from '@/demo/1-rmst-charts/bar/Base'
import TrapezoidBase from '@/demo/1-rmst-charts/bar/TrapezoidBase'
import Background from '@/demo/1-rmst-charts/bar/Background'
import Combine from '@/demo/1-rmst-charts/bar/Combine'
import PolarLabelRadial from '@/demo/1-rmst-charts/bar/PolarLabelRadial'
import PolarLabelTangential from '@/demo/1-rmst-charts/bar/PolarLabelTangential'
import BarDrag from '@/demo/1-rmst-charts/bar/Drag'

import PieBase from '@/demo/1-rmst-charts/pie/Base'
import Ring from '@/demo/1-rmst-charts/pie/Ring'
import ZExtremePie from '@/demo/1-rmst-charts/pie/ZExtreme'

import BasicCandlestick from '@/demo/1-rmst-charts/candlestick/基础K线图'
import DragCandlestick from '@/demo/1-rmst-charts/candlestick/可拖动K线图'

import { IRouteObject } from './router'

const newChartsRouteConfig: IRouteObject = {
  path: '/charts',
  element: <LayoutView />,
  uiConfig: { title: 'rmst-charts (基于 rmst-render)' },
  children: [
    {
      path: 'line',
      element: <LayoutOutlet />,
      uiConfig: { title: '折线图' },
      children: [
        { path: 'base', element: <Line />, uiConfig: { title: '折线图' } },
        { path: 'line-smooth', element: <LineSmooth />, uiConfig: { title: '曲线折线图' } },
        { path: 'area', element: <Area />, uiConfig: { title: '面积图' } },
        { path: 'combine', element: <Stack />, uiConfig: { title: '聚合图' } },
        { path: 'combineStack', element: <AreaStack />, uiConfig: { title: '聚合面积图' } },
        { path: 'gradient', element: <AreaStackGradient />, uiConfig: { title: '渐变图' } },
        { path: 'step', element: <Step />, uiConfig: { title: '拐角图' } },
        { path: 'drag', element: <Drag />, uiConfig: { title: '拖动折线图' } },
        { path: 'extreme', element: <ZExtreme />, uiConfig: { title: '极端例子' } }
      ]
    },
    {
      path: 'bar',
      element: <LayoutOutlet />,
      uiConfig: { title: '柱状图' },
      children: [
        { path: 'base', element: <BarBase />, uiConfig: { title: '柱状图' } },
        { path: 'trapezoid', element: <TrapezoidBase />, uiConfig: { title: '梯形' } },
        { path: 'background', element: <Background />, uiConfig: { title: '有背景色' } },
        { path: 'combine', element: <Combine />, uiConfig: { title: '聚合' } },
        { path: 'drag', element: <BarDrag />, uiConfig: { title: '拖动柱状图' } },
        { path: 'polarRadial', element: <PolarLabelRadial />, uiConfig: { title: '极坐标-角度轴' } },
        { path: 'polarTangential', element: <PolarLabelTangential />, uiConfig: { title: '极坐标-径向轴' } }
      ]
    },
    {
      path: 'pie',
      element: <LayoutOutlet />,
      uiConfig: { title: '饼图' },
      children: [
        { path: 'base', element: <PieBase />, uiConfig: { title: '饼图' } },
        { path: 'ring', element: <Ring />, uiConfig: { title: '环形' } },
        { path: 'extremePie', element: <ZExtremePie />, uiConfig: { title: '极端例子' } }
      ]
    },
    {
      path: 'candlestick',
      element: <LayoutOutlet />,
      uiConfig: { title: 'K线图' },
      children: [
        { path: 'base', element: <BasicCandlestick />, uiConfig: { title: 'K 线图' } },
        { path: 'drag', element: <DragCandlestick />, uiConfig: { title: '拖动 K 线图' } }
      ]
    }
  ]
}

export default newChartsRouteConfig

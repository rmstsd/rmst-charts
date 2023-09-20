import LayoutView from '@/components/LayoutView/LayoutView'

import LineDemo from '@/demo/4-old-charts/LineDemo'
import BarDemo from '@/demo/4-old-charts/BarDemo'
import PieDemo from '@/demo/4-old-charts/PieDemo'
import ArcAnimate from '@/demo/4-old-charts/ArcAnimate'
import CandleTask from '@/demo/4-old-charts/CandleTask'

import { IRouteObject } from './router'

const oldChartsRouteConfig: IRouteObject = {
  path: '/old-charts',
  element: <LayoutView />,
  uiConfig: { title: 'old-charts', hidden: import.meta.env.PROD },
  children: [
    { path: 'line', element: <LineDemo /> },
    { path: 'bar', element: <BarDemo /> },
    { path: 'pie', element: <PieDemo /> },
    { path: 'arcAnimate', element: <ArcAnimate /> },
    { path: 'K线图', element: <CandleTask /> }
  ]
}

export default oldChartsRouteConfig

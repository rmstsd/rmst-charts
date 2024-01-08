import LayoutView from '@/components/LayoutView/LayoutView'

import CandleTask from '@/demo/5-old-charts/CandleTask'

import { IRouteObject } from './router'

const oldChartsRouteConfig: IRouteObject = {
  path: '/old-charts',
  element: <LayoutView />,
  uiConfig: { title: 'old-charts', hidden: import.meta.env.PROD },
  children: [{ path: 'K线图', element: <CandleTask /> }]
}

export default oldChartsRouteConfig

import LayoutView from '@/components/LayoutView/LayoutView'

import CandleTask from '@/demo/5-old-charts/CandleTask'

import { IRouteObject } from './router'

import { isProd } from '@/utils'

const oldChartsRouteConfig: IRouteObject = {
  path: '/old-charts',
  element: <LayoutView />,
  uiConfig: { title: 'old-charts', hidden: isProd },
  children: [{ path: 'k', element: <CandleTask /> }]
}

export default oldChartsRouteConfig

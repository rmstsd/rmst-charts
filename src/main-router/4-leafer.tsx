import LayoutView from '@/components/LayoutView/LayoutView'

import QuickStart from '@/demo/4-leafer/QuickStart'

import type { IRouteObject } from './router'

import { isProd } from '@/utils'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/leafer',
  element: <LayoutView />,
  uiConfig: { title: 'leafer', hidden: isProd },
  children: [{ path: 'qs', element: <QuickStart /> }]
}

export default rmstRenderRouteConfig

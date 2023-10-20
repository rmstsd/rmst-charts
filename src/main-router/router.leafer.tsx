import LayoutView from '@/components/LayoutView/LayoutView'

import QuickStart from '@/demo/6-leafer/QuickStart'

import type { IRouteObject } from './router'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/leafer',
  element: <LayoutView />,
  uiConfig: { title: 'leafer' },
  children: [{ path: 'qs', element: <QuickStart /> }]
}

export default rmstRenderRouteConfig

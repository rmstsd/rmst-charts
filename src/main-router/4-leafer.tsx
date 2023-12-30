import LayoutView from '@/components/LayoutView/LayoutView'

import QuickStart from '@/demo/4-leafer/QuickStart'

import type { IRouteObject } from './router'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/leafer',
  element: <LayoutView />,
  uiConfig: { title: 'leafer', hidden: import.meta.env.PROD },
  children: [{ path: 'qs', element: <QuickStart /> }]
}

export default rmstRenderRouteConfig

import LayoutView from '@/components/LayoutView/LayoutView'

import QuickStart from '@/demo/3-zrender/QuickStart'

import { IRouteObject } from './router'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/zrender',
  element: <LayoutView />,
  uiConfig: { title: 'zrender' },
  children: [{ path: 'qs', element: <QuickStart /> }]
}

export default rmstRenderRouteConfig

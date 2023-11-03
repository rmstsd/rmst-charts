import LayoutView from '@/components/LayoutView/LayoutView'

import QuickStart from '@/demo/3-zrender/QuickStart'
import RectOver from '@/demo/3-zrender/RectOver'

import { IRouteObject } from './router'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/zrender',
  element: <LayoutView />,
  uiConfig: { title: 'zrender' },
  children: [
    { path: 'qs', element: <QuickStart /> },
    { path: 'ro', element: <RectOver /> }
  ]
}

export default rmstRenderRouteConfig

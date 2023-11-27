import LayoutView from '@/components/LayoutView/LayoutView'

import QuickStart from '@/demo/3-zrender/QuickStart'
import RectOver from '@/demo/3-zrender/RectOver'

import { IRouteObject } from './router'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/zrender',
  element: <LayoutView />,
  uiConfig: { title: 'zrender', hidden: import.meta.env.PROD },
  children: [
    { path: 'QuickStart', element: <QuickStart /> },
    { path: 'RectOver', element: <RectOver /> }
  ]
}

export default rmstRenderRouteConfig

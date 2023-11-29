import LayoutView from '@/components/LayoutView/LayoutView'

import { IRouteObject } from './router'

import QuickStart from '@/demo/3-zrender/QuickStart'
import RectOver from '@/demo/3-zrender/RectOver'
import DragGroup from '@/demo/3-zrender/DragGroup'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/zrender',
  element: <LayoutView />,
  uiConfig: { title: 'zrender', hidden: import.meta.env.PROD },
  children: [
    { path: 'QuickStart', element: <QuickStart /> },
    { path: 'RectOver', element: <RectOver /> },
    { path: 'DragGroup', element: <DragGroup /> }
  ]
}

export default rmstRenderRouteConfig

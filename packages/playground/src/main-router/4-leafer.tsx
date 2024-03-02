import LayoutView from '@/components/LayoutView/LayoutView'

import QuickStart from '@/demo/4-leafer/QuickStart'
import DivChild from '@/demo/4-leafer/DivChild'

import type { IRouteObject } from './router'

import { isProd } from '@/utils'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/leafer',
  element: <LayoutView />,
  uiConfig: { title: 'leafer', hidden: isProd },
  children: [
    { path: 'qs', element: <QuickStart /> },
    { path: 'DivChild', element: <DivChild /> }
  ]
}

export default rmstRenderRouteConfig

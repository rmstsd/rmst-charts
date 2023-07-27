import { Divider, Layout, Menu, MenuProps } from 'antd'
import { Outlet, useLocation, useNavigate, matchRoutes } from 'react-router-dom'
import { convertToAntdData, findPath, routes } from '@/main-router/router'
import { useState } from 'react'

import './LayoutView.css'

const LayoutView = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [openKeys, setOpenKeys] = useState(() =>
    routes.reduce(
      (acc, item) => acc.concat(item.children ? item.children.map(item => '/' + item.path) : []),
      []
    )
  )

  const headerItems: MenuProps['items'] = convertToAntdData(routes, false)
  const mRoutes = matchRoutes(routes, location.pathname)
  const currentRouteConfig = mRoutes.at(-1)
  const routePathArray = mRoutes.map(item => item.route.path)
  const [mainPath] = routePathArray

  const siderItems: MenuProps['items'] = convertToAntdData(
    routes.find(item => item.path === mainPath).children,
    true
  )

  const onHeaderMenuClick = info => {
    const { key } = info
    const path = findPath(routes.find(item => item.path === key))
    navigate(path)
  }

  const onSideMenuClick = info => {
    const { key } = info
    navigate(mainPath + key)
  }

  const sideMenuKeys = mRoutes
    .map(item => item.pathname.split('/').slice(2).join('/'))
    .filter(Boolean)
    .map(item => '/' + item)

  return (
    <Layout style={{ height: '100%', backgroundColor: 'white' }}>
      <Layout.Header style={{ backgroundColor: 'transparent', display: 'flex', padding: 0 }}>
        <div style={{ width: 200, textAlign: 'center', fontSize: 24, flexShrink: 0 }}>rmst</div>
        <Menu
          mode="horizontal"
          selectedKeys={routePathArray}
          items={headerItems}
          onClick={onHeaderMenuClick}
          style={{ border: 'none', flexGrow: 1 }}
        />
      </Layout.Header>

      <Divider style={{ margin: 0 }} />
      <section style={{ flexGrow: 1, height: 0, display: 'flex', backgroundColor: '#f9f9f9' }}>
        <aside>
          <Menu
            mode="inline"
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            selectedKeys={sideMenuKeys}
            items={siderItems}
            onClick={onSideMenuClick}
            style={{ width: 220, borderRight: 'none' }}
          />
        </aside>

        <Layout.Content className="main-content">
          {currentRouteConfig.route.uiConfig?.isDeveloping && process.env.NODE_ENV === 'production' ? (
            <div style={{ textAlign: 'center', lineHeight: 20, fontSize: 30 }}>开发中</div>
          ) : (
            <LayoutOutlet />
          )}
        </Layout.Content>
      </section>
    </Layout>
  )
}

export default LayoutView

export const LayoutOutlet = () => <Outlet />

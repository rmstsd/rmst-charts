import { Divider, Layout, Menu, MenuProps, MenuRef } from 'antd'
import { Outlet, useLocation, useNavigate, matchRoutes } from 'react-router-dom'
import { convertToAntdData, findPath, routes } from '@/main-router/router'
import { useLayoutEffect, useRef, useState } from 'react'

import './LayoutView.css'

const LayoutView = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [openKeys, setOpenKeys] = useState(() =>
    routes.reduce((acc, item) => acc.concat(item.children ? item.children.map(item => '/' + item.path) : []), [])
  )

  const headerItems: MenuProps['items'] = convertToAntdData(routes, false)
  const mRoutes = matchRoutes(routes, location.pathname)
  const currentRouteConfig = mRoutes.at(-1)
  const routePathArray = mRoutes.map(item => item.route.path)
  const [mainPath] = routePathArray

  const siderItems: MenuProps['items'] = convertToAntdData(routes.find(item => item.path === mainPath).children, true)

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

  const menuRef = useRef<MenuRef>(null)

  useLayoutEffect(() => {
    if (!menuRef.current) {
      return
    }
    const selectedMenuItem = menuRef.current.menu.list.querySelector('li[class~="ant-menu-item-selected"]')
    selectedMenuItem?.scrollIntoView()
  }, [])

  return (
    <Layout style={{ height: '100%', backgroundColor: 'white' }}>
      <Layout.Header
        className="flex h-[50px] leading-[50px] shadow relative z-10 overflow-auto"
        style={{ backgroundColor: 'transparent', padding: 0 }}
      >
        <div className="text-center shrink-0" style={{ width: 220, fontSize: 24 }}>
          rmst
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={routePathArray}
          items={headerItems}
          onClick={onHeaderMenuClick}
          style={{ border: 'none', flexGrow: 1 }}
        />

        <span className="pr-[10px] shrink-0">最新 build: {__Build_Time__}</span>

        <a className="text-blue-500 mr-4" href="https://github.com/rmstsd/rmst-charts" target="_blank">
          github
        </a>
      </Layout.Header>

      <Divider style={{ margin: 0 }} />
      <section className="flex-grow h-0 flex" style={{ backgroundColor: '#f9f9f9' }}>
        <aside>
          <Menu
            mode="inline"
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            selectedKeys={sideMenuKeys}
            items={siderItems}
            onClick={onSideMenuClick}
            className="border-r-0"
            style={{ width: 220 }}
            ref={menuRef}
          />
        </aside>

        <Layout.Content className="main-content">
          <LayoutOutlet />
        </Layout.Content>
      </section>
    </Layout>
  )
}

export default LayoutView

export const LayoutOutlet = () => <Outlet />

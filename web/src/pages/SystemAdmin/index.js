// 控制台布局页
import { Layout } from "@douyinfe/semi-ui"
import { Outlet } from "react-router-dom"
import { StyleContext } from '../../context/Style/index.js';
const { Sider } = Layout;
import React, { useContext, useEffect } from 'react';
import SiderBar from "./SiderBar.js";

const SystemAdmin = () => {
    const [styleState, styleDispatch] = useContext(StyleContext);

    return (
        <Layout>
            <Layout.Sider>
                <Sider style={{
                    position: 'fixed',
                    left: 0,
                    top: '56px',
                    zIndex: 99,
                    background: 'var(--semi-color-bg-1)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    border: 'none',
                    paddingRight: '0',
                    height: 'calc(100vh - 56px)',
                }}>
                    <SiderBar></SiderBar>
                </Sider>
            </Layout.Sider>
            <Layout.Content
                style={{
                    marginLeft: styleState.isMobile ? '0' : (styleState.showSider ? (styleState.siderCollapsed ? '60px' : '256px') : '0'),
                    transition: 'margin-left 0.3s ease',
                    flex: '1 1 auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Outlet></Outlet>
            </Layout.Content>
        </Layout>
    )
}

export default SystemAdmin
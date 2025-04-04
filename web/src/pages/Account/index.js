// 控制台布局页
import { Layout } from "@douyinfe/semi-ui"
import { Outlet } from "react-router-dom"
import { StyleContext } from '../../context/Style/index.js';
const { Sider } = Layout;
import React, { useContext, useEffect } from 'react';
import AccountSiderBar from "./AccountSiderBar.js";

const Account = () => {
    const [styleState, styleDispatch] = useContext(StyleContext);

    return (
        <Layout style={{ height: '100%' }}>
            <Layout.Sider style={{
                border: 'none',
                paddingRight: '0',
                height: '100%',
                width: '256px',
            }}>
                <AccountSiderBar></AccountSiderBar>
            </Layout.Sider>
            <Layout.Content
                style={{
                    overflow: 'auto',
                    marginLeft: '10px',
                    backgroundColor: 'var(--semi-color-bg-1)',
                    transition: 'margin-left 0.3s ease',
                    flex: '1 1 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px',
                    borderRadius: "8px"
                }}
            >
                <Outlet></Outlet>
            </Layout.Content>
        </Layout>
    )
}

export default Account
// 控制台布局页
import { Layout } from "@douyinfe/semi-ui"
import { Outlet } from "react-router-dom"
import { StyleContext } from '../../context/Style/index.js';
const { Sider } = Layout;
import React, { useContext, useEffect } from 'react';
import SiderBar from "./SiderBar.js";

const OperationBackground = () => {
    const [styleState, styleDispatch] = useContext(StyleContext);

    return (
        <Layout style={{ height: 'calc(100vh - 56px)', padding: "20px" }}>
            <Layout.Sider style={{
                border: 'none',
                paddingRight: '0',
                height: '100%',
            }}>
                <SiderBar></SiderBar>
            </Layout.Sider>
            <Layout.Content
                style={{
                    overflow: 'auto',
                    backgroundColor: 'var(--semi-color-bg-1)',
                    border: '1px solid var(--semi-color-border)',
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

export default OperationBackground
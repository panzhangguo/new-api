import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  isAdmin,
} from '../../helpers';

import {
  IconUser,
  IconUserGroup
} from '@douyinfe/semi-icons';
import { Avatar, Dropdown, Layout, Nav, Switch, Divider } from '@douyinfe/semi-ui';
import { StyleContext } from '../../context/Style/index.js';

// 自定义侧边栏按钮样式
const navItemStyle = {
  borderRadius: '6px',
  margin: '4px 8px',
};

// 自定义侧边栏按钮悬停样式
const navItemHoverStyle = {
  backgroundColor: 'var(--semi-color-primary-light-default)',
  color: 'var(--semi-color-primary)'
};

// 自定义侧边栏按钮选中样式
const navItemSelectedStyle = {
  backgroundColor: 'var(--semi-color-primary-light-default)',
  color: 'var(--semi-color-primary)',
  fontWeight: '600'
};

// 自定义图标样式
const iconStyle = (itemKey, selectedKeys) => {
  return {
    fontSize: '18px',
    color: selectedKeys.includes(itemKey) ? 'var(--semi-color-primary)' : 'var(--semi-color-text-2)',
  };
};

// Define routerMap as a constant outside the component
const routerMap = {
  user: '/system-admin/user',
  company: '/system-admin/company'
};

const SiderBar = () => {
  const { t } = useTranslation();
  const [styleState, styleDispatch] = useContext(StyleContext);
  const defaultIsCollapsed =
    localStorage.getItem('default_collapse_sidebar') === 'true';

  const [selectedKeys, setSelectedKeys] = useState(['user']);
  const [isCollapsed, setIsCollapsed] = useState(defaultIsCollapsed);
  const [chatItems, setChatItems] = useState([]);
  const [openedKeys, setOpenedKeys] = useState([]);
  const location = useLocation();
  const [routerMapState, setRouterMapState] = useState(routerMap);

  // 预先计算所有可能的图标样式
  const allItemKeys = useMemo(() => {
    const keys = ['company', 'user'];
    // 添加聊天项的keys
    for (let i = 0; i < chatItems.length; i++) {
      keys.push('chat' + i);
    }
    return keys;
  }, [chatItems]);

  // 使用useMemo一次性计算所有图标样式
  const iconStyles = useMemo(() => {
    const styles = {};
    allItemKeys.forEach(key => {
      styles[key] = iconStyle(key, selectedKeys);
    });
    return styles;
  }, [allItemKeys, selectedKeys]);

  const adminItems = useMemo(
    () => [
      {
        text: t('用户管理'),
        itemKey: 'user',
        to: '/system-admin/user',
        icon: <IconUser />,
      },
      {
        text: t('组织管理'),
        itemKey: 'company',
        to: '/system-admin/company',
        icon: <IconUserGroup />,
      }
    ],
    [isAdmin(), t],
  );

  useEffect(() => {
    setIsCollapsed(styleState.siderCollapsed);
  }, [styleState.siderCollapsed]);

  return (
    <>
      <Nav
        className="custom-sidebar-nav"
        style={{
          width: isCollapsed ? '60px' : '256px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderRight: '1px solid var(--semi-color-border)',
          background: 'var(--semi-color-bg-1)',
          borderRadius: styleState.isMobile ? '0' : '0 8px 8px 0',
          position: 'relative',
          zIndex: 95,
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch', // Improve scrolling on iOS devices
        }}
        defaultIsCollapsed={
          localStorage.getItem('default_collapse_sidebar') === 'true'
        }
        isCollapsed={isCollapsed}
        onCollapseChange={(collapsed) => {
          setIsCollapsed(collapsed);
          // styleDispatch({ type: 'SET_SIDER', payload: true });
          styleDispatch({ type: 'SET_SIDER_COLLAPSED', payload: collapsed });
          localStorage.setItem('default_collapse_sidebar', collapsed);

          // 确保在收起侧边栏时有选中的项目，避免不必要的计算
          if (selectedKeys.length === 0) {
            const currentPath = location.pathname;
            const matchingKey = Object.keys(routerMapState).find(key => routerMapState[key] === currentPath);

            if (matchingKey) {
              setSelectedKeys([matchingKey]);
            } {
              setSelectedKeys(['user']); // 默认选中首页
            }
          }
        }}
        selectedKeys={selectedKeys}
        itemStyle={navItemStyle}
        hoverStyle={navItemHoverStyle}
        selectedStyle={navItemSelectedStyle}
        renderWrapper={({ itemElement, isSubNav, isInSubNav, props }) => {
          return (
            <Link
              style={{ textDecoration: 'none' }}
              to={routerMapState[props.itemKey] || routerMap[props.itemKey]}
            >
              {itemElement}
            </Link>
          );
        }}
        onSelect={(key) => {
          if (key.itemKey.toString().startsWith('chat')) {
            styleDispatch({ type: 'SET_INNER_PADDING', payload: false });
          } else {
            styleDispatch({ type: 'SET_INNER_PADDING', payload: true });
          }

          // 如果点击的是已经展开的子菜单的父项，则收起子菜单
          if (openedKeys.includes(key.itemKey)) {
            setOpenedKeys(openedKeys.filter(k => k !== key.itemKey));
          }

          setSelectedKeys([key.itemKey]);
        }}
        openKeys={openedKeys}
        onOpenChange={(data) => {
          setOpenedKeys(data.openKeys);
        }}
      >
        {isAdmin() && (
          <>
            {adminItems.map((item) => (
              <Nav.Item
                key={item.itemKey}
                itemKey={item.itemKey}
                text={item.text}
                icon={React.cloneElement(item.icon, { style: iconStyles[item.itemKey] })}
                className={item.className}
              />
            ))}
          </>
        )}

        <Nav.Footer
          style={{
            paddingBottom: styleState?.isMobile ? '112px' : '',
          }}
          collapseButton={true}
          collapseText={(collapsed) => {
            if (collapsed) {
              return t('展开侧边栏')
            }
            return t('收起侧边栏')
          }
          }
        />
      </Nav>
    </>
  );
};

export default SiderBar;

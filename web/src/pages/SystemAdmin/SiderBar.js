import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  isAdmin,
} from '../../helpers';

import {
  IconUser,
  IconUserGroup,
  IconSemiLogo
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
  teammanage: '/system-admin/teammanage'
};

const SiderBar = () => {
  const { t } = useTranslation();
  const [styleState, styleDispatch] = useContext(StyleContext);

  const [selectedKeys, setSelectedKeys] = useState(['teammanage']);
  const [chatItems, setChatItems] = useState([]);
  const [openedKeys, setOpenedKeys] = useState([]);
  const location = useLocation();
  const [routerMapState, setRouterMapState] = useState(routerMap);

  // 预先计算所有可能的图标样式
  const allItemKeys = useMemo(() => {
    const keys = ['teammanage', 'user'];
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
        text: t('团队管理'),
        itemKey: 'teammanage',
        to: '/system-admin/teammanage',
        icon: <IconUserGroup />,
      }
    ],
    [isAdmin(), t],
  );

  return (
    <>
      <Nav
        style={{
          flexShrink: 0,
          borderRadius: styleState.isMobile ? '0' : '12px',
          position: 'relative',
          zIndex: 95,
          height: '100%',
          width: '256px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch', // Improve scrolling on iOS devices
        }}
        header={{
          logo: <IconSemiLogo style={{ height: '36px', fontSize: 36 }} />,
          text: '运营后台'
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
      </Nav>
    </>
  );
};

export default SiderBar;

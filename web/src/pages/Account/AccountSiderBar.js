import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  IconCalendarClock, IconChecklistStroked,
  IconComment, IconCommentStroked,
  IconCreditCard,
  IconGift, IconHelpCircle,
  IconHistogram,
  IconHome,
  IconImage,
  IconKey,
  IconLayers,
  IconPriceTag,
  IconSetting,
  IconUser,
  IconUserGroup
} from '@douyinfe/semi-icons';
import {
  isAdmin,
} from '../../helpers/index.js';

import { Avatar, Dropdown, Layout, Nav, Switch, Divider, Typography } from '@douyinfe/semi-ui';
import { StyleContext } from '../../context/Style/index.js';

const { Text } = Typography

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

// Custom group label style
const groupLabelStyle = {
  padding: '8px 16px',
  margin: '8px 0',
  display: 'block',
  color: 'var(--semi-color-text-2)',
  fontSize: '14px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

// Define routerMap as a constant outside the component
const routerMap = {
  topup: '/account/topup',
  personal: '/account/personal',
  "my-team": '/account/my-team'
};

const AccountSiderBar = () => {
  const { t } = useTranslation();
  const [styleState, styleDispatch] = useContext(StyleContext);

  const [openedKeys, setOpenedKeys] = useState([]);
  const location = useLocation();
  const currentPath = location.pathname.split('/')[2];
  const [selectedKeys, setSelectedKeys] = useState([currentPath]);
  const [routerMapState, setRouterMapState] = useState(routerMap);

  const financeItems = useMemo(
    () => [
      {
        text: t('钱包'),
        itemKey: 'topup',
        to: '/account/topup',
        icon: <IconCreditCard />,
      },
      {
        text: t('个人设置'),
        itemKey: 'personal',
        to: '/account/personal',
        icon: <IconUser />,
      },
    ],
    [t],
  );

  const teamItems = useMemo(
    () => [
      {
        text: t('我的团队'),
        itemKey: 'my-team',
        to: '/account/my-team',
        icon: <IconUserGroup />,
      },
    ],
    [t],
  );

  // 使用useMemo一次性计算所有图标样式
  const iconStyles = useMemo(() => {
    const styles = {};
    ['personal', 'topup', 'my-team'].forEach(key => {
      styles[key] = iconStyle(key, selectedKeys);
    });
    return styles;
  }, [selectedKeys]);

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
          styleDispatch({ type: 'SET_INNER_PADDING', payload: true });
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
        <Text style={groupLabelStyle}>{t('个人中心')}</Text>
        {financeItems.map((item) => (
          <Nav.Item
            key={item.itemKey}
            itemKey={item.itemKey}
            text={item.text}
            icon={React.cloneElement(item.icon, { style: iconStyles[item.itemKey] })}
            className={item.className}
          />
        ))}

        <Text style={groupLabelStyle}>{t('团队管理')}</Text>
        {teamItems.map((item) => (
          <Nav.Item
            key={item.itemKey}
            itemKey={item.itemKey}
            text={item.text}
            icon={React.cloneElement(item.icon, { style: iconStyles[item.itemKey] })}
            className={item.className}
          />
        ))}
      </Nav>
    </>
  );
};

export default AccountSiderBar;

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
    useRef,
} from 'react';
import { Button, Table, Avatar, Tag, Dropdown } from '@douyinfe/semi-ui';
import {
    IconMore,
    IconTickCircle,
    IconComment,
    IconClear,
    IconAlarm,
    IconUser,
    IconBox,
    IconSetting,
    IconForward,
    IconRefresh,
    IconSearch,
    IconAlertCircle,
} from '@douyinfe/semi-icons';
import { ITEMS_PER_PAGE } from '../../../constants';
import { useTranslation } from 'react-i18next';
import { API, showError } from '../../../helpers';

const MemberTable = (props, ref) => {
    const { t } = useTranslation();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
    const [userCount, setUserCount] = useState(ITEMS_PER_PAGE);

    const reload = () => {
        loadTeamUsers(activePage, pageSize);
    };
    useImperativeHandle(ref, () => ({
        reload,
    }));

    const authHandler = async (record, key) => {
        const url = '/api/winload-team/update_user2team_status';
        let status = 0;
        if (key === 'joining_approval_able') {
            status = 2
        }

        if (key === 'clear_teamuser_able') {
            status = -1
        }
        const res = await API.post(url, { ...record, status: status }); // cleared
        const { success, message } = res.data;
        if (success) {
            reload();
        } else {
            showError(message);
        }
        return
    };
    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
        },
        {
            title: '显示名',
            dataIndex: 'display_name',
            render: (text, record, index) => {
                return (
                    <div>
                        <Avatar
                            size='small'
                            color={record.avatarBg}
                            style={{ marginRight: 4 }}
                        >
                            {typeof text === 'string' && text.slice(0, 1)}
                        </Avatar>
                        {text}
                    </div>
                );
            },
        },
        {
            title: '人员状态',
            dataIndex: 'status',
            render: (text) => {
                const tagConfig = {
                    1: {
                        color: 'green',
                        prefixIcon: <IconTickCircle />,
                        text: '所有者',
                    },
                    2: { color: 'light-blue', prefixIcon: <IconUser />, text: '成员' },
                    3: { color: 'red', prefixIcon: <IconAlarm />, text: '待审' },
                };
                const tagProps = tagConfig[text];
                return (
                    <Tag shape='circle' {...tagProps} style={{ userSelect: 'text' }}>
                        {tagProps ? tagProps.text : '未知'}
                    </Tag>
                );
            },
        },
        {
            title: '加入/更新日期',
            dataIndex: 'updated_at',
            render: (text) => {
                return <span>{new Date(text).toLocaleString()}</span>;
            },
        },
        {
            title: '操作',
            dataIndex: 'default_operate',
            render: (text, record) => {
                return (
                    <>
                        {props.user2team.in_authorized_group && (
                            <Dropdown
                                position='bottomLeft'
                                render={
                                    <Dropdown.Menu>
                                        {props.user2team.joining_approval_able && (
                                            <Dropdown.Item onClick={() => { authHandler(record, 'joining_approval_able') }} icon={<IconAlarm />}>通过</Dropdown.Item>
                                        )}
                                        {props.user2team.clear_teamuser_able && (
                                            <>
                                                <Dropdown.Divider />
                                                <Dropdown.Item onClick={() => { authHandler(record, 'clear_teamuser_able') }} type='danger' icon={<IconAlertCircle />}>
                                                    清退
                                                </Dropdown.Item>
                                            </>
                                        )}
                                    </Dropdown.Menu>
                                }
                            >
                                <IconMore />
                            </Dropdown>
                        )}
                    </>
                );
            },
        },
    ];

    const loadTeamUsers = async (startIdx, pageSize) => {
        setLoading(true);
        const url = `/api/winload-team/team_users/?keyword=${props.searchKey}&team_id=${props.teamId}&p=${startIdx}&page_size=${pageSize}&status=${props.userStatus}`;
        const res = await API.get(url).finally(() => {
            setLoading(false);
        });
        const { success, message, data } = res.data;
        if (success) {
            const newPageData = data.items;
            setActivePage(data.page);
            setUserCount(data.total);
            setUsers(newPageData);
        } else {
            showError(message);
        }
    };

    const handlePageChange = async (page) => {
        setActivePage(page);
        loadTeamUsers(page, pageSize).then();
    };

    const handlePageSizeChange = async (size) => {
        setPageSize(size);
        setActivePage(1);
        loadTeamUsers(activePage, size)
            .then()
            .catch((reason) => {
                showError(reason);
            });
    };
    return (
        <Table
            columns={columns}
            dataSource={users}
            pagination={{
                formatPageText: (page) =>
                    t('第 {{start}} - {{end}} 条，共 {{total}} 条', {
                        start: page.currentStart,
                        end: page.currentEnd,
                        total: users.length,
                    }),
                currentPage: activePage,
                pageSize: pageSize,
                total: userCount,
                pageSizeOpts: [10, 20, 50, 100],
                showSizeChanger: true,
                onPageSizeChange: (size) => {
                    handlePageSizeChange(size);
                },
                onPageChange: handlePageChange,
            }}
            loading={loading}
        />
    );
};

export default forwardRef(MemberTable);

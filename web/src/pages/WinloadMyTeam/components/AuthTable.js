import {
    Divider,
    Modal,
    Transfer,
    Checkbox,
    Avatar,
    Highlight,
    Typography,
    Tag,
    Collapse,
    Table,
    Dropdown,
} from '@douyinfe/semi-ui';
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
    useRef,
} from 'react';
import { API, showError } from '../../../helpers';
import {
    IconHandle,
    IconClose,
    IconTickCircle,
    IconClear,
    IconComment,
    IconMore,
    IconAlertCircle
} from '@douyinfe/semi-icons';
import './style.css';
const AuthTable = (props, ref) => {
    const { Text } = Typography;
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitloading, setSubmitloadingLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [authUsers, setAuthUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    const loadTeamUsers = async () => {
        setLoading(true);
        const url = `/api/winload-team/` + props.teamId;
        const res = await API.get(url).finally(() => {
            setLoading(false);
        });
        const { success, message, data } = res.data;
        if (success) {
            const colors = ['amber', 'indigo', 'cyan', 'blue'];
            const users = data.items.map((item, idx) => {
                return {
                    label: item.username,
                    value: item.user_id,
                    abbr: item.display_name.slice(0, 1),
                    color: colors[idx % colors.length],
                    key: item.user_id,
                    ...item,
                };
            });
            setUsers(users);
        } else {
            showError(message);
        }
    };

    const loadAuthUsers = async () => {
        setLoading(true);
        const url = `/api/winload-team/team_authorizd_group_users/${props.teamId}`;
        const res = await API.get(url).finally(() => {
            setLoading(false);
        });
        const { success, message, data } = res.data;
        if (success) {
            setAuthUsers(data);
            return;
        }
        showError(message);
    };
    const openAuth = () => {
        setVisible(true);
    };
    const onChangeUsers = async (_, items) => {
        setSelectedUsers(items);
    };

    const handleInAuthGroup = async () => {
        setSubmitloadingLoading(true);
        const res = await API.post(
            '/api/winload-team/update_user2team_in_authorized_group/' + 1,
            selectedUsers,
        ).finally(() => {
            setSubmitloadingLoading(false);
        });

        const { success, message } = res.data;
        if (success) {
            setVisible(false);
        } else {
            showError(message);
        }
    };

    useImperativeHandle(ref, () => ({
        openAuth,
        loadAuthUsers,
    }));

    useEffect(() => {
        if (visible) {
            loadTeamUsers();
        }
    }, [visible]);

    const renderSourceItem = (item) => {
        return (
            <div className='components-transfer-demo-source-item' key={item.user_id}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Checkbox
                        onChange={() => {
                            item.onChange();
                        }}
                        key={item.label}
                        checked={item.checked}
                        style={{ height: 52, alignItems: 'center' }}
                    >
                        <Avatar color={item.color} size='small'>
                            {item.abbr}
                        </Avatar>
                        <div className='info'>
                            <div className='name'>
                                <Highlight
                                    sourceString={item.label}
                                    searchWords={[searchText]}
                                ></Highlight>
                            </div>
                            <div className='email'>
                                <Highlight
                                    sourceString={item.display_name}
                                    searchWords={[searchText]}
                                ></Highlight>
                            </div>
                        </div>
                    </Checkbox>
                    <div>
                        {item.in_authorized_group && (
                            <Tag color='light-blue' style={{ marginRight: '10px' }}>
                                权限
                            </Tag>
                        )}
                        {item.editable && (
                            <Tag color='light-blue' style={{ marginRight: '10px' }}>
                                编
                            </Tag>
                        )}
                        {item.joining_approval_able && (
                            <Tag color='light-blue' style={{ marginRight: '10px' }}>
                                审
                            </Tag>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderSelectedItem = (item) => {
        return (
            <div
                className='components-transfer-demo-selected-item'
                key={item.user_id}
            >
                <Avatar color={item.color} size='small'>
                    {item.abbr}
                </Avatar>
                <div className='info'>
                    <div className='name'>{item.label}</div>
                    <div className='email'>{item.display_name}</div>
                </div>
                <IconClose onClick={item.onRemove} />
            </div>
        );
    };
    const customFilter = (sugInput, item) => {
        return (
            item.display_name.includes(sugInput) || item.label.includes(sugInput)
        );
    };

    const onChangeAuth = async (record, key, e) => {
        const url = `/api/winload-team/update_user2team_auth`;
        if (key === 'joining_approval_able') {
            record.joining_approval_able = e.target.checked;
        }

        if (key === 'editable') {
            record.editable = e.target.checked;
        }

        if (key === 'clear_teamuser_able') {
            record.clear_teamuser_able = e.target.checked;
        }

        if (key === 'in_authorized_group') {
            // 退出权限组将清理所有权限
            record.in_authorized_group = false;
            record.joining_approval_able = false;
            record.clear_teamuser_able = false;
            record.editable = false;
        }

        const res = await API.post(url, record);
        if (!res.data.success) {
            showError(res.data.message);
            return
        }
        loadAuthUsers()
    }

    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
        },
        {
            title: '审核成员加入',
            dataIndex: 'joining_approval_able',
            render: (text, record) => {
                return (
                    <Checkbox checked={text} size='small' onChange={(val) => { onChangeAuth(record, 'joining_approval_able', val) }}></Checkbox>
                );
            },
        },
        {
            title: '编辑团队信息',
            dataIndex: 'editable',
            render: (text, record) => {
                return (
                    <Checkbox checked={text} size='small' onChange={(val) => { onChangeAuth(record, 'editable', val) }}></Checkbox>
                );
            },
        },
        {
            title: '清退成员',
            dataIndex: 'clear_teamuser_able',
            render: (text, record) => {
                return (
                    <Checkbox checked={text} size='small' onChange={(val) => { onChangeAuth(record, 'clear_teamuser_able', val) }}></Checkbox>
                );
            },
        },
        {
            title: '操作',
            dataIndex: 'default_authtable_operate',
            render: (text, record) => {
                return (
                    <Dropdown
                        position='bottomLeft'
                        render={
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => { onChangeAuth(record, 'in_authorized_group') }} type='danger' icon={<IconAlertCircle />}>
                                    退出权限组
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        }
                    >
                        <IconMore />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <>
            <div>
                <Divider></Divider>
                <Collapse defaultActiveKey={['1']}>
                    <Collapse.Panel header='成员' itemKey='1'>
                        <Table
                            columns={columns}
                            dataSource={authUsers}
                            pagination={false}
                        />
                    </Collapse.Panel>
                </Collapse>
            </div>
            <Modal
                confirmLoading={submitloading}
                closable={false}
                onCancel={() => setVisible(false)}
                visible={visible}
                width={800}
                onOk={handleInAuthGroup}
            >
                <div style={{ marginBottom: '10px' }}>
                    <Text type='success'>加入的人员将进入权限组，可以分配指定权限</Text>
                </div>
                <Transfer
                    loading={loading}
                    style={{ height: '600px' }}
                    dataSource={users}
                    filter={customFilter}
                    renderSelectedItem={renderSelectedItem}
                    renderSourceItem={renderSourceItem}
                    inputProps={{ placeholder: '搜索姓名' }}
                    onSearch={(searchText) => setSearchText(searchText)}
                    onChange={(values, items) => onChangeUsers(values, items)}
                />
            </Modal>
        </>
    );
};

export default forwardRef(AuthTable);

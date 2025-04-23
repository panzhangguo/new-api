import {
    IconEdit,
    IconEdit2Stroked,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconUnlock,
    IconUser,
    IconUserGroup,
} from '@douyinfe/semi-icons';
import {
    Select,
    Divider,
    Descriptions,
    Space,
    Tag,
    Avatar,
    Tabs,
    TabPane,
    Button,
    Input,
    Typography,
    Tooltip,
} from '@douyinfe/semi-ui';
import { useEffect, useState, useRef } from 'react';
import { SERVER_ATTACHMENT_URL } from '../../expand/env';
import MemberTable from './components/MemberTable';
import { API, copy, showError } from '../../helpers';
import EditTeam from './EditTeam';
import AuthTable from './components/AuthTable';
const teamDefaultInfo = [
    {
        field: 'name',
        key: '团队名',
        value: (
            <Tag size='small' shape='circle' color='violet'>
                团队名
            </Tag>
        ),
    },
    { field: 'code', key: '编码', value: '编码' },
    { field: 'owner_name', key: '创建人', value: '创建人' },
    {
        field: 'created_at',
        key: '创建日期',
        value: (
            <Tag size='small' shape='circle' color='violet'>
                创建日期
            </Tag>
        ),
    },
    { field: 'is_shared_key', key: '密钥共享', value: '密钥共享' },
    { field: 'joining_approval', key: '加入审核', value: '加入审核' },
    {
        field: 'description',
        key: '介绍',
        value: '这是一个很长很长很长很长很长很长很长很长很长的值',
        span: 3,
    },
];

const SelfTeam = (props) => {
    const { Text } = Typography;
    // const { teams } = props;
    // 默认为自己的团队
    const defaultTeam = props.teams.find(team => team.is_owner);
    const [selectedTeam, setSelectedTeam] = useState(defaultTeam ?? props.teams[0]);
    const [teamInfo, setTeamInfo] = useState(teamDefaultInfo);
    const [searchKey, setSearchKey] = useState('');
    const [userStatus, setUserStatus] = useState(0);
    const MemberTableRef = useRef();
    const AuthTableRef = useRef();
    const [codeSpinning, setCodeSpinning] = useState(false);
    const [activeKey, setActiveKey] = useState('1');

    // const [isOwner] = useState(props.teams[0]['is_owner']);
    const searchMember = () => {
        MemberTableRef.current.reload();
    };


    const openAuth = () => {
        AuthTableRef.current.openAuth();
    }

    const updateCode = async () => {
        setCodeSpinning(true);
        const { data: res } = await API.post(
            '/api/winload-team/update_code',
            selectedTeam.team,
        ).finally(() => {
            setCodeSpinning(false);
        });
        const { data, success, message } = res;
        if (success) {
            setSelectedTeam({
                ...selectedTeam,
                team: {
                    ...selectedTeam.team,
                    code: data,
                },
            });
        } else {
            showError(message)
        }
    };

    const copyCode = async (code) => {
        await copy(code);
    };
    const createDescription = (team) => {
        const teamInfo = [
            {
                field: 'name',
                key: '团队名',
                value: (
                    <Tag size='small' shape='circle' color='violet'>
                        {team.name}
                    </Tag>
                ),
            },
            {
                field: 'code',
                key: '编码',
                value: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Tooltip content='点击复制'>
                            <span onClick={() => copyCode(team.code)}>{team.code}</span>
                        </Tooltip>
                        {(selectedTeam.is_owner || selectedTeam.editable) && (
                            <IconRefresh
                                spin={codeSpinning}
                                style={{ color: '#9C27B0' }}
                                onClick={updateCode}
                            />
                        )}
                    </div>
                ),
            },
            { field: 'owner_name', key: '创建人', value: team.owner_name },
            {
                field: 'created_at',
                key: '创建日期',
                value: new Date(team.created_at).toLocaleString(),
            },
            {
                field: 'is_shared_key',
                key: '密钥共享',
                value: (
                    <Tag size='small' color={team.is_shared_key ? 'light-blue' : 'red'}>
                        {team.is_shared_key ? '是' : '否'}
                    </Tag>
                ),
            },
            {
                field: 'joining_approval',
                key: '加入审核',
                value: (
                    <Tag
                        size='small'
                        color={team.joining_approval ? 'light-blue' : 'red'}
                    >
                        {team.joining_approval ? '是' : '否'}
                    </Tag>
                ),
            },
            {
                field: 'description',
                key: '介绍',
                value: (
                    <Text
                        ellipsis={{
                            showTooltip: {
                                opts: { content: team.description },
                            },
                        }}
                        style={{ width: '100%' }}
                    >
                        {team.description}
                    </Text>
                ),
            },
        ];
        return teamInfo;
    };

    useEffect(() => {
        setTeamInfo(createDescription(selectedTeam.team));
        searchMember();
    }, [selectedTeam, userStatus]);

    useEffect(() => {
        if (activeKey === '2') {
            AuthTableRef.current.loadAuthUsers();
        }
    }, [activeKey]);

    const editSuccess = async () => {
        const res = await props.getTeams();
        const currentTeam = res.find((item) => item.id === selectedTeam.id);
        setSelectedTeam(currentTeam);
    };

    const changeTeam = (user2teamId) => {
        const team = props.teams.find((item) => item.id === user2teamId);
        setSelectedTeam(team);
        setActiveKey('1')
    };

    return (
        <>
            <div style={{ width: '100%', height: '100%' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        paddingBottom: '14px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '16px',
                        }}
                    >
                        {/* <IconUserGroup size='large'></IconUserGroup> */}
                        <Avatar
                            size='small'
                            src={SERVER_ATTACHMENT_URL + selectedTeam?.team?.avatar}
                        ></Avatar>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '16px',
                        }}
                    >
                        <Select
                            value={selectedTeam.id}
                            onChange={(value) => changeTeam(value)}
                        >
                            {props.teams?.map((team) => {
                                return (
                                    <Select.Option key={team.id} value={team.id}>
                                        {team.team.name}
                                    </Select.Option>
                                );
                            })}
                        </Select>
                        {(selectedTeam.is_owner || selectedTeam.editable) && (
                            <EditTeam
                                team={selectedTeam.team}
                                editSuccess={editSuccess}
                            ></EditTeam>
                        )}
                    </div>
                </div>
                <Divider></Divider>
                <div style={{ padding: '16px 20px 4px 20px' }}>
                    <Descriptions
                        layout='horizontal'
                        align='plain'
                        data={teamInfo}
                        column={3}
                    />
                </div>
                <Divider></Divider>
                <div style={{ padding: '16px 0px' }}>
                    <Tabs
                        type="card"
                        collapsible
                        activeKey={activeKey}
                        onChange={(val) => setActiveKey(val)}
                        tabBarExtraContent={
                            activeKey === '1' ? (
                                <>
                                    <Select
                                        onChange={(value) => {
                                            setUserStatus(value);
                                        }}
                                        value={userStatus}
                                        style={{ marginRight: '10px' }}
                                    >
                                        <Select.Option value={0}>全部</Select.Option>
                                        <Select.Option value={1}>所有者</Select.Option>
                                        <Select.Option value={2}>成员</Select.Option>
                                        <Select.Option value={3}>待审</Select.Option>
                                    </Select>
                                    <Input
                                        value={searchKey}
                                        onChange={setSearchKey}
                                        placeholder='姓名查询成员'
                                        style={{ width: '160px' }}
                                        suffix={
                                            <IconSearch
                                                style={{ cursor: 'pointer' }}
                                                onClick={searchMember}
                                            />
                                        }
                                        showClear
                                    ></Input>
                                </>
                            ) : activeKey === '2' ? (
                                <>
                                    <Button onClick={openAuth} theme='solid' type='primary' color='light-blue'><IconPlus />添加权限</Button>
                                </>
                            ) : null
                        }
                    >
                        <TabPane
                            tab={
                                <span>
                                    <IconUserGroup />
                                    用户
                                </span>
                            }
                            itemKey='1'
                        >
                            <MemberTable
                                searchKey={searchKey}
                                userStatus={userStatus}
                                teamId={selectedTeam.team_id}
                                user2team={selectedTeam}
                                ref={MemberTableRef}
                            ></MemberTable>
                        </TabPane>
                        {
                            selectedTeam.is_owner && <TabPane
                                tab={
                                    <span>
                                        <IconUnlock />
                                        权限
                                    </span>
                                }
                                itemKey='2'>
                                <AuthTable
                                    teamId={selectedTeam.team_id}
                                    ref={AuthTableRef}
                                ></AuthTable>
                            </TabPane>
                        }
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default SelfTeam;

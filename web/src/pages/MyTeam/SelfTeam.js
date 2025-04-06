import {
    IconEdit,
    IconEdit2Stroked,
    IconRefresh,
    IconSearch,
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
    Typography, Tooltip
} from '@douyinfe/semi-ui';
import { useEffect, useState, useRef } from 'react';
import { SERVER_ATTACHMENT_URL } from '../../expand/env';
import MemberTable from './components/MemberTable';
import { API, copy } from '../../helpers';
import EditTeam from './EditTeam';
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
    const [selectedTeam, setSelectedTeam] = useState(props.teams[0]);
    const [teamInfo, setTeamInfo] = useState(teamDefaultInfo);
    const [searchKey, setSearchKey] = useState('');
    const MemberTableRef = useRef();
    const [codeSpinning, setCodeSpinning] = useState(false);
    const flag = useRef(true);

    // const [isOwner] = useState(props.teams[0]['is_owner']);
    const searchMember = () => {
        MemberTableRef.current.reload();
    };

    const updateCode = async () => {
        setCodeSpinning(true)
        const { data: res } = await API.post('/api/winload-team/update_code', selectedTeam.team).finally(() => {
            setCodeSpinning(false)
        });
        const { data, success } = res
        if (success) {
            setSelectedTeam({
                ...selectedTeam,
                team: {
                    ...selectedTeam.team,
                    code: data
                }
            })
        }
    }

    const copyCode = async (code) => {
        await copy(code);
    }
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
                        {
                            selectedTeam.is_owner && <IconRefresh spin={codeSpinning} style={{ color: '#9C27B0' }} onClick={updateCode} />
                        }
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
                    <Tag
                        size='small'
                        color={team.is_shared_key ? 'light-blue' : 'red'}
                    >
                        {team.is_shared_key ? '是' : '否'}
                    </Tag>
                ),
            },
            {
                field: 'description', key: '介绍', value:
                    <Text
                        ellipsis={{
                            showTooltip: {
                                opts: { content: team.description }
                            }
                        }}
                        style={{ width: "300px" }}
                    >
                        {team.description}
                    </Text>
            },
        ];
        return teamInfo;
    };

    useEffect(() => {
        if (flag.current) {
            flag.current = false;
            return;
        }
        setTeamInfo(createDescription(selectedTeam.team));
        searchMember()
    }, [selectedTeam]);

    const editSuccess = async () => {
        const res = await props.getTeams()
        const currentTeam = res.find(item => item.id === selectedTeam.id)
        setSelectedTeam(currentTeam)
    }

    const changeTeam = (user2teamId) => {
        const team = props.teams.find(item => item.id === user2teamId)
        setSelectedTeam(team);
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
                            src={SERVER_ATTACHMENT_URL + selectedTeam.team?.avatar}
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
                        {
                            selectedTeam.is_owner && <EditTeam team={selectedTeam.team} editSuccess={editSuccess}></EditTeam>
                        }
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
                <div style={{ padding: '16px 20px' }}>
                    <Tabs
                        type='button'
                        tabBarExtraContent={
                            <>
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
                        }
                    >
                        <TabPane tab='用户' itemKey='1'>
                            <MemberTable
                                searchKey={searchKey}
                                teamId={selectedTeam.team_id}
                                ref={MemberTableRef}
                            ></MemberTable>
                        </TabPane>
                        <TabPane tab='权限' itemKey='2'>
                            权限列表
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default SelfTeam;

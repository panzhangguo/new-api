import { IconAlarm, IconBolt, IconFlag, IconLikeHeart, IconPlus, IconSearch } from "@douyinfe/semi-icons"
import { Card, RadioGroup, Radio, Space, Form, Button, Input, Row, Col, Tag, Avatar, Typography, Table, Modal } from "@douyinfe/semi-ui"
const { Text } = Typography;
const { Meta } = Card;
import style from './style.module.css'
import { API, showError, showSuccess, showWarning, timestamp2string } from "../../helpers";
import { useEffect, useRef, useState } from "react";
import { renderGroup, renderQuota } from "../../helpers/render";
import { renderStatus } from "./utils";
const MyApiTable = () => {
    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text, record, index) => {
                return <div>
                    <Space>
                        {renderStatus(text, record.model_limits_enabled)}
                        {renderGroup(record.group)}
                    </Space>
                </div>;
            },
        },
        {
            title: '已用额度',
            dataIndex: 'used_quota',
            render: (text, record, index) => {
                return <div>{renderQuota(parseInt(text))}</div>;
            },
        },
        {
            title: '剩余额度',
            dataIndex: 'remain_quota',
            render: (text, record, index) => {
                return (
                    <div>
                        {record.unlimited_quota ? (
                            <Tag size={'large'} color={'white'}>
                                无限制
                            </Tag>
                        ) : (
                            <Tag size={'large'} color={'light-blue'}>
                                {renderQuota(parseInt(text))}
                            </Tag>
                        )}
                    </div>
                );
            },
        },
        {
            title: '创建时间',
            dataIndex: 'created_time',
            render: (text, record, index) => {
                return <div>{timestamp2string(text)}</div>;
            },
        },
        {
            title: '过期时间',
            dataIndex: 'expired_time',
            render: (text, record, index) => {
                return (
                    <div>
                        {record.expired_time === -1 ? '永不过期' : timestamp2string(text)}
                    </div>
                );
            },
        },
        {
            title: '操作',
            dataIndex: 'default_operate',
            render: (text, record, index) => {
                return (
                    <Button onClick={() => { joinKeyToTeam(record) }} icon={<IconPlus />} />
                );
            },
        },
    ];

    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [apis, setApis] = useState([]);
    const [user2teams, setUser2teams] = useState([]);
    const [teamVisible, setTeamVisible] = useState(false);
    const [selectedApiRecord, setSelectedApiRecord] = useState({});
    const [selectedUser2TeamId, setSelectedUser2TeamId] = useState();

    const flag = useRef(true);
    const requestPersonalApi = async (values) => {
        let searchKeyword = values.keyword;
        if (!searchKeyword) {
            return;
        }
        setSearching(true);
        const res = await API.get(
            `/api/token/search?keyword=${searchKeyword}`,
        ).finally(() => { setSearching(false); });
        const { success, message, data } = res.data;
        if (success) {
            setApis(data)
        } else {
            showError(message);
        }
    };

    useEffect(() => {
        if (flag.current) {
            flag.current = false;
            return;
        }
        if (teamVisible) {
            API.get('/api/winload-team/self_all').then(res => {
                const { data, success, message } = res.data;
                if (success && data.length > 0) {
                    setUser2teams(data);
                } else {
                    showError(message);
                }
            });
        }
    }, [teamVisible])
    const joinKeyToTeam = async (record) => {
        setTeamVisible(true);
        setSelectedApiRecord(record)
    }
    const changeSelectedUser2Team = (e) => {
        setSelectedUser2TeamId(e.target.value);
    }
    const submitKeyToTeam = async () => {
        if (!selectedUser2TeamId) {
            showWarning("请选择要共享的团队");
            return
        }
        const user2team = user2teams.find(item => item.id === selectedUser2TeamId);
        const res = await API.post('/api/winload_team_key', {
            key_id: selectedApiRecord.id,
            key_user_id: selectedApiRecord.user_id,
            key_api: selectedApiRecord.key,
            team_id: user2team.team_id,
            team_owner_id: user2team.user_id,
        });
        const { success, message } = res.data;
        if (success) {
            showSuccess('加入成功');
            setTeamVisible(false);
        } else {
            showError(message);
        }
    }
    return (
        <div style={{
            width: '100%', display: 'flex', flexDirection: "column", padding: '12px', borderRadius: '8px',
            alignItems: 'flex-start', border: '1px solid var(--semi-color-border)'
        }}>
            <h4>我的令牌</h4>
            <div style={{ width: '100%', marginBottom: '12px', maxHeight: '500px' }}>
                <Form onSubmit={requestPersonalApi} layout="horizontal">
                    <Form.Input placeholder="搜索个人令牌名称" style={{ width: '400px' }} prefix={<IconSearch />} noLabel field="keyword" />
                    <Button loading={searching} type="primary" htmlType="submit">查询</Button>
                </Form>
                <Table loading={loading} className={style['my-api-table']} pagination={null} dataSource={apis} columns={columns} />
            </div>
            <Modal closable={false} visible={teamVisible} onCancel={() => setTeamVisible(false)} onOk={() => submitKeyToTeam()}>
                <RadioGroup value={selectedUser2TeamId} onChange={changeSelectedUser2Team} type='card' direction='vertical' >
                    {
                        user2teams.map((user2team) => {
                            return (
                                <Radio key={user2team.id} value={user2team?.id} extra={user2team?.team.description} >
                                    {user2team?.team.name}
                                </Radio>
                            )
                        })
                    }
                </RadioGroup>
            </Modal>
        </div>
    )
};

export default MyApiTable;
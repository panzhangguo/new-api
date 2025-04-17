import { IconAlarm, IconBolt, IconCopy, IconFlag, IconGithubLogo, IconLikeHeart, IconRefresh, IconSearch, IconStar, IconUserGroup } from "@douyinfe/semi-icons"
import { Card, Input, List, Row, Col, ButtonGroup, Button, Tag, Avatar, Typography, Table, Popconfirm } from "@douyinfe/semi-ui"
import { useEffect, useRef, useState } from "react";
import { API, showError } from "../../helpers";
import { SERVER_ATTACHMENT_URL } from "../../expand/env";
const { Text, Paragraph } = Typography;
import style from './style.module.css'
import { renderStatus } from "./utils";
import { renderGroup, renderQuota } from "../../helpers/render";
import { Divider } from "semantic-ui-react";
import { deepCopy } from "../../helpers/winload-utils";
// import {} from ''
const MyTeamApiBox = () => {
    const unloaded = useRef(true);
    const [originTeamKey, setOriginTeamKey] = useState([]);
    const [teamKeys, setTeamKeys] = useState([]);
    const [searchStatus, setSearchStatus] = useState([])
    const [keyword, setKeyword] = useState('')
    const loadUsefulTeamApi = () => {
        API.get('/api/winload_team_key/self_useful').then(res => {
            const { data, success, message } = res.data;
            if (success) {
                console.log(data);
                setTeamKeys(data);
                setOriginTeamKey(deepCopy(data));
                return
            }
            showError(message);
        });
    }

    const listItemStyle = {
        border: '1px solid var(--semi-color-border)',
        backgroundColor: 'var(--semi-color-bg-2)',
        borderRadius: '3px',
        margin: '8px 2px',
    };

    const onRemoveTeamKey = async (id) => {
        const res = await API.delete('/api/winload_team_key/' + id)
        if (res.data.success) {
            loadUsefulTeamApi();
            return
        }
        showError(res.data.message);
    }
    const handlerSearchStatus = (idx) => {
        if (searchStatus.includes(idx)) {
            setSearchStatus(searchStatus.filter(item => item !== idx))
        } else {
            setSearchStatus([...searchStatus, idx])
        }
    }

    useEffect(() => {
        if (!unloaded.current) return;
        unloaded.current = false;
        // 只在组件挂载时加载一次
        loadUsefulTeamApi();
    }, [])

    useEffect(() => {
        // const searchTeamKeys = teamKeys.filter(item => item.keys.name.includes(keyword))
        // teamKeys的结构为[{team:[{id:int}],keys:[{name:string}]}]
        // 给定keys的name包含keyword的teamKeys，并过滤掉没有的teamKeys和keys
        const filteredTeamKeys = originTeamKey.map(teamKey => {
            // 过滤 keys 数组，只保留 name 包含 keyword 的元素
            let filteredKeys = teamKey.keys.filter(key => key.name.toLowerCase().includes(keyword.toLowerCase()));
            if (searchStatus.includes('expired_time')) {
                filteredKeys = filteredKeys.filter(key => key.expired_time === -1);
            }
            if (searchStatus.includes('unlimited_quota')) {
                filteredKeys = filteredKeys.filter(key => key.unlimited_quota === true);
            }
            if (searchStatus.includes('status_3')) {
                filteredKeys = filteredKeys.filter(key => key.status === '3');
            }
            return {
                ...teamKey,
                keys: filteredKeys
            };
        }).filter(teamKey => teamKey.keys.length > 0); // 过滤掉 keys 数组为空的 teamKeys
        setTeamKeys(filteredTeamKeys);

    }, [keyword, searchStatus])

    return (
        <div className={style['my-teamapi-box']} style={{
            width: '100%', display: 'flex', flexDirection: "column", padding: '12px', borderRadius: '8px',
            alignItems: 'center', border: '1px solid var(--semi-color-border)'
        }}>
            <h2>团队密钥</h2>
            <div style={{ width: '100%', display: "flex", justifyContent: "space-between" }}>
                <Input value={keyword} onChange={(v) => setKeyword(v)} size="large" placeholder="请输入密钥名称" prefix={<IconSearch />} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div></div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <Tag color='cyan' type={searchStatus.includes('unlimited_quota') ? 'solid' : 'ghost'} onClick={() => handlerSearchStatus('unlimited_quota')} prefixIcon={<IconBolt />} size="large" shape='circle'>无限额度</Tag>
                    <Tag color='cyan' type={searchStatus.includes('status_3') ? 'solid' : 'ghost'} onClick={() => handlerSearchStatus('status_3')} prefixIcon={<IconLikeHeart />} size="large" shape='circle'>过期</Tag>
                    <Tag color='cyan' type={searchStatus.includes('expired_time') ? 'solid' : 'ghost'} onClick={() => handlerSearchStatus('expired_time')} prefixIcon={<IconAlarm />} size="large" shape='circle'>无限期</Tag>
                </div>
                <div style={{ color: 'var(--semi-color-text-2)', paddingRight: '10px' }}>
                    <IconRefresh onClick={() => loadUsefulTeamApi()} />
                </div>
            </div>
            <div style={{
                marginTop: '30px',
                width: '100%',
            }}>
                {
                    teamKeys.map(teamKey => {
                        return (
                            <div style={{
                                display: 'flex', flexDirection: "column", justifyContent: 'space-between',
                                backgroundColor: 'var(--semi-color-bg-2)', border: '1px solid var(--semi-color-border)',
                                borderRadius: '8px', padding: "12px"
                            }}>
                                <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', marginBottom: '10px' }}>
                                    <Avatar
                                        src={SERVER_ATTACHMENT_URL + teamKey.team.avatar}
                                        size="default"
                                        style={{ flexShrink: 0 }}
                                    />
                                    <div style={{ width: '100%', marginLeft: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <Text ellipsis={{ showTooltip: { opts: { content: teamKey.team.name } } }}
                                            style={{ fontSize: '16px', color: 'var(--semi-color-text-0)', width: 'calc(100% - 50px)' }}>{teamKey.team.name}</Text>
                                        <Text ellipsis={{ showTooltip: { opts: { content: teamKey.team.description } } }}
                                            style={{ fontSize: '12px', color: 'var(--semi-color-text-2)', width: 'calc(100% - 50px)' }}>{teamKey.team.description}</Text>
                                    </div>
                                </div>

                                <div style={{ border: '1px solid var(--semi-color-border)', padding: '10px', borderRadius: '8px' }}>
                                    <List
                                        grid={{
                                            gutter: 12,
                                            span: 8,
                                        }}
                                        dataSource={teamKey.keys}
                                        renderItem={key => (
                                            <List.Item style={listItemStyle}>
                                                <div style={{ padding: '14px', borderRadius: '8px', width: '100%' }}>
                                                    <Paragraph key={key.id} copyable={{
                                                        content: key.key_api,
                                                        render: (copied, doCopy, config) => {
                                                            return (
                                                                <div style={{ color: "#5095ff", display: "flex", alignItems: 'center', marginLeft: '10px' }} onClick={doCopy} >
                                                                    <IconCopy ></IconCopy>
                                                                    <span>{copied ? '复制成功' : ``}</span>
                                                                </div>
                                                            );
                                                        }
                                                    }}>
                                                        {key.name}
                                                    </Paragraph>
                                                    <div style={{ display: 'flex', gap: '10px', paddingTop: '10px' }} >
                                                        {renderStatus(key.status, key.model_limits_enabled)}
                                                        {renderGroup(key.group)}
                                                        <Tag size="large" type="ghost" shape='circle'>
                                                            {'剩余' + renderQuota(parseInt(key.remain_quota))}
                                                        </Tag>
                                                        <Tag size="large" type="ghost" shape='circle'>
                                                            {'已用' + renderQuota(parseInt(key.used_quota))}
                                                        </Tag>
                                                    </div>
                                                    <Divider></Divider>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <Popconfirm
                                                            title="确定是否要移除？"
                                                            content="此修改将不可逆"
                                                            onConfirm={() => { onRemoveTeamKey(key.id) }}
                                                        >
                                                            <Button theme="borderless">移除</Button>
                                                        </Popconfirm>
                                                    </div>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </div>

                            </div>
                        )
                    })
                }
            </div>
        </div >
    )
}

export default MyTeamApiBox
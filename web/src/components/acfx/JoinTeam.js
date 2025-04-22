import { Button, Modal, Tag, Input, Spin, Avatar } from '@douyinfe/semi-ui';
import { useEffect, useState, useRef } from 'react';
import { API, showError, showSuccess } from '../../helpers';
import { SERVER_ATTACHMENT_URL } from '../../expand/env';
import { useNavigate } from 'react-router-dom';

function useDebounce(fn, delay) {
    const refTimer = useRef();

    return function f(...args) {
        if (refTimer.current) {
            clearTimeout(refTimer.current);
        }
        refTimer.current = setTimeout(() => {
            fn(args);
        }, delay);
    };
}

const JoinTeam = () => {
    const [teams, setTeams] = useState([]); // pfee团队信息
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState();
    const [team, setTeam] = useState();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()
    const btnStyle = {
        width: 240,
        margin: '4px 50px',
    };

    useEffect(() => {
        getTeams();
    }, []);

    // 使用自定义 debounce 函数
    const debouncedFetch = useDebounce(async (code) => {
        setLoading(true);
        const res = await API.get(`/api/winload-team/team_bycode/${code}`).finally(
            () => {
                setLoading(false);
            },
        );
        // 处理响应数据
        const { success, data } = res.data;
        if (success) {
            setTeam(data);
        } else {
            setTeam(null);
        }
    }, 500);

    useEffect(() => {
        if (value) {
            debouncedFetch(value);
        }
    }, [value]);

    const getTeams = async () => {
        const res = await API.get('/api/winload-team/self_all/?containjoining=true');
        const { data, success } = res.data;
        if (success && data.length > 0) {
            setTeams(data);
        }
    };

    const joinTeam = async () => {
        const res = await API.get('/api/winload-team/join_team/' + team.code);
        const { success, message } = res.data;
        if (success) {
            showSuccess(message);
            setVisible(false);
            getTeams();
            return;
        }
        showError(message);
    };
    const createTeam = () => {
        navigate('/account/create-team')
    }
    const handleCancel = () => {
        setVisible(false);
    };

    const footer = (
        <div style={{ textAlign: 'center' }}>
            <Button
                disabled={!team}
                type='primary'
                theme='solid'
                onClick={joinTeam}
                style={btnStyle}
            >
                申请加入
            </Button>
            <Button
                type='primary'
                theme='borderless'
                onClick={handleCancel}
                style={btnStyle}
            >
                放弃
            </Button>
        </div>
    );
    return (
        <div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <Button onClick={createTeam}>创建团队</Button>
                <Button onClick={() => setVisible(true)}>参与团队</Button>
            </div>
            <div
                style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                    marginTop: '10px',
                }}
            >
                {teams.map((team) => {
                    return (
                        <Tag
                            key={team.team_id}
                            type='ghost'
                            color='light-blue'
                            suffixIcon={team.status === 3 && <span>(审)</span>}
                        >
                            {team.team.name}
                        </Tag>
                    );
                })}
            </div>
            <Modal centered closable={false} visible={visible} footer={footer}>
                <h3 style={{ textAlign: 'center', fontSize: 24, margin: 40 }}>
                    加入团队
                </h3>

                <Input
                    showClear
                    placeholder='请输入团队码'
                    value={value}
                    onChange={(value) => setValue(value)}
                />
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Spin spinning={loading}>
                        {team && (
                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: '8px',
                                    height: '60px',
                                }}
                            >
                                <Avatar
                                    size='small'
                                    src={SERVER_ATTACHMENT_URL + team.avatar}
                                />
                                <strong>{team?.name}</strong>
                            </div>
                        )}
                    </Spin>
                </div>
            </Modal>
        </div>
    );
};

export default JoinTeam;

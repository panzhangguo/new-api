// 添加组织管理/租户
import React, { useEffect, useState, useRef } from 'react';
import { API, showError, showSuccess } from '../../helpers';
import { Banner, Card, Avatar, Space, Button, Typography, Tag, Modal } from '@douyinfe/semi-ui';
import { SERVER_ATTACHMENT_URL } from '../../expand/env';
const TeamManage = () => {
  const flag = useRef(true);

  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState([]);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const loadUsers = async (startIdx, pageSize) => {
    const res = await API.get(`/api/tenant/?p=${startIdx}&page_size=${pageSize}`);
    const { success, message, data } = res.data;
    if (success) {
      setTeams(data.items);
      return
    }
    showError(message);
  };

  const banner = (
    <Banner
      description="团队管理员必须设置一个负责人，若无，请平台管理员创建"
    />
  );
  useEffect(() => {
    if (flag.current) {
      flag.current = false;
      return;
    }
    API.get(`/api/winload-team/all_teams`).then(res => {
      const { success, data, message } = res.data
      if (success) {
        setTeams(data.items)
        setTotal(data.total)
        return
      }
      showError(message)
    })
  }, []);
  const { Text } = Typography;
  const { Meta } = Card;


  const openDetail = (id) => {
    setVisible(true)
    API.get(`/api/winload-team/` + id).then(res => {
      const { success, data, message } = res.data
      if (success) {
        setTeam(data)
        return
      }
      showError(message)
    })
  }
  return (
    <>
      {/* {banner} */}
      <div>
        <Tag size='large' color='blue'>共注册{total}个团队</Tag>
        <div style={{ padding: '12px 0 12px 0', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {
            teams.map((team) => {
              return (
                <Card
                  key={team.id}
                  style={{ width: 360 }}
                  headerExtraContent={
                    <Text link onClick={() => openDetail(team.id)}>
                      更多
                    </Text>
                  }
                  title={
                    <Meta
                      title={team.name}
                      description={team.code}
                      avatar={
                        <Avatar
                          alt='Card meta img'
                          size="default"
                          src={SERVER_ATTACHMENT_URL + team.avatar}
                        />
                      }
                    />
                  }
                  footerLine={true}
                  footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
                  footer={
                    <Space>
                      <Tag >拥有者：{team.username}</Tag>
                      {/* <Button theme='solid' type='primary'>编辑</Button> */}
                    </Space>
                  }
                >
                  <div style={{ height: '100px' }}>
                    {
                      team.description
                    }
                  </div>
                </Card>
              )
            })
          }
        </div>
      </div>
      <Modal visible={visible} onCancel={() => setVisible(false)} closable footer={null}>
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            加入审核<Tag
              size='small'
              color={team.is_shared_key ? 'light-blue' : 'red'}
            >
              {team.is_shared_key ? '是' : '否'}
            </Tag>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            密钥审核
            <Tag
              size='small'
              color={team.joining_approval ? 'light-blue' : 'red'}
            >
              {team.joining_approval ? '是' : '否'}
            </Tag>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            创建日期
            <span>{new Date(team.created_at).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            最后更新
            <span>{new Date(team.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default TeamManage;

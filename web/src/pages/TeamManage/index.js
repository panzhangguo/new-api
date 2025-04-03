// 添加组织管理/租户
import React, { useEffect, useState, useRef } from 'react';
import { API, showError, showSuccess } from '../../helpers';
import { Banner, Card, Avatar, Space, Button, Typography } from '@douyinfe/semi-ui';
const TeamManage = () => {
  const flag = useRef(true);

  const [teams, setTeams] = useState([]);

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
    loadUsers(0, 10)
      .then()
      .catch((reason) => {
        showError(reason);
      });
  }, []);
  const { Text } = Typography;
  const { Meta } = Card;

  return (
    <>
      {banner}
      <div style={{ padding: '12px 0 12px 0', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {
          teams.map((team) => {
            return (
              <Card
                key={team.id}
                style={{ maxWidth: 360 }}
                headerExtraContent={
                  <Text link>
                    更多
                  </Text>
                }
                title={
                  <Meta
                    title={team.display_name}
                    description="tc-20250403ljhwZthlaukjlkulzlp"
                    avatar={
                      <Avatar
                        alt='Card meta img'
                        size="default"
                        src='https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/card-meta-avatar-docs-demo.jpg'
                      />
                    }
                  />
                }
                footerLine={true}
                footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
                footer={
                  <Space>
                    <Button theme='borderless' type='primary'>{team.username}</Button>
                    <Button theme='solid' type='primary'>编辑</Button>
                  </Space>
                }
              >
                Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统。设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的 Web 应用。
              </Card>
            )
          })
        }


      </div>
    </>
  )
}

export default TeamManage;

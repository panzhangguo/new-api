import { useEffect, useRef, useState } from 'react';
import { API, copy, showError } from '../../helpers';
import { Form, Button, Space, Typography, Tag } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import { rsaPsw } from '../../helpers/acfx-utils';
const {
  Section,
  Input,
  InputGroup,
  DatePicker,
  TimePicker,
  Select,
  Switch,
  InputNumber,
  Checkbox,
  CheckboxGroup,
  RadioGroup,
  Radio,
} = Form;
const { Text } = Typography;
const AcfxKnowledgeSetting = () => {
  const [loading, setLoading] = useState(true);
  const [isEmpty, setEmpty] = useState(true);
  const [isFormVisiable, setFormVisiable] = useState(false);
  const [teams, setTeams] = useState([]);
  const [models, setModels] = useState([]);
  const [team, setKnowledgeTeam] = useState('');
  const flag = useRef(true);
  const userformRef = useRef();

  const loginuser = localStorage.getItem('user');
  const navigate = useNavigate();
  if (!loginuser) {
    showError('请先登录');
    navigate('/login');
  }
  const user = JSON.parse(loginuser);
  const baseSettingInitValues = {
    team_id: '',
    protocol: 'http',
    ip: '127.0.0.1',
    port: 9222,
    chat_model: 'deepseek-r1',
    embedding_model: 'Doubao-embedding',
    validity_period: 'always',
    expried_date: '',
  };
  const userInitValues = {
    username: user.username,
    email: user.username + '@acfx.cn',
    password: '',
  };

  const getSelfTeams = async () => {
    const res = await API.get('/api/winload-team/self_all').finally(() => {
      setLoading(false);
    });
    const { data, success } = res.data;
    if (success && data.length > 0) {
      setEmpty(false);
      setTeams(data);
    }
  };

  const getSelfModels = async () => {
    const res = await API.get('/api/user/models').finally(() => {
      setLoading(false);
    });
    const { data, success } = res.data;
    if (success && data.length > 0) {
      setModels(data);
    }
  };

  useEffect(() => {
    if (flag.current) {
      flag.current = false;
      return;
    }
    getSelfTeams();
    getSelfModels();
  }, []);
  const copyText = async (text) => {
    if (await copy(text)) {
      showSuccess('已复制：' + text);
    } else {
      Modal.error({ title: '无法复制到剪贴板，请手动复制', content: text });
    }
  };

  const submitSetting = async (values, step = 'base') => {
    console.log(step);
    console.log(values);
    if (step === 'user') {
      const password = rsaPsw(values.password);
      const res = await API.post('/api/winload-team/knowledge-setting', {
        ...values,
        team_id: {
          ...values,
          password: password,
        },
      });
      const { success, message } = res.data;
      if (success) {
        showSuccess('保存成功');
      } else {
        showError(message);
      }
    }
  };

  const usernameHandleChange = (value) => {
    userformRef.current.formApi.setValue('email', value + '@acfx.cn');
  };
  return (
    <div>
      <h2>
        知识库 设置
        <Text style={{ marginLeft: '10px' }} type='danger'>
          当前，知识库只允许团队创建者配置
        </Text>
      </h2>
      <Form
        onSubmit={(values) => submitSetting(values)}
        initValues={baseSettingInitValues}
        style={{ width: 650 }}
        labelPosition='left'
      >
        <Section text={'基本信息'}>
          <Select
            field='team_id'
            label={{ text: '团队', required: true }}
            style={{ width: 560 }}
            placeholder={'请选择团队'}
          >
            {teams.map((team) => {
              return (
                <Select.Option key={team.id} value={team.id}>
                  {team.team?.name}
                </Select.Option>
              );
            })}
          </Select>
        </Section>
        <Section text={'系统配置'}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Select field='protocol' label='协议'>
              <Select.Option value='http'>http</Select.Option>
              <Select.Option value='https'>https</Select.Option>
            </Select>
            <Input
              field='ip'
              style={{ width: 120 }}
              label={{ text: 'ip地址', required: true }}
            />
            <Input
              field='port'
              style={{ width: 80 }}
              label={{ text: '端口', required: true }}
            />
          </div>
        </Section>
        <Section text={'模型配置'}>
          <Space style={{ marginTop: '12px' }}>
            {models.map((model) => {
              return (
                <Tag
                  onClick={() => {
                    copyText(model);
                  }}
                  key={model}
                  size='small'
                  shape='circle'
                  color='amber'
                >
                  {model}
                </Tag>
              );
            })}
          </Space>
          <Input
            field='chat_model'
            label={{ text: 'chat模型', required: true }}
            style={{ width: 176 }}
          />
          <Input
            field='embedding_model'
            label={{ text: '嵌入模型', required: true }}
            style={{ width: 176 }}
          />
          <RadioGroup
            field='validity_period'
            label='有效时间'
            direction='vertical'
            rules={[{ required: true }]}
          >
            <Radio value='always'>永久有效</Radio>
            <Radio value='custom'>
              <div style={{ display: 'inline-block' }}>
                自定义
                <Form.DatePicker
                  noLabel
                  field='expried_date'
                  style={{ width: 464, display: 'inline-block' }}
                />
              </div>
            </Radio>
          </RadioGroup>
        </Section>
        <Space>
          <Button
            htmlType='submit'
            type='primary'
            theme='solid'
            style={{ width: 120, marginTop: 12, marginRight: 4 }}
          >
            保存配置
          </Button>
          {/* <Button style={{ marginTop: 12 }}>预览</Button> */}
        </Space>
      </Form>
      <Section text={'账号'} style={{ marginTop: '12px' }}>
        <Form
          ref={userformRef}
          initValues={baseSettingInitValues}
          onSubmit={(values) => submitSetting(values, 'user')}
          style={{ width: 650 }}
          labelPosition='left'
        >
          <Text type='danger'>知识库账号生成请妥善保管</Text>
          <Input
            field='username'
            label={{ text: '账号', required: true }}
            placeholder={'请填写RAG知识库账号'}
            onChange={usernameHandleChange}
          ></Input>
          <Input
            field='email'
            label={{ text: '邮箱', required: true }}
            disabled
            placeholder={'请填写RAG知识库邮箱'}
          ></Input>
          <Input
            field='password'
            mode='password'
            label={{ text: '密码', required: true }}
            placeholder={'请填写RAG知识库密钥'}
          ></Input>
          <Space>
            <Button
              htmlType='submit'
              type='primary'
              theme='solid'
              style={{ width: 120, marginTop: 12, marginRight: 4 }}
            >
              创建用户
            </Button>
          </Space>
        </Form>
      </Section>
      <h2>密钥</h2>
      <Form
        onSubmit={(values) => submitSetting(values, 'key')}
        style={{ width: 650 }}
        labelPosition='left'
      >
        <Section text={'其他配置'} style={{ marginTop: '12px' }}>
          <Input
            field='api_key'
            label={{ text: '密钥', required: true }}
            placeholder={'请填写RAG知识库密钥'}
          ></Input>
        </Section>
        <Space>
          <Button
            htmlType='submit'
            type='primary'
            theme='solid'
            style={{ width: 120, marginTop: 12, marginRight: 4 }}
          >
            保存密钥
          </Button>
        </Space>
      </Form>
    </div>
  );
};

export default AcfxKnowledgeSetting;

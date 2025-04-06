import React, { useContext, useEffect, useState } from 'react';
import { Form, Col, Row, Button, Space, Image, Spin } from '@douyinfe/semi-ui';
import { IconUpload } from '@douyinfe/semi-icons';
import { UserContext } from '../../context/User';
import { API, showSuccess, showError } from '../../helpers';
const { Section, Input, InputNumber, AutoComplete, Select, TreeSelect, Cascader, DatePicker, TimePicker, TextArea, CheckboxGroup, Checkbox, RadioGroup, Radio, Slider, Rating, Switch, TagInput } = Form;
import { useNavigate } from 'react-router-dom';

const AddTeam = () => {
    const initValues = {
        name: '',
        is_shared_key: true,
        joining_approval: true,
        avatar: '',
        files: []
    };
    const navigate = useNavigate();
    const [spinning, setSpinning] = useState(false)
    const handleSubmit = async (values) => {
        setSpinning(true)
        const res = await API.post(`/api/winload-team`, { ...values, avatar: initValues.avatar }).finally(() => {
            setSpinning(false)
        });
        const { success, message } = res.data;
        if (success) {
            showSuccess(message);
            // props.createdSuccess();
            navigate('/account/my-team')
        } else {
            showError(message);
        }
    };

    const uploadRequest = async ({ file, onProgress, onError, onSuccess }) => {
        let formData = new FormData();
        formData.append("file", file.fileInstance);

        let count = 0;
        let interval = setInterval(() => {
            if (count === 100) {
                clearInterval(interval);
                onSuccess();
                return;
            }
            onProgress({ total: 120, loaded: count });
            count += 20;
        }, 500);

        const res = await API.post(`/api/winload-team/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        });
        if (res.data.success) {
            clearInterval(interval);
            onSuccess()
            initValues.avatar = res.data.data
        } else {
            onError()
        }
    }
    return (
        <Spin spinning={spinning} tip="正在创建，请稍后...">
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Form
                    initValues={initValues}
                    style={{ padding: 10, width: '50%' }}
                    onSubmit={values => handleSubmit(values)}
                >
                    <Section text={'基本信息'}>
                        <Row>
                            <Col span={24}>
                                <Input
                                    field="name"
                                    label="名称"
                                    trigger='blur'
                                    rules={[
                                        { required: true, message: '名称不可缺少' }
                                    ]}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Upload
                                    field='files'
                                    label='头像'
                                    multiple={false}
                                    action=""
                                    customRequest={uploadRequest}
                                    previewFile={file => file.uid === '1' ? <IconFile size="large" /> : <Image src={file.url} />}
                                >
                                    <Button icon={<IconUpload />} theme="light">
                                        点击上传
                                    </Button>
                                </Form.Upload>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <TextArea
                                    style={{ height: 80 }}
                                    field='description'
                                    label='介绍'
                                    placeholder='请填写介绍'
                                />
                            </Col>
                        </Row>
                    </Section>
                    <Section text='详情'>
                        <Row>
                            <Col span={24}>
                                <RadioGroup field="is_shared_key" label='是否共享资源（个人令牌）' rules={[
                                    { type: 'boolean' },
                                    { required: true, message: '必须选择是否共享 ' }
                                ]}>
                                    <Radio value={true}>是</Radio>
                                    <Radio value={false}>否</Radio>
                                </RadioGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <RadioGroup field="joining_approval" label='是否审核人员加入' rules={[
                                    { type: 'boolean' },
                                    { required: true, message: '加入需审核' }
                                ]}>
                                    <Radio value={true}>是</Radio>
                                    <Radio value={false}>否</Radio>
                                </RadioGroup>
                            </Col>
                        </Row>
                    </Section>
                    <Section>
                        <div style={{ display: 'flex', justifyContent: 'flex-center', gap: "14px", width: '100%', paddingTop: "30px" }}>
                            <Button type="primary" theme="solid" htmlType="submit" className="btn-margin-right" >提交(submit)</Button>
                            <Button htmlType="reset">重置(reset)</Button>
                        </div>
                    </Section>
                </Form>
            </div>
        </Spin>
    );
};


export default AddTeam;

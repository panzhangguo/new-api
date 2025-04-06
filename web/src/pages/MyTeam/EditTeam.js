import React, { useContext, useEffect, useState } from 'react';
import {
    Form,
    Modal,
    Col,
    Row,
    Button,
    Space,
    Image,
    Spin,
    useFormState,
} from '@douyinfe/semi-ui';
import { IconUpload, IconEdit2Stroked, IconFile } from '@douyinfe/semi-icons';
import { UserContext } from '../../context/User';
import { API, showSuccess, showError } from '../../helpers';
import { SERVER_ATTACHMENT_URL } from '../../expand/env';
const {
    Section,
    Input,
    InputNumber,
    AutoComplete,
    Select,
    TreeSelect,
    Cascader,
    DatePicker,
    TimePicker,
    TextArea,
    CheckboxGroup,
    Checkbox,
    RadioGroup,
    Radio,
    Slider,
    Rating,
    Switch,
    TagInput,
} = Form;
const btnStyle = {
    width: 240,
    margin: '4px 50px',
};
const EditTeam = (props) => {
    const [editVisiable, setEditVisiable] = useState(false);
    const initValues = {
        name: props.team.name,
        is_shared_key: true,
        avatar: props.team.avatar,
        description: props.team.description,
        is_shared_key: props.team.is_shared_key,
        joining_approval: props.team.joining_approval ?? true,
        files: [
            {
                uid: '1',
                status: 'success',
                url: SERVER_ATTACHMENT_URL + props.team.avatar,
            },
        ],
    };

    const handleOk = async (formState) => {
        setSpinning(true);
        const res = await API.put(`/api/winload-team`, {
            ...formState.values,
            avatar: initValues.avatar,
            id: props.team.id,
        }).finally(() => {
            setSpinning(false);
        });
        const { success, message } = res.data;
        if (success) {
            showSuccess(message);
            props.editSuccess(formState.values);
            setEditVisiable(false);
        } else {
            showError(message);
        }
    };
    const handleCancel = () => {
        setEditVisiable(false);
    };
    const Footer = () => {
        const formState = useFormState();

        return (
            <div style={{ textAlign: 'center' }}>
                <Button
                    type='primary'
                    theme='solid'
                    onClick={() => handleOk(formState)}
                    style={btnStyle}
                >
                    保存
                </Button>
                <Button
                    type='primary'
                    theme='borderless'
                    onClick={handleCancel}
                    style={btnStyle}
                >
                    离开
                </Button>
            </div>
        );
    };

    const [spinning, setSpinning] = useState(false);
    const uploadRequest = async ({ file, onProgress, onError, onSuccess }) => {
        let formData = new FormData();
        formData.append('file', file.fileInstance);

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
                'Content-Type': 'multipart/form-data',
            },
        });
        if (res.data.success) {
            clearInterval(interval);
            onSuccess();
            initValues.avatar = res.data.data;
        } else {
            console.log('error');
            onError();
        }
    };
    return (
        <>
            <IconEdit2Stroked
                onClick={() => setEditVisiable(true)}
                size='large'
            ></IconEdit2Stroked>
            <Modal
                header={null}
                visible={editVisiable}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
            >
                <h3 style={{ textAlign: 'center', fontSize: 24, margin: 40 }}>
                    编辑当前团队
                </h3>
                <Spin spinning={spinning} tip='正在创建，请稍后...'>
                    <Form initValues={initValues} style={{ padding: 10, width: '100%' }}>
                        <Section text={'基本信息'}>
                            <Row>
                                <Col span={24}>
                                    <Input
                                        field='name'
                                        label='名称'
                                        trigger='blur'
                                        rules={[{ required: true, message: '名称不可缺少' }]}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Form.Upload
                                        field='files'
                                        label='头像'
                                        multiple={false}
                                        defaultFileList={initValues.files}
                                        action=''
                                        customRequest={uploadRequest}
                                        previewFile={(file) => <Image src={file.url} />}
                                    >
                                        <Button icon={<IconUpload />} theme='light'>
                                            点击上传
                                        </Button>
                                    </Form.Upload>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <TextArea
                                        style={{ height: 120 }}
                                        field='description'
                                        label='介绍'
                                        placeholder='请填写介绍'
                                    />
                                </Col>
                            </Row>
                        </Section>
                        <Section text='详情'>
                            <Row>
                                <Col>
                                    <RadioGroup
                                        field='is_shared_key'
                                        label='是否共享资源（个人令牌）'
                                        rules={[
                                            { type: 'boolean' },
                                            { required: true, message: '必须选择是否共享 ' },
                                        ]}
                                    >
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
                        <Footer />
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

export default EditTeam;

import { Divider, Modal, Transfer, Checkbox, Avatar, Highlight, Typography } from "@douyinfe/semi-ui"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { API } from "../../../helpers"
import { IconHandle, IconClose } from '@douyinfe/semi-icons';
import './style.css'
const AuthTable = (props, ref) => {
    const { Text } = Typography;
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState([])
    const [searchText, setSearchText] = useState('');

    const loadTeamUsers = async (startIdx, pageSize) => {
        setLoading(true);
        const url = `/api/winload-team/` + props.teamId
        const res = await API.get(url).finally(() => {
            setLoading(false);
        });
        const { success, message, data } = res.data;
        if (success) {
            const colors = ['amber', 'indigo', 'cyan', 'blue']
            const users = data.items.map((item, idx) => {
                return {
                    label: item.username,
                    value: item.display_name,
                    abbr: item.display_name.slice(0, 1),
                    color: colors[idx % colors.length],
                    key: idx + 1,
                }
            });
            setUsers(users)
        } else {
            showError(message);
        }
    };
    const openAuth = () => {
        setVisible(true)
    }
    useImperativeHandle(ref, () => ({
        openAuth,
    }));

    useEffect(() => {
        if (visible) {
            loadTeamUsers()
        }
    }, [visible])

    const renderSourceItem = item => {
        return (
            <div className="components-transfer-demo-source-item" key={item.label}>
                <Checkbox
                    onChange={() => {
                        item.onChange();
                    }}
                    key={item.label}
                    checked={item.checked}
                    style={{ height: 52, alignItems: 'center' }}
                >
                    <Avatar color={item.color} size="small">
                        {item.abbr}
                    </Avatar>
                    <div className="info">
                        <div className="name">
                            <Highlight sourceString={item.label} searchWords={[searchText]}></Highlight>
                        </div>
                        <div className="email">
                            <Highlight sourceString={item.value} searchWords={[searchText]}></Highlight>
                        </div>
                    </div>
                </Checkbox>
            </div>
        );
    };

    const renderSelectedItem = item => {
        return (
            <div className="components-transfer-demo-selected-item" key={item.label}>
                <Avatar color={item.color} size="small">
                    {item.abbr}
                </Avatar>
                <div className="info">
                    <div className="name">{item.label}</div>
                    <div className="email">{item.value}</div>
                </div>
                <IconClose onClick={item.onRemove} />
            </div>
        );
    };
    const data = [
        { label: '夏可漫', value: 'xiakeman@example.com', abbr: '夏', color: 'amber', area: 'US', key: 1 },
        { label: '申悦', value: 'shenyue@example.com', abbr: '申', color: 'indigo', area: 'UK', key: 2 },
        { label: '文嘉茂', value: 'wenjiamao@example.com', abbr: '文', color: 'cyan', area: 'HK', key: 3 },
        { label: '曲晨一', value: 'quchenyi@example.com', abbr: '曲', color: 'blue', area: 'India', key: 4 },
        { label: '曲晨二', value: 'quchener@example.com', abbr: '二', color: 'blue', area: 'India', key: 5 },
        { label: '曲晨三', value: 'quchensan@example.com', abbr: '三', color: 'blue', area: 'India', key: 6 },
    ];
    const customFilter = (sugInput, item) => {
        return item.value.includes(sugInput) || item.label.includes(sugInput);
    };
    return (
        <>
            <div>
                <Divider></Divider>
            </div>
            <Modal closable={false} onCancel={() => setVisible(false)} visible={visible} width={800}>
                <div style={{marginBottom: '10px'}}>
                    <Text type="success">加入的人员将进入权限组，可以分配指定权限</Text>
                </div>
                <Transfer
                    style={{ height: '600px' }}
                    dataSource={users}
                    filter={customFilter}
                    renderSelectedItem={renderSelectedItem}
                    renderSourceItem={renderSourceItem}
                    inputProps={{ placeholder: '搜索姓名' }}
                    onSearch={searchText => setSearchText(searchText)}
                    onChange={(values, items) => console.log(values, items)}
                />
            </Modal>
        </>
    )
}

export default forwardRef(AuthTable)
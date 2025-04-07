import { IconAlarm, IconBolt, IconFlag, IconLikeHeart, IconSearch } from "@douyinfe/semi-icons"
import { Card, Input, Row, Col, Tag, Avatar, Typography, Table } from "@douyinfe/semi-ui"
const { Text } = Typography;
const { Meta } = Card;

const MyTeamApiBox = () => {
    return (
        <div style={{
            width: '100%', display: 'flex', flexDirection: "column", padding: '12px', borderRadius: '8px',
            alignItems: 'center', border: '1px solid var(--semi-color-border)'
        }}>
            <h2>团队密钥</h2>
            <div style={{ width: '100%' }}>
                <Input size="large" placeholder="请输入密钥名称" prefix={<IconSearch />} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                <Tag prefixIcon={<IconBolt />} size="large" type="ghost" shape='circle'>无限额度</Tag>
                <Tag prefixIcon={<IconAlarm />} size="large" type="ghost" shape='circle'>无限期</Tag>
                <Tag prefixIcon={<IconLikeHeart />} size="large" type="ghost" shape='circle'>我的</Tag>
                <Tag prefixIcon={<IconFlag />} size="large" type="ghost" shape='circle'>团队共享</Tag>
            </div>
            <div style={{
                marginTop: '30px',
                width: '100%', padding: '20px'
            }}>
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Card
                            title={
                                <Meta
                                    title="万控智造股份有限公司"
                                    description="万控智造股份有限公司万控智造股份有限公司万控智造股份有限公司"
                                    avatar={
                                        <Avatar
                                            alt='Card meta img'
                                            size="default"
                                        />
                                    }
                                />
                            }>
                            Card Content
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title='Card Title'>
                            Card Content
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title='Card Title'>
                            Card Content
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default MyTeamApiBox
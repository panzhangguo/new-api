import { IconAlarm, IconBolt, IconFlag, IconLikeHeart, IconSearch } from "@douyinfe/semi-icons"
import { Card, Input, Row, Col, Tag, Avatar, Typography, Table } from "@douyinfe/semi-ui"
import MyApiTable from "./MyApiTable";
import MyTeamApiBox from "./MyTeamApiBox";
const { Text } = Typography;
const { Meta } = Card;
const WinloadMyTeamApi = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: "20px", alignItems: 'center'}}>
            <MyApiTable></MyApiTable>
            <MyTeamApiBox></MyTeamApiBox>
        </div>
    )
}


export default WinloadMyTeamApi
import { Tag } from "@douyinfe/semi-ui";

export const renderStatus = (status, model_limits_enabled = false) => {
    switch (status) {
        case 1:
            if (model_limits_enabled) {
                return (
                    <Tag color='green' size='large'>
                        已启用：限制模型
                    </Tag>
                );
            } else {
                return (
                    <Tag color='green' size='large'>
                        已启用
                    </Tag>
                );
            }
        case 2:
            return (
                <Tag color='red' size='large'>
                    已禁用
                </Tag>
            );
        case 3:
            return (
                <Tag color='yellow' size='large'>
                    已过期
                </Tag>
            );
        case 4:
            return (
                <Tag color='grey' size='large'>
                    已耗尽
                </Tag>
            );
        default:
            return (
                <Tag color='black' size='large'>
                    未知状态
                </Tag>
            );
    }
};
create table tenant
(
    id            int primary key auto_increment comment '主键',
    name          nvarchar(128)    null comment '租户',
    plan_id       nvarchar(128)    null comment '租户订阅的套餐ID，关联到套餐表（如果有计费功能）。',
    code          nvarchar(32)     null comment '租户编码（可选），便于内部管理和引用',
    administrator nvarchar(32)     null comment '租户管理员',
    status        bigint default 1 null comment '状态',
    description   nvarchar(256)    null comment '租户描述，提供关于租户的详细说明。',
    metadata      json             null comment '扩展，使用JSON格式存储额外信息',
    created_time  bigint           null comment '创建时间',
    updated_time  bigint           null comment '更新时间',
    storage_quota bigint           not null comment '租户的存储配额限制（如最大文件存储空间）。'
);


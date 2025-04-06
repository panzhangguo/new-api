import React from 'react';
import { Empty, Button } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import {
    IllustrationNoContent,
    IllustrationNoContentDark,
} from '@douyinfe/semi-illustrations';

const EmptyTeam = () => {
    const navigate = useNavigate();
    const createTeam = () => {
        // props.createTeam();
        navigate('/account/create-team')
    };
    return (
        <Empty
            image={<IllustrationNoContent style={{ width: 150, height: 150 }} />}
            darkModeImage={
                <IllustrationNoContentDark style={{ width: 150, height: 150 }} />
            }
            title='还没有团队'
            description='开始创建你的专属团队吧！'
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}
        >
            <div style={{ width: '100%', textAlign: 'center' }}>
                <Button
                    style={{ padding: '6px 24px' }}
                    type='primary'
                    theme="solid"
                    onClick={createTeam}
                >
                    创建我的团队
                </Button>
                {/* <Button
                    style={{ padding: '6px 24px' }}
                    type='primary'
                    onClick={createTeam}
                >
                    参与团队
                </Button> */}
            </div>
        </Empty>
    );
};

export default EmptyTeam;

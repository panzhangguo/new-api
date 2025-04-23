import { useEffect, useState, useRef } from 'react';
import EmptyTeam from './EmptyTeam';
import AddTeam from '../../components/acfx/AddTeam';
import { Spin } from '@douyinfe/semi-ui';
import { API } from '../../helpers';
import SelfTeam from './SelfTeam';
import { Outlet } from "react-router-dom"

const MyTeam = () => {
  const [loading, setLoading] = useState(false);
  const [isEmpty, setEmpty] = useState(true);
  const [isFormVisiable, setFormVisiable] = useState(false);
  const [teams, setTeams] = useState([]);
  // const flag = useRef(true);

  const init = async () => {
    setLoading(true);
    const res = await API.get('/api/winload-team/self_all').finally(() => {
      setLoading(false);
    });

    const { data, success } = res.data
    if (success && data.length > 0) {
      setEmpty(false)
      setTeams(data)
    } else {
      setEmpty(true)
    }

    return data;
  }

  useEffect(() => {
    init()
  }, []);

  const createTeam = () => {
    setFormVisiable(true);
    setEmpty(false)
  };

  const createdSuccess = async () => {
    await init();
    if (isFormVisiable) {
      setFormVisiable(false)
    }
  };
  return (
    <>
      <div style={{ width: '100%', height: '100%', padding: '10px' }}>
        <Outlet></Outlet>
        {loading && (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Spin size='large' />
          </div>
        )}
        {!isFormVisiable && isEmpty && <EmptyTeam createTeam={createTeam}></EmptyTeam>}
        {isFormVisiable && <AddTeam createdSuccess={createdSuccess}></AddTeam>}
        {!isEmpty && !isFormVisiable && <SelfTeam teams={teams} getTeams={init}></SelfTeam>}
      </div>
    </>
  );
};

export default MyTeam;

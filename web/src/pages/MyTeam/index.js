import { useEffect, useState, useRef } from 'react';
import EmptyTeam from './EmptyTeam';
import AddTeam from '../../components/winload/AddTeam';
import { Spin } from '@douyinfe/semi-ui';
import { API } from '../../helpers';
import SelfTeam from './SelfTeam';
import { Outlet } from "react-router-dom"

const MyTeam = () => {
  const [loading, setLoading] = useState(true);
  const [isEmpty, setEmpty] = useState(true);
  const [isFormVisiable, setFormVisiable] = useState(false);
  const [teams, setTeams] = useState([]);
  const flag = useRef(true);

  const init = async () => {
    const res = await API.get('/api/winload-team/self_all').finally(() => {
      setLoading(false);
    });

    const { data, success } = res.data
    if (success && data.length > 0) {
      setEmpty(false)
      setTeams(data)
    }

    return data;
  }

  useEffect(() => {
    if (flag.current) {
      flag.current = false;
      return;
    }
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

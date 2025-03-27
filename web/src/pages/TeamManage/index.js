// 添加组织管理/租户
import React, { useEffect, useState, useRef } from 'react';
import { API, showError, showSuccess } from '../../helpers';
const TeamManage = () => {
  const flag = useRef(true);
  const loadUsers = async (startIdx, pageSize) => {
    const res = await API.get(`/api/tenant/?p=${startIdx}&page_size=${pageSize}`);
    const { success, message, data } = res.data;
    console.log(data)
  };


  useEffect(() => {
    if (flag.current) {
      flag.current = false;
      return;
    }
    loadUsers(0, 10)
      .then()
      .catch((reason) => {
        showError(reason);
      });
  }, []);
  return (
    <>
      <div style={{ backgroundColor: "red" }}>teammanage</div>
    </>
  )
}


export default TeamManage;

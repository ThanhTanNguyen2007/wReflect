import React from 'react';
import { Modal } from 'antd';

import { auth } from '../../apis';

type Props = {
  children: JSX.Element;
};

function Logout({ children }: Props): JSX.Element {
  const onClickLogout = () => {
    Modal.confirm({
      title: 'Are you sure want to sign out',
      centered: true,
      okText: 'Sign Out',
      cancelText: 'Cancel',
      onOk: async () => {
        auth.logout();
        window.location.reload();
      },
    });
  };

  return (
    <div className="App logout">
      <div onClick={onClickLogout}>{children}</div>
    </div>
  );
}

export default Logout;

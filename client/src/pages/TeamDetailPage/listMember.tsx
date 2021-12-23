import React, { useContext, useState, useRef } from 'react';

import { Button, Dropdown, Menu, Modal, List, Avatar, message, notification } from 'antd';

import SelfContext from '../../contexts/selfContext';

import { ExclamationCircleOutlined, MoreOutlined } from '@ant-design/icons';

import { useMutation } from '@apollo/client';
import { TeamQueries } from '../../grapql-client/queries';
import { MemberMutations } from '../../grapql-client/mutations';
import { Member, Team } from '../../types';
import config from '../../config';

type Props = {
  searchText: string;
  teamData?: Team;
};

const { confirm } = Modal;

export default function ListMember({ searchText, teamData }: Props) {
  const me = useContext(SelfContext);

  const [changeRoleMember] = useMutation<MemberMutations.changeRoleMemberResult, MemberMutations.changeRoleMemberVars>(
    MemberMutations.changeRoleMember,
    {
      refetchQueries: [TeamQueries.getTeam],
      onError: (err) => {
        notification.error({
          message: 'Error happen',
          description: err.message,
        });
      },
    },
  );

  const [removeMember] = useMutation<MemberMutations.removeMemberResult, MemberMutations.removeMemberVars>(
    MemberMutations.removeMember,
    {
      refetchQueries: [TeamQueries.getTeam],
    },
  );
  console.log('member list is', teamData?.members);

  return (
    <div style={{ flex: '1', overflowX: 'hidden', overflowY: 'scroll', height: '100%' }}>
      <List
        dataSource={teamData?.members.filter((member: Member) => member?.user?.email?.includes(searchText))}
        renderItem={(member: Member) => {
          const handleRemove = () => {
            removeMember({
              variables: { memberId: member.id },
            })
              .then((res) => message.success(`${member?.user?.email} successfully removed`))
              .catch((error) => message.error(error.message));
          };
          const menu = (
            <Menu>
              <Menu.Item
                key="1"
                onClick={() => {
                  changeRoleMember({
                    variables: { memberId: member.id, teamId: teamData?.id as string, isOwner: !member.isOwner },
                  });
                }}
              >
                {member?.isOwner ? 'Withdraw Owner Rights' : 'Set Owner'}
              </Menu.Item>
              <Menu.Item key="2">View Profile</Menu.Item>
              <Menu.Item
                key="3"
                onClick={() => {
                  confirm({
                    title: 'Are you sure want to remove this member?',
                    icon: <ExclamationCircleOutlined />,
                    content: member.user.email,
                    centered: true,
                    okText: 'Remove',
                    onOk() {
                      handleRemove();
                    },
                    onCancel() {
                      console.log('Cancel');
                    },
                  });
                }}
              >
                Remove
              </Menu.Item>
            </Menu>
          );
          return (
            <List.Item
              key={`${member?.id}`}
              actions={
                [
                  // <Dropdown key="list-loadmore-edit" overlay={menu}>
                  //   <Button
                  //     type="text"
                  //     hidden={
                  //       member?.user?.email === me?.email ||
                  //       !teamData?.members.find((member) => member.userId === me?.id && member.isOwner)
                  //     }
                  //   >
                  //     <MoreOutlined />
                  //   </Button>
                  // </Dropdown>,
                ]
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={member?.user?.profile?.picture || `${config.SERVER_BASE_URL}/uploads/avatarDefault.png`}
                  />
                }
                // title={<a href="https://ant.design">{member?.  member?.user?.profile?.nickname || 'unknow'}</a>}
                title={
                  member?.isPendingInvitation ? (
                    'Pending Invitation'
                  ) : (
                    <a href="https://ant.design">{member?.user?.profile?.nickname || 'Unknown'}</a>
                  )
                }
                description={member?.user?.email}
              />
              {member.isOwner && (
                <div
                  style={{
                    padding: '5px',
                    backgroundColor: '#979FA6',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '10px',
                  }}
                >
                  Owner
                </div>
              )}
              <Dropdown key="list-loadmore-edit" overlay={menu}>
                <Button
                  type="text"
                  style={
                    member?.user?.email === me?.email ||
                    !teamData?.members.find((member) => member.userId === me?.id && member.isOwner)
                      ? {
                          visibility: 'hidden',
                        }
                      : {}
                  }
                  // hidden={
                  //   member?.user?.email === me?.email ||
                  //   !teamData?.members.find((member) => member.userId === me?.id && member.isOwner)
                  // }
                >
                  <MoreOutlined />
                </Button>
              </Dropdown>
            </List.Item>
          );
        }}
      />
    </div>
  );
}

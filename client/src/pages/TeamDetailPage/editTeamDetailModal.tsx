import React, { useRef } from 'react';
import { Modal, Avatar, Form, FormInstance, Upload, Input, DatePicker, Select, Button } from 'antd';
import moment from 'moment';

import { TeamMutations } from '../../grapql-client/mutations';
import { TeamQueries } from '../../grapql-client/queries';
import { useMutation } from '@apollo/client';

import { UploadOutlined } from '@ant-design/icons';

type Props = {
  teamData: any;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
};

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const EditTeamDetailModal = ({ teamData, isVisible, setIsVisible }: Props) => {
  // const prev = useRef(teamData);
  const formRef = useRef<FormInstance>(null);

  const [updateTeam] = useMutation(TeamMutations.updateTeam, {
    refetchQueries: [TeamQueries.getTeam],
  });

  const handleFinish = () => {
    formRef.current?.validateFields().then(async (values: any) => {
      const startDate = values['range-picker'] && values['range-picker'][0] ? values['range-picker'][0] : moment();
      const endDate = values['range-picker'] && values['range-picker'][1] ? values['range-picker'][1] : moment();
      const name = values['name'];
      const description = values['description'];
      const isPublish = values['select'] === 'public' ? true : false;
      const picture = values['upload']?.file?.response;

      await updateTeam({
        variables: { id: teamData?.id, name, picture, startDate, endDate, description, isPublish },
      });
      setIsVisible(false);
    });
  };

  return (
    <Modal
      destroyOnClose
      centered
      title="Edit Details Team"
      visible={isVisible}
      okText="Update"
      onOk={() => {
        handleFinish();
      }}
      onCancel={() => setIsVisible(false)}
    >
      <Avatar shape="square" size={64} src={teamData?.picture} />
      <Form layout="vertical" ref={formRef}>
        <Form.Item name="upload" label="Avatar" initialValue={teamData?.picture}>
          <Upload
            action="http://localhost:4000/api/upload"
            name="photo"
            multiple={false}
            listType="picture"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          hasFeedback
          name="name"
          label="Team Name"
          initialValue={teamData?.name}
          rules={[{ required: true, message: 'Please input team name' }]}
        >
          <Input bordered placeholder="Input team name" type="text" name="name" defaultValue={teamData?.name} />
        </Form.Item>
        <Form.Item
          name="description"
          hasFeedback
          label="Description"
          initialValue={teamData?.description}
          rules={[{ required: true, message: 'Please input team description' }]}
        >
          <TextArea
            bordered
            placeholder="Description of the team"
            rows={4}
            name="description"
            defaultValue={teamData?.description}
          />
        </Form.Item>
        <Form.Item
          name="range-picker"
          label="RangePicker"
          initialValue={[moment(+teamData?.startDate), moment(+teamData?.endDate)]}
        >
          <RangePicker defaultValue={[moment(+teamData?.startDate), moment(+teamData?.endDate)]} />
        </Form.Item>
        <Form.Item name="select" label="Select">
          <Select defaultValue={teamData?.isPublish ? 'public' : 'private'}>
            <Select.Option value="private">Private</Select.Option>
            <Select.Option value="public">Public</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTeamDetailModal;
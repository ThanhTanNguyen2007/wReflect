import React, { useState } from 'react';
import 'antd/dist/antd.css';
import { Breadcrumb, Row, Col, Button, Tabs, Modal, Input, Cascader, message, Upload } from 'antd';
import { PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import CardWorkSpace from './components/cardWorkSpace';

const { TextArea } = Input;
const { TabPane } = Tabs;

const Workspace = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bottom, setBottom] = useState(10);

  const showModal1 = () => {
    setIsModalVisible(true);
  };
  const key = 'updatable';
  const handleOk = () => {
    setIsModalVisible(false);
    message.loading({ content: 'Loading...', key });
    setTimeout(() => {
      message.success({ content: 'Create new team successfully!', key, duration: 2 });
    }, 1000);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const options = [
    {
      value: 'owners',
      label: 'Private - Only team owners can add members',
    },
    {
      value: 'Everybody',
      label: 'Public - Everyone in the team can add members',
    },
  ];
  const { Search } = Input;
  const onSearch = (value: any) => console.log(value);

  const props = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info: any) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <Tabs className="tab" defaultActiveKey="1" style={{ height: '100%' }}>
      <TabPane tab="WorkSpace" key="1" style={{ height: '100%' }}>
        <div className="site-layout-background card-workspace" style={{ padding: 24, height: '100%' }}>
          <Tabs className="tab-inner" defaultActiveKey="1" style={{ height: '90%' }}>
            <TabPane tab="All" key="1" className="flex flex-ai-c flex-jc-c">
              <CardWorkSpace />
            </TabPane>
            <TabPane tab="Doing" key="2">
              <div>hello</div>
            </TabPane>
            <TabPane tab="Done" key="3">
              <div>Data</div>
            </TabPane>
          </Tabs>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col span={24}>
              <div className="btn-new-team">
                <Button icon={<PlusCircleOutlined />} size="large" onClick={showModal1}>
                  New Team
                </Button>
                <Modal title="Create Your Team" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                  Team Name
                  <Input placeholder="Nhập Tên Nhóm" />
                  Description
                  <TextArea placeholder="Mô tả nhóm" rows={4} />
                  Add Member
                  <Search placeholder="input search text" onSearch={onSearch} style={{ width: 473 }} />
                  <Upload {...props}>
                  Upload Avatar
                    <Button icon={<UploadOutlined />}>Upload image</Button>
                  </Upload>
                  Privacy
                  <Cascader style={{ width: '100%' }} options={options} placeholder="Select Privacy" />
                </Modal>
              </div>
            </Col>
          </Row>
        </div>
      </TabPane>
      <TabPane tab="My Portfolio" key="2" style={{ height: '100%' }}>
        <div className="site-layout-background card-workspace" style={{ padding: 24, height: '100%' }}>
        
        </div>
      </TabPane>
    </Tabs>
  );
};
export default Workspace;

import React, { useEffect } from "react";
import {
  Row,
  Col,
  Input,
  DatePicker,
  InputNumber,
  Form,
  Button,
  Select,
} from "antd";
const { Option } = Select;
const { TextArea } = Input;
const FundForm = ({ onFinish, form }) => {

  // useEffect(() => {
  //   // Set initial form values when component mounts or when initialValues change
  //   form.setFieldsValue(initialValues);
  // }, [form, initialValues]);

  return (
    <Form onFinish={onFinish} layout="vertical" form={form}>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Fund Name"
            rules={[{ required: true, message: "Please enter a Fund Name" }]}
          >
            <Input placeholder="Enter Fund Name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="date"
            label="Fund date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="mobile"
            label="Phone Number"
            rules={[
              { required: true, message: "Please enter phone number" },
              {
                pattern: /^\d{10}$/,
                message: "Phone number must be 10 digits",
              }, // Adjust pattern as needed
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="amount"
            label="Fund amount"
            rules={[{ required: true, message: "Please enter an amount" }]}
          >
            <Input placeholder="Enter Amount" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="fundingMethod"
            label="Funding Method"
            rules={[
              { required: true, message: "Please select a Funding Method" },
            ]}
          >
            <Select placeholder="Select Payment Method">
              <Option value="" disabled>
                Select Payment Method
              </Option>
              <Option value="bank">Bank</Option>
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="cheque">Cheque</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="receivedBy"
            label="Received by"
            rules={[{ required: true, message: "Please enter a received by" }]}
          >
            <Input placeholder="Enter Received by" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="description" label="Description">
        <TextArea rows={2} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>{" "}
        {/* Add a submit button */}
      </Form.Item>
    </Form>
  );
};

export default FundForm;

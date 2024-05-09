import React, { useState, useEffect } from "react";
import { Row, Col, Input, DatePicker, Checkbox, Form, Button } from "antd";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const ExpenseForm = ({ onFinish, form }) => {
  const [placeholder, setPlaceholder] = useState("Enter Receiver Name");

  const handleCheckboxChange = (checkedValues) => {
    if (checkedValues.includes("person")) {
      setPlaceholder("Enter Receiver Name");
    } else if (checkedValues.includes("account")) {
      setPlaceholder("Enter Account Name");
    }
  };

  // useEffect(() => {
  //   // Set initial form values when component mounts or when initialValues change
  //   form.setFieldsValue(initialValues);
  // }, [form, initialValues]);

  return (
    <Form onFinish={onFinish} layout="vertical" form={form}>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="title"
            label="Expense title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter Name" />
          </Form.Item>
          
        </Col>
        <Col span={12}>
          <Form.Item
            name="date"
            label="Expense date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker showTime style={{ width: "100%" }}  />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
      <Col span={24}>
          <Form.List name="expenses">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Row key={key} gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "subtitle"]}
                        fieldKey={[fieldKey, "subtitle"]}
                        label="Sub-title"
                        rules={[{ required: true, message: "Please enter a sub-title" }]}
                      >
                        <Input placeholder="Enter Sub-title" />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, "amount"]}
                        fieldKey={[fieldKey, "amount"]}
                        label="Amount"
                        rules={[{ required: true, message: "Please enter an amount" }]}
                      >
                        <Input placeholder="Enter Amount" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                    Add Sub-title and Amount
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="totalamount"
            label="Expense Total Amount"
            rules={[{ required: true, message: "Please enter an Total Amount" }]}
          >
            <Input placeholder="Enter Total Amount" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Checkbox.Group onChange={handleCheckboxChange}>
            <Checkbox value="person">Received by Person</Checkbox>
            <Checkbox value="account">Received by Account</Checkbox>
          </Checkbox.Group>
          <Form.Item
            name="receivedBy"
            label="Received by"
            rules={[{ required: true, message: "Please select received by" }]}
          >
            <Input placeholder={placeholder} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="description" label="Description">
        <TextArea rows={2} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">Submit</Button> {/* Add a submit button */}
      </Form.Item>
    </Form>
  );
};

export default ExpenseForm;

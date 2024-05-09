import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Form,
  Input,
  Space,
  Button,
  Modal,
  message,
  Upload,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  StockOutlined,
  SearchOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import LayoutNew from "../Layout";
import { DataGrid } from "@mui/x-data-grid";
import FundForm from "./AddEditFund";
import axios from "axios";
import { storage } from "../common/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { getDownloadURL } from "firebase/storage";
import { saveAs } from "file-saver";
import XLSX from "sheetjs-style";
import "jspdf-autotable";
import moment from "moment";
import { exportToPDF } from "../common/report";

const { Title } = Typography;
const { Content } = Layout;
const token = localStorage.getItem("authToken");

const FundManagementPage = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);

  const [filteredData, setFilteredData] = useState([]); // State to hold filtered data
  const [isAddFundModalVisible, setIsAddFundModalVisible] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [editingFund, setEditingFund] = useState(null);
  const [uploadImageFund, setUploadImageFund] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [totalAmountByNames, setTotalAmountByNames] = useState({});
  const [totalAmountSum, setTotalAmountSum] = useState(0);
  const fetchFunds = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/funds`
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching funds:", error);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter((fund) =>
        Object.values(fund).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  }, [data, searchQuery]);
  const transformedRows = filteredData.map((row, index) => ({
    id: row._id,
    ...row,
  }));
  useEffect(() => {
    calculateTotalAmountByNames(data);
    calculateTotalAmountSum(data);
  }, [data]);

  const calculateTotalAmountByNames = (funds) => {
    const totalAmounts = funds.reduce((acc, fund) => {
      acc[fund.name] = (acc[fund.name] || 0) + fund.amount;
      return acc;
    }, {});
    console.log(totalAmounts);
    setTotalAmountByNames(totalAmounts);
  };

  const calculateTotalAmountSum = (funds) => {
    const totalSum = funds.reduce((sum, fund) => sum + fund.amount, 0);
    setTotalAmountSum(totalSum);
  };

  const sortedRows = [...transformedRows].sort((a, b) => a.number - b.number);

  const filterData = () => {
    setFilteredData(data);
  };
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    filterData();
  };

  const addNewFund = () => {
    setIsAddFundModalVisible(true);
  };
  const generatePDF = () => {
    const columnsToExport = columns.filter(
      (col) => col.field !== "action" && col.field !== "imageUrls"
    );
    const prepareDataForReport = (data) => {
      return data.map((menu) => {
        const rowData = {};
        columnsToExport.forEach((col) => {
          rowData[col.field] = menu[col.field];
        });
        return rowData;
      });
    };

    const reportData = prepareDataForReport(filteredData);
    exportToPDF(columnsToExport, reportData, {
      title: "Fund Report",
    });
  };
  const handleCancel = () => {
    setIsAddFundModalVisible(false);
    setEditingFund(null);
    form.resetFields();
  };
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleDateRangeChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      setStartDate(start);
      setEndDate(end);
      filterDataByDateRange(start, end);
    } else {
      setStartDate(null);
      setEndDate(null);
      filterDataByDateRange(null, null);
    }
  };

  const filterDataByDateRange = (start, end) => {
    console.log(
      "Start Date (Moment):",
      start ? start.format("DD-MM-YYYY") : null
    );
    console.log("End Date (Moment):", end ? end.format("DD-MM-YYYY") : null);

    if (!start || !end) {
      console.log("No date range specified. Filtering cancelled.");
      setFilteredData(data);
    } else {
      const startDate = moment(start.format("DD-MM-YYYY"), "DD-MM-YYYY");
      const endDate = moment(end.format("DD-MM-YYYY"), "DD-MM-YYYY");
      console.log("Start Date (Moment):", startDate.format("DD-MM-YYYY"));
      console.log("End Date (Moment):", endDate.format("DD-MM-YYYY"));

      const filtered = data.filter((fund) => {
        const fundDate = moment(fund.date);
        console.log("Fund Date (Moment):", fundDate.format("DD-MM-YYYY"));
        return (
          fundDate.isSameOrAfter(startDate, "day") &&
          fundDate.isSameOrBefore(endDate, "day")
        );
      });

      console.log("Filtered Funds:", filtered);
      setFilteredData(filtered);
    }
  };

  const handleCancelImageUpload = () => {
    setIsImageModalVisible(false);
    setUploadImageFund(null);
  };

  const confirmDelete = (id) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this funds?",
      okText: "Yes",
      cancelText: "No",
      onOk: () => deleteItem(id),
    });
  };

  const deleteItem = async (id) => {
    const response = await axios.delete(
      `${process.env.REACT_APP_BACKEND_BASE_URL}/funds/${id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      message.success("Funds deleted successfully");
      fetchFunds();
    }
  };

  const handleEdit = (fund) => {
    console.log(fund);
    setEditingFund(fund);
    setIsAddFundModalVisible(true);
    setIsEdit(true);
    setEditId(fund.id);
    form.setFieldsValue({
      name: fund.name,
      mobile: fund.mobile,
      date: moment(fund.date),
      amount: fund.amount,
      receivedBy: fund.receivedBy,
      fundingMethod: fund.fundingMethod,
      description:fund.description,
    });
  };

  const handleOpenImageUpload = (fund) => {
    setIsImageModalVisible(true);
    setUploadImageFund(fund);
  };

  const handleUpload = ({ fileList }) => {
    console.log(fileList);
    const files = fileList.map((file) => file.originFileObj);
    console.log(files);
    setSelectedImages(files);
  };

  const handleImageUpload = async () => {
    try {
      let uploadedImageUrls = [];

      // Use map instead of forEach to preserve the order of operations
      await Promise.all(
        selectedImages.map(async (file) => {
          const storageRef = ref(
            storage,
            `fund_images/${uploadImageFund.id}/${file.name}`
          );
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          uploadedImageUrls.push(downloadURL);
          console.log("File uploaded successfully. Download URL:", downloadURL);
        })
      );

      let updateFundObj = { ...uploadImageFund };
      updateFundObj.imageUrls = uploadedImageUrls;

      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/funds/${uploadImageFund.id}`,
        updateFundObj,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.success) {
        message.success("Images uploaded successfully");
        setSelectedImages([]);
        setIsImageModalVisible(false);
        fetchFunds();
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      message.error("Failed to upload images");
    }
  };
  const formatDateOnly = (dateString) => {
    const dateMoment = moment(dateString);
    return dateMoment.isValid() ? dateMoment.format("MM-DD-YYYY") : "";
  };

  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const columns = [
    { field: "fundsId", headerName: "Funds ID", width: 150 },
    { field: "name", headerName: "Name", width: 150 },
    {
      field: "date",
      headerName: "Date",
      width: 150,
      renderCell: (params) => formatDateOnly(params.value),
    },
    { field: "mobile", headerName: "Phone Number", width: 150 },
    { field: "amount", headerName: "Amount", width: 150 },
    { field: "fundingMethod", headerName: "Funding Method", width: 150 },
    { field: "receivedBy", headerName: "Received By", width: 150 },
    { field: "description", headerName: "Description", width: 150 },

    {
      field: "imageUrls",
      headerName: "Images",
      width: 200,
      renderCell: (params) => {
        const imageUrls = params.value || [];
        return (
          <div
            style={{ display: "flow", gap: "4px", justifyContent: "center" }}
          >
            {imageUrls.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Expenses Image ${index}`}
                style={{ width: "30px", height: "30px" }}
                onClick={() => handlePreview(imageUrl)}
              />
            ))}
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <div>
          <Button
            onClick={() => handleEdit(params.row)}
            icon={<EditOutlined style={{ color: "blue" }} />}
          />
          <Button
            onClick={() => handleOpenImageUpload(params.row)}
            icon={<UploadOutlined style={{ color: "green" }} />}
            color="default"
          />
          <Button
            onClick={() => confirmDelete(params.row.id)}
            icon={<DeleteOutlined style={{ color: "red" }} />}
          />
        </div>
      ),
    },
  ];

  const onFinish = async (values) => {
    try {
      if (isEdit) {
        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/funds/${editId}`, // Assuming editId is defined
          values,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (response.data.success) {
          form.resetFields();
          setIsAddFundModalVisible(false);
          setIsEdit(false);
          setEditingFund(null);
          message.success("Fund updated successfully");
          fetchFunds();
        }
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/funds/`,
          values,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (response.data.success) {
          form.resetFields();
          setIsAddFundModalVisible(false);
          message.success("Fund added successfully");
          fetchFunds();
        }
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message &&
        error.response.data.message.includes("E11000 duplicate key error")
      ) {
        message.error("Fund with same number already exists");
      } else {
        message.error(error.response.data.message);
      }
    }
  };

  const exportToExcel = (columns, data) => {
    const columnsToExport = columns.filter(
      (col) => col.field !== "action" && col.field !== "imageUrls"
    );

    const prepareDataForExport = (data) => {
      return data.map((fund) => {
        const rowData = {};
        columnsToExport.forEach((col) => {
          rowData[col.field] = fund[col.field];
        });
        return rowData;
      });
    };

    const fileName = "fundData";
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const ws = XLSX.utils.json_to_sheet(prepareDataForExport(data));
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: fileType });
    saveAs(dataBlob, fileName + fileExtension);
  };

  const handleOk = () => {
    const values = form.getFieldsValue();
    console.log(values);
    onFinish(values);
  };

  const [loggedInUserType, setLoggedInUserType] = useState("");

  useEffect(() => {
    const userType = localStorage.getItem("loggedInUserType");
    if (userType) {
      setLoggedInUserType(userType);
    }
  }, []);

  return (
    <LayoutNew userType={loggedInUserType}>
      <Layout>
        <Content style={{ padding: "24px" }}>
          <Space
            style={{
              background: "#001529",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              justifyContent: "space-between",
              display: "flex",
            }}
          >
            <Space>
              <StockOutlined style={{ fontSize: "24px", marginRight: "8px" }} />
              <Title
                level={2}
                style={{ fontSize: "24px", marginTop: "8px", color: "white" }}
              >
                Fund Management
              </Title>
            </Space>
            <div style={{ marginLeft: "auto", marginRight: "20px" }}>
              {/* Export buttons */}
              <Space>
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={generatePDF}
                >
                  Export to PDF
                </Button>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={() => exportToExcel(columns, filteredData)}
                >
                  Export to Excel
                </Button>
              </Space>
            </div>
          </Space>
          <br />
          <Space
            style={{
              background: "white",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              justifyContent: "space-between",
              display: "flex",
            }}
          >
            <div>
              <Title level={4} style={{ color: "black" }}>
                Total Amount Sum: Rs{totalAmountSum}
              </Title>
            </div>
          </Space>
          <br />
          {/* Total amount of funds grouped by names */}
          <Space
  style={{
    background: "white",
    color: "white",
    padding: "12px",
    borderRadius: "8px",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column", // Adjusted to display items vertically
    alignItems: "flex-start", // Adjusted to align items to the start of the column
  }}
>
  {Object.entries(totalAmountByNames).map(([name, total]) => (
    <div key={name}>
      <Title level={4} style={{ color: "black" }}>
        {name}  : Rs{total}
      </Title>
    </div>
  ))}
</Space>
          <br />
          <br />
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <DatePicker.RangePicker
              style={{ marginRight: "8px" }}
              onChange={handleDateRangeChange}
              value={[startDate, endDate]}
              format="DD-MM-YYYY" // Specify the date format here
            />
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              onChange={handleSearchInputChange}
              style={{ marginRight: "8px" }}
            />
            <div style={{ marginLeft: "auto", marginRight: "20px" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addNewFund}
              >
                Add New Funds
              </Button>
            </div>
          </div>
          <DataGrid
            rows={sortedRows}
            columns={columns}
            pageSize={10}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
            sortModel={[
              {
                field: "number",
                sort: "asc",
              },
            ]}
          />
          <Modal
            open={isAddFundModalVisible}
            title={isEdit ? "Edit Funds" : "Add New Funds"}
            okText={isEdit ? "Update" : "Save"}
            cancelText="Cancel"
            onCancel={handleCancel}
            onOk={handleOk}
            footer={null}
          >
            <FundForm 
            onFinish={onFinish} 
            initialValues={editingFund}
            form={form} />
          </Modal>
          <Modal
            open={isImageModalVisible}
            title="Upload funds Images"
            okText="Upload"
            cancelText="Cancel"
            onCancel={handleCancelImageUpload}
            onOk={handleImageUpload}
          >
            <Upload
              multiple
              listType="picture-card"
              accept="image/*"
              beforeUpload={() => false}
              maxCount={4}
              onChange={handleUpload}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Modal>
          <Modal
            open={previewImage !== null}
            footer={null}
            onCancel={handleClosePreview}
          >
            {previewImage && (
              <img src={previewImage} alt="Preview" style={{ width: "100%" }} />
            )}
          </Modal>
        </Content>
      </Layout>
    </LayoutNew>
  );
};

export default FundManagementPage;

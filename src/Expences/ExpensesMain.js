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
  EyeOutlined,
} from "@ant-design/icons";
import LayoutNew from "../Layout";
import { DataGrid } from "@mui/x-data-grid";
import ExpenseForm from "./AddEditExpenses";
import axios from "axios";
import { storage } from "../common/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { getDownloadURL } from "firebase/storage";
import "jspdf-autotable";
import moment from "moment";
import { saveAs } from "file-saver";
import XLSX from "sheetjs-style";
import { exportToPDF } from "../common/report";
const { Title } = Typography;
const { Content } = Layout;
const token = localStorage.getItem("authToken");
const SubExpensesModal = ({ expenses }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleView = () => {
    setIsModalVisible(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      field: "index",
      headerName: "Index",
      width: 100,
    },
    {
      field: "subtitle",
      headerName: "Subtitle",
      width: 200,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 200,
    },
  ];

  const expensesWithIndex = expenses.map((expense, index) => ({
    ...expense,
    index: index + 1, // Adding 1 to start index from 1 instead of 0
  }));

  return (
    <>
      <div style={{ justifyContent: "center" }}>
        {" "}
        {/* Center the button */}
        <Button
          onClick={handleView}
          icon={<EyeOutlined style={{ color: "green" }} />}
        />
      </div>
      <Modal
        title="Sub Expenses"
        visible={isModalVisible}
        onCancel={handleClose}
        footer={null}
      >
        <DataGrid
          rows={expensesWithIndex}
          columns={columns}
          pageSize={5}
          getRowId={(row) => row._id} // Assuming you still need this prop for unique row IDs
        />{" "}
      </Modal>
    </>
  );
};
const ExpenseManagementPage = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);

  const [filteredData, setFilteredData] = useState([]); // State to hold filtered data
  const [isAddExpenseModalVisible, setIsAddExpenseModalVisible] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [uploadImageExpense, setUploadImageExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
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
  const fetchExpenses = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/expenses`
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching Expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter((expense) =>
        Object.values(expense).some((value) =>
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

  const sortedRows = [...transformedRows].sort((a, b) => a.number - b.number);

  const filterData = () => {
    setFilteredData(data);
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
      title: "Expenses Report",
    });
  };
  // Function to handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    filterData();
  };

  const addNewExpense = () => {
    setIsAddExpenseModalVisible(true);
  };

  const handleCancel = () => {
    setIsAddExpenseModalVisible(false);
    setEditingExpense(null);
    form.resetFields();
  };

  const handleCancelImageUpload = () => {
    setIsImageModalVisible(false);
    setUploadImageExpense(null);
  };

  const confirmDelete = (id) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this Expenses?",
      okText: "Yes",
      cancelText: "No",
      onOk: () => deleteItem(id),
    });
  };

  const deleteItem = async (id) => {
    const response = await axios.delete(
      `${process.env.REACT_APP_BACKEND_BASE_URL}/expenses/${id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    if (response.data.success) {
      message.success("Expenses deleted successfully");
      fetchExpenses();
    }
  };

  const handleEdit = (expense) => {
    console.log(expense);
    setEditingExpense(expense);
    setIsAddExpenseModalVisible(true);
    setIsEdit(true);
    setEditId(expense.id); // Store the id of the expense being edited
    form.setFieldsValue({
      title: expense.title,
      subtitle: expense.subtitle,
      date: moment(expense.date),
      expenses: expense.expenses,
      totalamount: expense.totalamount,
      receivedBy: expense.receivedBy,
      description: expense.description,
    });
  };

  const handleOpenImageUpload = (expense) => {
    setSelectedImages(expense.imageUrls);
    setIsImageModalVisible(true);
    setUploadImageExpense(expense);
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
            `expense_images/${uploadImageExpense.id}/${file.name}`
          );
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          uploadedImageUrls.push(downloadURL);
          console.log("File uploaded successfully. Download URL:", downloadURL);
        })
      );

      let updateExpenseObj = { ...uploadImageExpense };
      updateExpenseObj.imageUrls = uploadedImageUrls;

      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/expenses/${uploadImageExpense.id}`,
        updateExpenseObj,
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
        fetchExpenses();
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
    { field: "expensesId", headerName: "Expenses ID", width: 150 },
    { field: "title", headerName: "Title", width: 150 },
    {
      field: "expenses",
      headerName: "Sub Expenses",
      width: 120,
      renderCell: (params) => {
        const expenses = params.value || [];
        return <SubExpensesModal expenses={expenses} />;
      },
    },
    {
      field: "date",
      headerName: "Date",
      width: 150,
      renderCell: (params) => formatDateOnly(params.value),
    },
    { field: "totalamount", headerName: "Total Amount", width: 150 },
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

    const fileName = "ExpencesData";
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const ws = XLSX.utils.json_to_sheet(prepareDataForExport(data));
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: fileType });
    saveAs(dataBlob, fileName + fileExtension);
  };

  // Function to handle form submission
  const onFinish = async (values) => {
    try {
      if (isEdit) {
        // Update Expense
        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/expenses/${editId}`, // Assuming editId is defined
          values,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (response.data.success) {
          form.resetFields();
          setIsAddExpenseModalVisible(false);
          setIsEdit(false);
          setEditingExpense(null);
          message.success("Expenses updated successfully");
          fetchExpenses();
        }
      } else {
        // Add new Expense
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/expenses/`,
          values,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (response.data.success) {
          form.resetFields();
          setIsAddExpenseModalVisible(false);
          message.success("Expenses added successfully");
          fetchExpenses();
        }
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message &&
        error.response.data.message.includes("E11000 duplicate key error")
      ) {
        // Duplicate key error
        message.error("Expenses with same number already exists");
      } else {
        // Other errors
        message.error(error.response.data.message);
      }
    }
  };

  const handleOk = () => {
    const values = form.getFieldsValue(); // Get form values without validation
    onFinish(values); // Call your onFinish function with the form values
  };
  const calculateTotalAmount = (data) => {
    return data
      .reduce(
        (total, expense) => total + parseFloat(expense.totalamount || 0),
        0
      )
      .toFixed(2);
  };
  const [loggedInUserType, setLoggedInUserType] = useState("");
  const calculateTotalAmountBySubtitle = (data) => {
    return data.reduce((acc, expense) => {
      const { subtitle, totalamount } = expense;
      acc[subtitle] = (acc[subtitle] || 0) + parseFloat(totalamount || 0);
      return acc;
    }, {});
  };

  const totalAmountBySubtitle = calculateTotalAmountBySubtitle(filteredData);

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
                Expenses Management
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
          <div style={{ marginRight: "20px" }}>
            {/* Grand total */}
            <Title
              level={4}
              style={{
                color: "black",
                fontFamily: "Arial",
                fontSize: "16px",
                fontWeight: "bold",
                marginTop: "20px", // Add some spacing between subtitle totals and grand total
              }}
            >
              Grand Total:{" "}
              {Object.values(totalAmountBySubtitle)
                .reduce((acc, total) => acc + total, 0)
                .toFixed(2)}
            </Title>
          </div>

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
            {/* Search input */}
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
                onClick={addNewExpense}
              >
                Add New Expenses
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
            open={isAddExpenseModalVisible}
            title={isEdit ? "Edit Expenses" : "Add New Expenses"}
            okText={isEdit ? "Update" : "Save"}
            cancelText="Cancel"
            onCancel={handleCancel}
            onOk={handleOk}
            footer={null}
          >
            <ExpenseForm
              onFinish={onFinish}
              initialValues={editingExpense}
              form={form}
            />
          </Modal>
          <Modal
            open={isImageModalVisible}
            title="Upload Expenses Images"
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

export default ExpenseManagementPage;

import React, { useEffect, useState, useCallback } from "react";
import Layout from "../Layout";
import { Row, Col } from "antd";
import {
  UserAddOutlined,
  RiseOutlined,
  FallOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import CardView from "./CardView";
import "./Dashboard.css";
import ApexCharts from "react-apexcharts";
import axios from "axios";

const Dashboard = () => {
  const [loggedInUserType, setLoggedInUserType] = useState("");
  const [fundsData, setFundsData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userType = localStorage.getItem("loggedInUserType");
    if (userType) {
      setLoggedInUserType(userType);
    }
    fetchFundsData();
    fetchExpenses();
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/expenses`
      );
      setExpensesData(response.data.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching Expenses:", error);
    }
  }, []);

  const fetchFundsData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/funds`
      );
      setFundsData(response.data.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching funds:", error);
    }
  }, []);

  const calculateChartData = useCallback(() => {
    if (!fundsData) return; 
    const chartData1 = fundsData.map((fund) => ({
      x: new Date(fund.date).getTime(),
      y: fund.amount,
      name: fund.name,
    }));
    const names = fundsData.map((fund) => fund.name);
    const colors = {};
    names.forEach((name, index) => {
      if (!colors[name]) {
        colors[name] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      }
    });
    return { chartData1, colors };
  }, [fundsData]);

  const calculateExpenseChartData = useCallback(() => {
    const title = expensesData.map((expense) => expense.title);
    const totalamount = expensesData.map((expense) => expense.totalamount);
    return { title, totalamount };
  }, [expensesData]);

  const { chartData1, colors } = calculateChartData();
  const { title, totalamount } = calculateExpenseChartData();

  return (
    <Layout userType={loggedInUserType}>
      {loggedInUserType === "admin" && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={6}>
              <CardView
                title="Create Multiple Users"
                description="You can add another users to manage funding and expenses"
                icon={<UserAddOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <CardView
                title="Funding Filed"
                description="You can access features such as adding and reviewing fund history"
                icon={<RiseOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <CardView
                title="Expenses Field"
                description="You can Easily add expenses and review expense history "
                icon={<FallOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <CardView
                title="Reports"
                description="You can view Summary of monthly fund performance and expenses."
                icon={<SnippetsOutlined />}
              />
            </Col>
          </Row>
          <br />
          <br />
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={12}>
              {colors && (
                <ApexCharts
                  options={{
                    chart: {
                      type: "area",
                      toolbar: {
                        show: true,
                      },
                    },
                    xaxis: {
                      type: "datetime",
                      title: {
                        text: "Date",
                      },
                    },
                    yaxis: {
                      title: {
                        text: "Amount",
                      },
                    },
                    title: {
                      text: "Funds Overview",
                      align: "center",
                      style: {
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#333",
                      },
                    },
                    legend: {
                      show: true,
                    },
                    colors: Object.values(colors),
                  }}
                  series={Object.keys(colors).map((name) => ({
                    name: name,
                    data: chartData1
                      .filter((fund) => fund.name === name)
                      .map((series) => ({ x: series.x, y: series.y })),
                  }))}
                  type="area"
                  height={350}
                />
              )}
            </Col>
            <Col xs={24} sm={12} md={12} lg={12}>
              <ApexCharts
                options={{
                  chart: {
                    type: "radialBar",
                    toolbar: {
                      show: true,
                    },
                  },
                  plotOptions: {
                    radialBar: {
                      startAngle: -135,
                      endAngle: 135,
                      hollow: {
                        margin: 0,
                        size: "70%",
                        background: "transparent",
                        image: undefined,
                      },
                      track: {
                        background: "#333",
                        startAngle: -135,
                        endAngle: 135,
                      },
                      dataLabels: {
                        name: {
                          show: false,
                        },
                        value: {
                          show: true,
                        },
                      },
                    },
                  },
                  fill: {
                    type: "gradient",
                    gradient: {
                      shade: "light",
                      shadeIntensity: 0.4,
                      inverseColors: false,
                      opacityFrom: 1,
                      opacityTo: 1,
                      stops: [0, 100],
                    },
                  },
                  stroke: {
                    lineCap: "round",
                  },
                  labels: title,
                  title: {
                    text: "Expense Capacity Overview",
                    align: "center",
                    style: {
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#333",
                    },
                  },
                  legend: {
                    show: true,
                  },
                }}
                series={[{ data: totalamount, name: "Amount" }]}
                height={350}
              />
            </Col>
          </Row>
        </>
      )}
      {loggedInUserType === "userFund" && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={6}>
              <CardView
                title="Funding Filed"
                description="You can access features such as adding and reviewing fund history"
                icon={<RiseOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <CardView
                title="Reports"
                description="You can view Summary of monthly fund performance and expenses."
                icon={<SnippetsOutlined />}
              />
            </Col>
          </Row>
          <br />
          <br />
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={12}>
              {colors && (
                <ApexCharts
                  options={{
                    chart: {
                      type: "area",
                      toolbar: {
                        show: true,
                      },
                    },
                    xaxis: {
                      type: "datetime",
                      title: {
                        text: "Date",
                      },
                    },
                    yaxis: {
                      title: {
                        text: "Amount",
                      },
                    },
                    title: {
                      text: "Funds Overview",
                      align: "center",
                      style: {
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#333",
                      },
                    },
                    legend: {
                      show: true,
                    },
                    colors: Object.values(colors),
                  }}
                  series={Object.keys(colors).map((name) => ({
                    name: name,
                    data: chartData1
                      .filter((fund) => fund.name === name)
                      .map((series) => ({ x: series.x, y: series.y })),
                  }))}
                  type="area"
                  height={350}
                />
              )}
            </Col>
          </Row>{" "}
        </>
      )}
      {loggedInUserType === "userExpences" && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={6}>
              <CardView
                title="Expenses Field"
                description="You can Easily add expenses and review expense history "
                icon={<FallOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <CardView
                title="Reports"
                description="You can view Summary of monthly fund performance and expenses."
                icon={<SnippetsOutlined />}
              />
            </Col>
          </Row>
          <br />
          <br />
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={12}>
              <ApexCharts
                options={{
                  chart: {
                    type: "radialBar",
                    toolbar: {
                      show: true,
                    },
                  },
                  plotOptions: {
                    radialBar: {
                      startAngle: -135,
                      endAngle: 135,
                      hollow: {
                        margin: 0,
                        size: "70%",
                        background: "transparent",
                        image: undefined,
                      },
                      track: {
                        background: "#333",
                        startAngle: -135,
                        endAngle: 135,
                      },
                      dataLabels: {
                        name: {
                          show: false,
                        },
                        value: {
                          show: true,
                        },
                      },
                    },
                  },
                  fill: {
                    type: "gradient",
                    gradient: {
                      shade: "light",
                      shadeIntensity: 0.4,
                      inverseColors: false,
                      opacityFrom: 1,
                      opacityTo: 1,
                      stops: [0, 100],
                    },
                  },
                  stroke: {
                    lineCap: "round",
                  },
                  labels: title,
                  title: {
                    text: "Expense Capacity Overview",
                    align: "center",
                    style: {
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#333",
                    },
                  },
                  legend: {
                    show: true,
                  },
                }}
                series={[{ data: totalamount, name: "Amount" }]}
                height={350}
              />
            </Col>
          </Row>{" "}
        </>
      )}
    </Layout>
  );
};

export default Dashboard;

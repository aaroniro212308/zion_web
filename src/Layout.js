import React, { useState, useEffect } from "react";
import {
  HomeOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
  CalendarOutlined,
  TableOutlined,
  FileDoneOutlined,
  AppstoreAddOutlined,
  FireOutlined,
  DollarCircleOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  FormOutlined,
  TeamOutlined,
  CarOutlined,
  ApartmentOutlined,
  StockOutlined,
  SyncOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  CoffeeOutlined,
  BellOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ReadOutlined,
  EnvironmentOutlined,
  SlackOutlined,
  RestOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Button, Typography } from "antd";
import { FloatButton } from "antd";
import { useNavigate } from "react-router-dom";
import imageSrc from "./micro1.png";
import collapsedImageSrc from "./micro12.png";

const { Text } = Typography;
const { Header, Content, Footer, Sider } = Layout;
const loggedInUserType = localStorage.getItem("loggedInUserType");

const adminUserItems = [
  {
    key: "dashboard",
    icon: <HomeOutlined />,
    label: "Home",
  },
  {
    key: "expenses",
    icon: <MoneyCollectOutlined />,
    label: "Expenses",
    children: [
      {
        key: "expenses",
        icon: <AppstoreAddOutlined />,
        label: "Expenses",
      },
    ],
  },
  {
    key: "funds",
    icon: <MoneyCollectOutlined />,
    label: "Funds",
    children: [
      {
        key: "fund",
        icon: <AppstoreAddOutlined />,
        label: "Funds",
      },
    ],
  },
];

const UserFundItems = [
  {
    key: "dashboard",
    icon: <HomeOutlined />,
    label: "Home",
  },
  {
    key: "funds",
    icon: <MoneyCollectOutlined />,
    label: "Funds",
    children: [
      {
        key: "fund",
        icon: <AppstoreAddOutlined />,
        label: "Funds",
      },
    ],
  },
];
const UserExpencesItems = [
  {
    key: "dashboard",
    icon: <HomeOutlined />,
    label: "Home",
  },
  {
    key: "expenses",
    icon: <MoneyCollectOutlined />,
    label: "Expenses",
    children: [
      {
        key: "expenses",
        icon: <AppstoreAddOutlined />,
        label: "Expenses",
      },
    ],
  },
];
const headerIteam = [
  { key: "1", text: "User", icon: <UserSwitchOutlined /> },
  { key: "2", text: "LogOut", icon: <LogoutOutlined /> },
];
const App = ({ children, userType }) => {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

  const handleHeaderClick = (key) => {
    if (key === "2") {
      localStorage.setItem("authToken", null);
      localStorage.setItem("loggedInUserType", null);
      navigate("/");
    }
  };
  const [isBackTopVisible, setIsBackTopVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      setIsBackTopVisible(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const handleMenuClick = (item) => {
    if (item.key === "dashboard") {
      navigate("/dashboard");
    }

    if (item.key === "fund") {
      navigate("/fundManagementPage");
    }
    if (item.key === "expenses") {
      navigate("/expenses");
    }
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  
  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={250}
      >
        <div className="demo-logo-vertical">
          {collapsed ? (
            <img
              src={collapsedImageSrc}
              alt="Description of your image when collapsed"
            />
          ) : (
            <img src={imageSrc} alt="Description of your image" />
          )}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={["dashboard"]}
          mode="inline"
          items={
            userType === "admin"
              ? adminUserItems
              : userType === "userFund"
              ? UserFundItems
              : userType === "userExpences"
              ? UserExpencesItems
              : [] // Empty array as default or fallback
          }
          onClick={handleMenuClick}
          style={{
            position: "sticky",
            marginTop: "10px",
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="demo-logo" />

          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {headerIteam.map((item) => (
              <Button
                key={item.key}
                type="text"
                icon={item.icon}
                style={{ color: "white" }}
                onClick={() => handleHeaderClick(item.key)}
              >
                {item.text}
              </Button>
            ))}
          </div>
        </Header>
        <Content
          style={{
            margin: "0 20px",
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 360,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: borderRadiusLG,
            }}
          >
            {isBackTopVisible && (
              <FloatButton.Group
                shape="circle"
                style={{
                  right: 24,
                }}
              >
                <FloatButton.BackTop visibilityHeight={0} />
              </FloatButton.Group>
            )}
            {children}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        ></Footer>
      </Layout>
    </Layout>
  );
};
export default App;

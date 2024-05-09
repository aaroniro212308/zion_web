import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./Auth/login";
import Register from "./Auth/Register";
import ForgotPassword from "./Auth/ForgotPassword";
import ResetPassword from "./Auth/reset-password";
import Dashboard from "./DashBoard/Dashboard";
// import ExpensesPage from "./Expences/ExpensesPage";
import Expenses from "./Expences/ExpensesMain";
import FundManagementPage from "./Funds/FundsMain";

function App() {
  const storedAuthToken = localStorage.getItem("authToken");
  const storedUserType = localStorage.getItem("loggedInUserType");

  const isAdminAuthenticated = () => {
    return true;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/expensesPage" element={<ExpensesPage />} /> */}
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/fundManagementPage" element={<FundManagementPage />} />

      </Routes>
    </Router>
  );
}

export default App;

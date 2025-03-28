import React, { Fragment, useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import PatientRecords from "./components/PatientRecords";
import Appointments from "./components/Appointments";
import Prescriptions from "./components/Prescriptions"; 
import TransferData from './components/TransferData';
import TwoFactorSetup from './components/TwoFactorSetup';
import TwoFactorLogin from './components/TwoFactorLogin'; // Add this import

// Import style reset without any other CSS
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  async function isAuth() {
    try {
      const response = await fetch("http://localhost:5000/auth/verify", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!response.ok) {
        console.log("Auth verification failed:", response.status);
        setIsAuthenticated(false);
        return;
      }

      // Only try to parse JSON if response is successful
      const parseRes = await response.json();
      parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
    } catch (err) {
      console.error("Auth verification error:", err.message);
      setIsAuthenticated(false);
    }
  }

  useEffect(() => {
    isAuth();
  }, []);

  return (
    <Fragment>
      <GlobalStyle />
      <ToastContainer position="bottom-right" />

      <Router>
        <div className="container">
          <Routes>
            <Route
              path="/appointments"
              element={isAuthenticated ? <Appointments setAuth={setAuth} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <Login setAuth={setAuth} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/register"
              element={
                !isAuthenticated ? (
                  <Register setAuth={setAuth} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <Dashboard setAuth={setAuth} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <Profile setAuth={setAuth} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/prescriptions"
              element={isAuthenticated ? <Prescriptions setAuth={setAuth} /> : <Navigate to="/login" replace />}
            />
            
            <Route
              path="/patientrecords"
              element={isAuthenticated ? <PatientRecords setAuth={setAuth} /> : <Navigate to="/login" replace />}
            />
            
            <Route 
              path="/transfer-data" 
              element={isAuthenticated ? <TransferData setAuth={setAuth} /> : <Navigate to="/login" replace />} 
            />
            
            <Route
              path="/two-factor-setup"
              element={isAuthenticated ? <TwoFactorSetup setAuth={setAuth} /> : <Navigate to="/login" replace />}
            />
            
            <Route 
              path="/setup-2fa" 
              element={isAuthenticated ? <TwoFactorSetup setAuth={setAuth} /> : <Navigate to="/login" replace />} 
            />
            
            <Route path="/login/2fa" element={!isAuthenticated ? <TwoFactorLogin setAuth={setAuth} /> : <Navigate to="/dashboard" replace />} />
            
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </Fragment>
  );
}

export default App;

import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaUserMd } from "react-icons/fa";
import { motion } from "framer-motion";
import '../App.css';
import '../index.css';

const Login = ({ setAuth }) => {
    const [inputs, setInputs] = useState({
        email: "",
        password: ""
    });

    const { email, password } = inputs;

    const onChange = e => setInputs({ ...inputs, [e.target.name]: e.target.value });

    const onSubmitForm = async e => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }

        try {
            const body = { email, password };
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(body)
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                setAuth(false);
                toast.error(errorText);
                return;
            }

            const parseRes = await response.json();
            console.log("Parsed response:", parseRes);

            if (parseRes.token) {
                localStorage.setItem("token", parseRes.token);
                setAuth(true);
                toast.success("Logged in Successfully");
            } else {
                setAuth(false);
                toast.error("Invalid login response");
            }
        } catch (err) {
            console.error(err.message);
            toast.error("Server Error");
        }
    };

    return (
        <div className="login-container">
            <motion.div 
                className="login-box"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-header">
                    <FaUserMd className="header-icon" />
                    <h1>MediSafe</h1>
                    <p>Welcome back! Please login to your account.</p>
                </div>

                <form onSubmit={onSubmitForm} className="login-form">
                    <div className="form-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            value={email}
                            placeholder="Email Address"
                            onChange={e => onChange(e)}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            name="password"
                            value={password}
                            placeholder="Password"
                            onChange={e => onChange(e)}
                            className="form-control"
                            required
                        />
                    </div>

                    <motion.button 
                        className="login-button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Login
                    </motion.button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account?</p>
                    <Link to="/register" className="register-link">Register here</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

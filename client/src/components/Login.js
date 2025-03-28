import React, { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaUserMd } from "react-icons/fa";
import { motion } from "framer-motion";
import TwoFactorLogin from './TwoFactorLogin'; // Import the 2FA component
import '../App.css';
import '../index.css';

const Login = ({ setAuth }) => {
    const [inputs, setInputs] = useState({
        email: "",
        password: ""
    });
    
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { email, password } = inputs;
    
    const navigate = useNavigate();

    const onChange = e => setInputs({ ...inputs, [e.target.name]: e.target.value });

    const onSubmitForm = async e => {
        e.preventDefault();
        
        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }
        
        setIsSubmitting(true);

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

            // Check if 2FA is required - handle both property names for compatibility
            if (parseRes.requireTwoFactor || parseRes.requires2FA) {
                navigate("/login/2fa", { state: { email } });
                return;
            }

            if (parseRes.token) {
                localStorage.setItem("token", parseRes.token);
                setAuth(true);
                toast.success("Logged in Successfully");
                navigate('/dashboard');
            } else {
                setAuth(false);
                toast.error("Invalid login response");
            }
        } catch (err) {
            console.error(err.message);
            toast.error("Server Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // If 2FA is required, show the 2FA component
    if (showTwoFactor) {
        return <TwoFactorLogin email={email} setAuth={setAuth} />;
    }

    // Otherwise show the normal login form
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
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </motion.button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account?</p>
                    <Link to="/register" className="register-link">Register</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

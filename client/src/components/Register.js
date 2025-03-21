import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaUserMd, FaUser, FaIdCard } from "react-icons/fa";
import { motion } from "framer-motion";
import '../App.css';

const Register = ({ setAuth }) => {
    const [inputs, setInputs] = useState({
        email: "",
        password: "",
        name: "",
        role: "patient",
        doctor_id: ""
    });

    const navigate = useNavigate();
    const { email, password, name, role, doctor_id } = inputs;

    const onChange = (e) =>
        setInputs({ ...inputs, [e.target.name]: e.target.value });

    const onSubmitForm = async (e) => {
        e.preventDefault();

        // Validate form
        if (role === "patient" && !doctor_id) {
            toast.error("Doctor ID is required for patients");
            return;
        }

        try {
            // Create request body based on role
            const body = { email, password, name, role };
            
            // Add doctor_id only if role is patient
            if (role === "patient") {
                body.doctor_id = doctor_id;
            }

            // Send registration request
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const parseRes = await response.json();

            if (response.ok) {
                // Store token and update auth state
                localStorage.setItem("token", parseRes.token);
                setAuth(true);
                toast.success("Registration successful!");
                navigate("/dashboard");
            } else {
                // Handle registration failure
                throw new Error(parseRes || "Registration failed");
            }
        } catch (err) {
            console.error(err.message);
            toast.error(err.message || "Registration failed. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <motion.div 
                className="login-box register-box"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-header">
                    <FaUserMd className="header-icon" />
                    <h1>MediSafe</h1>
                    <p>Create your account to get started.</p>
                </div>

                <form onSubmit={onSubmitForm} className="login-form">
                    <div className="form-group">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            name="name"
                            value={name}
                            placeholder="Full Name"
                            onChange={onChange}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            value={email}
                            placeholder="Email Address"
                            onChange={onChange}
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
                            onChange={onChange}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <select
                            name="role"
                            value={role}
                            onChange={onChange}
                            className="form-control role-select"
                        >
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                        </select>
                    </div>

                    {role === "patient" && (
                        <div className="form-group">
                            <FaIdCard className="input-icon" />
                            <input
                                type="text"
                                name="doctor_id"
                                value={doctor_id}
                                placeholder="Doctor ID (Required for Patients)"
                                onChange={onChange}
                                className="form-control"
                                required
                            />
                        </div>
                    )}

                    <motion.button 
                        className="login-button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                    >
                        Register
                    </motion.button>
                </form>

                <div className="login-footer">
                    <p>Already have an account?</p>
                    <Link to="/login" className="register-link">Login here</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;

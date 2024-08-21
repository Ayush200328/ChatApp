import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const RegisterPage = () => {
  const { handleUserRegister } = useAuth();

  const [credentials, setCredentials] = useState({
    name:"",
    email: "",
    passward1: "",
    passward2: "",
  });

  const handleInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setCredentials({ ...credentials, [name]: value });
  };

  return (
    <div className="auth--container">
      <div className="form--wrapper">
        <form
          onSubmit={(e) => {
            handleUserRegister(e, credentials);
          }}
        >
          <div className="field--wrapper">
            <label>Name:</label>
            <input
              type="text"
              required
              name="name"
              placeholder="Enter your name..."
              value={credentials.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="field--wrapper">
            <label>Email:</label>
            <input
              type="email"
              required
              name="email"
              placeholder="Enter your email..."
              value={credentials.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="field--wrapper">
            <label>Password:</label>
            <input
              type="password"
              required
              name="password1"
              placeholder="Enter your password..."
              value={credentials.password1}
              onChange={handleInputChange}
            />

            <label>Confirm Password:</label>
            <input
              type="password"
              required
              name="password2"
              placeholder="Confirm your password..."
              value={credentials.password2}
              onChange={handleInputChange}
            />

            <div className="field--wrapper">
              <input
                type="submit"
                value="Register"
                className="btn btn--lg btn--main"
              />
            </div>
          </div>
        </form>

        <p>
          Already have an account? <Link to="/login">Here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

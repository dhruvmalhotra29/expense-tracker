import { useState } from "react";
import api from "../api/axiosInstance";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login(){

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    let isValid = true;

    const inputs = document.querySelectorAll(".input-field");

    inputs.forEach(input => {
      const error = input.nextElementSibling;
      if(!error) return;
      if(input.hasAttribute("required") && !input.value.trim()){
        error.style.display = "block";
        isValid = false;
      }
      else{
        error.style.display = "none";
      }
    });

    if(!isValid) return;

    try{
      const result = await api.post("/auth/login",{
        username,
        password
      });

      // Save username & password
      localStorage.setItem("token",result.data.access);
      localStorage.setItem("username",username);
      toast.success("Logged in successfully");
      navigate("/dashboard", { replace: true });
  } catch (err) {
    //Handle invalid credentials
    if (err.response && err.response.status === 401){
      toast.error("Invalid login credentials");
    }
    else{
      toast.error("Server error. Please try again later");
    }
    console.error(err.response?.data || err);
  }
};

  return (
    <div className="login-page">

      {/* Left content area */}
      <div className="login-info">
        <h1>Expense Tracker</h1>
        <p>
          A simple and secure way to track your daily expenses,
          manage your budget and stay in control of your money.
        </p>
      </div>

      {/* Vertical divider */}
      <div className="login-divider"></div>

      {/* Right form area */}
      <div className="login-form-area">

        <h2>Sign in</h2>

        <form onSubmit={handleLogin} noValidate>

          <input className="input-field" placeholder="Username"
            value={username} onChange={e => setUsername(e.target.value)} required/>
          <span className="error-message"> Username is required</span>

          <input className="input-field" type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)} required/>
          <span className="error-message">Password is required</span>
          <button className="button" type="submit">Login</button>

        </form>
      </div>

    </div>
  );
}

export default Login;
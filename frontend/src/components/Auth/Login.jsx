// src/components/Auth/Login.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../../services/firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onLoginSuccess();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={handleEmailLogin}>Login</button>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;

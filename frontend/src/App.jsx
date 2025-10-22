import React from "react";
import { Link } from "react-router-dom";
import Quiz from "./components/Quiz";

export default function App(){
  return (
    <div className="container" style={{ padding: 20 }}>
      <h1>DSS — Major Selection </h1>
      <nav>
        <Link to="/login">Login</Link> |{" "}
        <Link to="/register">Register</Link> |{" "}
        <Link to="/quiz">Start the test</Link> |{" "}
        <Link to="/results">My Results</Link> |{" "}
        <Link to="/admin">Admin</Link>
      </nav>
      <p>Welcome! Use the nav to try the system.</p>
    </div>
  );
}

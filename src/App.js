// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Upload from "./Upload";
import Home from "./components/Home";
import SignIn from "./firebase/signIn";
import SignUp from "./firebase/signUp";
import GroupManagerLogin from "./firebase/groupManagerLogin";
import GroupManagerDashboard from "./components/GroupManagerDashboard";
import Sidebar from "./components/Sidebar"
function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar /> {/* Add the Sidebar component */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/grplogin" element={<GroupManagerLogin />} />
          <Route path="/grpdash" element={<GroupManagerDashboard />} />
          <Route path="*" element={<Navigate to="/signUp" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

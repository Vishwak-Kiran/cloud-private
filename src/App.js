import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Upload from "./Upload";

import { auth } from "./firebase/firebase"; // import firebase auth from your firebase file
import SignIn from "./firebase/signIn"; // import SignIn component from your signIn file
import SignUp from "./firebase/signUp"; // import SignUp component from your signUp file
import GroupManagerLogin from "./firebase/groupManagerLogin";
import GroupManagerDashboard from "./components/GroupManagerDashboard";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/grplogin" element={<GroupManagerLogin />} />
          <Route
            path="/grpdash"
            element={<GroupManagerDashboard />}
          />
          <Route path="*" element={<Navigate to="/signUp" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

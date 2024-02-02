import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const auth = getAuth();

  const sub = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pwd);
      const user = userCredential.user;

      // Retrieve user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();

        // Check user status before allowing sign in
        if (userData.status === "pending") {
          console.log("User status is pending. Cannot sign in yet.");
          // You can redirect to a different page or show an error message here.
        } else {
          console.log("User signed in successfully.");
          navigate("/upload");
        }
      } else {
        console.log("User data not found in Firestore.");
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    }
  };

  return (
    <>
      <h1
        style={{
          fontSize: "2em",
          color: "#3498db",
          marginBottom: "20px",
          transition: "color 0.3s ease-in-out",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.target.style.color = "#e74c3c")}
        onMouseLeave={(e) => (e.target.style.color = "#3498db")}
      >
        🌟 Welcome Back! Sign in to Your Account 🌟
      </h1>
      <div className="form-container signin-form">
        <form onSubmit={(event) => sub(event)}>
          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPwd(e.target.value)}
            />
          </div>
          <div>
            <button>Sign In</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignIn;

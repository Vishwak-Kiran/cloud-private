import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

const GroupManagerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const auth = getAuth();

  const handleGroupManagerLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const userCredential = await signInWithEmailAndPassword(auth, email, pwd);
      const user = userCredential.user;

      // Check if the authenticated user has the 'groupManager' role
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.role === "groupManager") {
          // Redirect to the Group Manager dashboard
          navigate("/grpdash");
        } else {
          // User does not have the 'groupManager' role
          setError("You do not have the required role to access this page.");
        }
      } else {
        // User document not found
        setError("User not found.");
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.error(errorCode, errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleGroupManagerLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In as Group Manager"}
          </button>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default GroupManagerLogin;

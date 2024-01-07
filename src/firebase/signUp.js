import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const auth = getAuth();

  const sendNotificationToGroupManager = async (userData) => {
    try {
      const notificationsCollection = collection(db, "notifications");
      await addDoc(notificationsCollection, {
        type: "signup_request",
        userData: userData,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const signup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Add user data to Firestore with 'pending' status
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        name: name,
        email: email,
        status: "pending",
        uid:user.uid,
      });

      // Send notification to Group Manager
      await sendNotificationToGroupManager({
        name: name,
        email: email,
        uid: user.uid,
      });

      // Redirect to a page indicating successful signup (optional)
      navigate("/signup-success");
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
    <form onSubmit={signup}>
      <input
        type="text"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
        value={name}
        required
      />
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        required
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        required
      />
      <button type="submit" disabled={loading}>
        Sign Up
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default Signup;

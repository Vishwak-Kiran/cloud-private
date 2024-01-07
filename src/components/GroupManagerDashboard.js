import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const GroupManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve a list of users with 'pending' status
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const pendingUsersData = usersSnapshot.docs
          .filter((doc) => doc.data().status === "pending")
          .map((doc) => doc.data());

        setUsers(pendingUsersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/signIn");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAcceptUser = async (uid) => {
    try {
      // Update the user status to 'accepted'
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, {
        status: "accepted",
      });

      // Refresh the list of pending users
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const pendingUsersData = usersSnapshot.docs
        .filter((doc) => doc.data().status === "pending")
        .map((doc) => doc.data());

      setUsers(pendingUsersData);
    } catch (error) {
      console.error("Error accepting user:", error);
    }
  };

  const handleRejectUser = async (uid) => {
    try {
      // Delete the user document
      const userDocRef = doc(db, "users", uid);
      await deleteDoc(userDocRef);

      // Refresh the list of pending users
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const pendingUsersData = usersSnapshot.docs
        .filter((doc) => doc.data().status === "pending")
        .map((doc) => doc.data());

      setUsers(pendingUsersData);
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Group Manager Dashboard</h1>
      <button onClick={handleSignOut}>Sign Out</button>

      <h2>Pending Sign-Up Requests:</h2>
      <ul>
        {users.map((user) => (
          <li key={user.uid}>
            {user.name} - {user.email}
            <button onClick={() => handleAcceptUser(user.uid)}>Accept</button>
            <button onClick={() => handleRejectUser(user.uid)}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupManagerDashboard;

import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref as realdbRef,
  update as realdbUpdate,
  get as realdbGet,
  set,
} from "firebase/database";
import { db, realdb } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import AWS from "aws-sdk";
import ReactS3Client from "react-s3-typescript";

const GroupManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const config = {
    bucketName: process.env.REACT_APP_BUCKET_NAME,
    region: process.env.REACT_APP_REGION,
    accessKeyId: process.env.REACT_APP_ACCESS,
    secretAccessKey: process.env.REACT_APP_SECRET,
  };

  AWS.config.update(config);

  const handleFileInput = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/signIn");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error("No file selected.");
      return;
    }

    setIsUploading(true);

    const s3 = new ReactS3Client(config);

    try {
      const fileKey = selectedFile.name.replace(/[.#$[\]]/g, "_");
      const data = await s3.uploadFile(selectedFile, fileKey);
      console.log(
        "File uploaded successfully. Location:",
        process.env.REACT_APP_REGION
      );
      console.log(data);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  const handleAcceptUser = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, {
        status: "accepted",
      });

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
      const userDocRef = doc(db, "users", uid);
      await deleteDoc(userDocRef);

      const realdbUserRef = realdbRef(realdb, `users/${uid}`);
      await set(realdbUserRef, null);

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

      <div>
        <input type="file" onChange={handleFileInput} />
        <button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload to S3"}
        </button>
      </div>

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

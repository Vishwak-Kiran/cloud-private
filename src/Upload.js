import React, { useState, useEffect } from "react";
import AWS from "aws-sdk";
import ReactS3Client from "react-s3-typescript";
import { realdb, db, auth } from "./firebase/firebase";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  ref as realdbRef,
  update as updateRealtimeDb,
  increment as databaseIncrement,
} from "firebase/database";
import {
  getFirestore,
  updateDoc,
  increment as firestoreIncrement,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [objectList, setObjectList] = useState([]);
  const [userApproval, setUserApproval] = useState({});
  const [votes, setVotes] = useState({});
  const [userRequests, setUserRequests] = useState([]);
  const [totalUsers, setTotalUsers] = useState(5);

  const [isRequesting, setIsRequesting] = useState(false);
  const [hasActiveRequests, setHasActiveRequests] = useState(false);
  const user = useAuth();
  const navigate = useNavigate();

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
  const logout = async () => {
    try {
      await auth.signOut();
      console.log("User logged out");
      navigate("/login");
      // Add any additional logic or redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const currentUser = user.currentUser;

  const uploadFile = async () => {
    if (!selectedFile) {
      console.error("No file selected.");
      return;
    }

    setIsUploading(true);

    const s3 = new ReactS3Client(config);

    try {
      const data = await s3.uploadFile(selectedFile);
      console.log(
        "File uploaded successfully. Location:",
        process.env.REACT_APP_REGION
      );
      listObjects();
      realdb.ref("requests").child(selectedFile.name).set({ count: 1 });
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const listObjects = async () => {
    const s3ListObjects = new AWS.S3({
      accessKeyId: process.env.REACT_APP_ACCESS,
      secretAccessKey: process.env.REACT_APP_SECRET,
      region: process.env.REACT_APP_REGION,
    });

    const params = {
      Bucket: process.env.REACT_APP_BUCKET_NAME,
    };

    try {
      const data = await s3ListObjects.listObjectsV2(params).promise();
      console.log("List of objects:", data.Contents);
      setObjectList(data.Contents || []);
    } catch (error) {
      console.error("Error listing objects:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const userId = currentUser?.uid;
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRequestedFiles = userData?.requestedFiles || [];

        setHasActiveRequests(userRequestedFiles.length > 0);
        setUserRequests(userRequestedFiles);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    listObjects();
    fetchUserData();
  }, []);

  const handleRequest = async (objectKey) => {
    if (isRequesting || hasActiveRequests) {
      return;
    }

    setIsRequesting(true);

    const sanitizedKey = objectKey.replace(/[.#$[\]]/g, "_");

    await fetchUserData();

    if (userRequests.includes(sanitizedKey)) {
      alert("You have already requested this file.");
      setIsRequesting(false);
      return;
    }

    const userId = currentUser?.uid;
    const userDocRef = doc(db, "users", userId);

    try {
      await updateRealtimeDb(realdbRef(realdb, `users/${userId}`), {
        requestedFile: sanitizedKey,
        votes: 0,
      });

      await updateRealtimeDb(realdbRef(realdb, `requests/${sanitizedKey}`), {
        count: databaseIncrement(1),
      });

      setUserApproval((prevApproval) => ({
        ...prevApproval,
        [sanitizedKey]: true,
      }));

      setVotes((prevVotes) => ({
        ...prevVotes,
        [sanitizedKey]: 0,
      }));

      await setDoc(
        userDocRef,
        {
          requestedFiles: [...userRequests, sanitizedKey],
        },
        { merge: true }
      );

      setUserRequests((prevUserRequests) => [
        ...prevUserRequests,
        sanitizedKey,
      ]);
    } catch (error) {
      console.error("Error handling request:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const getObjectUrl = (objectKey) => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.REACT_APP_ACCESS,
      secretAccessKey: process.env.REACT_APP_SECRET,
      region: process.env.REACT_APP_REGION,
    });
    return s3.getSignedUrl("getObject", {
      Bucket: process.env.REACT_APP_BUCKET_NAME,
      Key: objectKey,
    });
  };

  const ApprovalStatus = ({ objectKey }) => {
    if (!userApproval[objectKey]) {
      return null;
    }

    const approvalCount = votes[objectKey] || 0;

    return (
      <div style={{ marginTop: "10px" }}>
        <span>
          {approvalCount}/{totalUsers}
        </span>
        {approvalCount === totalUsers && (
          <span style={{ marginLeft: "10px", color: "green" }}>
            All users approved!{" "}
            <a
              href={getObjectUrl(objectKey)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "green" }}
            >
              View/Download
            </a>
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ textAlign: "center", maxWidth: "600px", margin: "auto" }}>
      <div style={{ fontSize: "24px", marginBottom: "20px" }}>
        React S3 File Upload
      </div>
      <input
        type="file"
        onChange={handleFileInput}
        style={{ marginBottom: "10px" }}
      />
      <br />
      <button onClick={uploadFile} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload to S3"}
      </button>
      <button onClick={logout}>Logout</button>
      <div style={{ marginTop: "30px" }}>
        <h2>List of Objects</h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: "10px" }}>Object Key</th>
              <th style={{ padding: "10px" }}>Size</th>
              <th style={{ padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {objectList.map((object) => (
              <tr key={object.Key} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{object.Key}</td>
                <td style={{ padding: "10px" }}>{object.Size}</td>
                <td style={{ padding: "10px" }}>
                  <button
                    onClick={() => handleRequest(object.Key)}
                    disabled={
                      userRequests.includes(object.Key) || hasActiveRequests
                    }
                  >
                    Request
                  </button>
                  <ApprovalStatus objectKey={object.Key} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Upload;

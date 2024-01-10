import React, { useState, useEffect } from "react";
import { ref as realdbRef, onValue, update, get, set } from "firebase/database";
import { realdb } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import AWS from "aws-sdk";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faDownload,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom"; // Make sure to import Link if you are using React Router

import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [votedUsers, setVotedUsers] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const user = useAuth();

  useEffect(() => {
    const userId = user.currentUser?.uid;

    if (userId) {
      const userRef = realdbRef(realdb, `users/${userId}`);
      const unsubscribeUser = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(data);
        }
      });

      const usersRef = realdbRef(realdb, "users");
      const unsubscribeRequests = onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val();
        const updatedIncomingRequests = [];

        const totalUsersCount = Object.keys(usersData).length;
        setTotalUsers(totalUsersCount);

        for (const otherUserId in usersData) {
          if (
            otherUserId !== userId &&
            usersData[otherUserId].requestedFile &&
            !acceptedRequests.includes(otherUserId) &&
            !votedUsers.includes(otherUserId)
          ) {
            const requestedFile = usersData[otherUserId].requestedFile;
            const fileType = getFileType(requestedFile);

            updatedIncomingRequests.push({
              userId: otherUserId,
              requestedFile: requestedFile,
              userName: usersData[otherUserId].name,
              votes: usersData[otherUserId].votes || 0,
              fileType: fileType,
            });
          }
        }

        setIncomingRequests(updatedIncomingRequests);
      });

      const getFileType = (filename) => {
        // Use underscores (_) as separators
        const parts = filename.split("_");
        const extension = parts.pop().toLowerCase();

        // Map specific file extensions to their types (you can extend this list)
        const fileTypeMap = {
          pdf: "PDF Document",
          doc: "Word Document",
          docx: "Word Document",
          xls: "Excel Spreadsheet",
          xlsx: "Excel Spreadsheet",
          txt: "Text File",
          jpg: "Image",
          jpeg: "Image",
          png: "Image",
          gif: "Image",
        };

        return fileTypeMap[extension] || "N/A";
      };

      const votesRef = realdbRef(realdb, `votes/${userId}`);
      const unsubscribeVotes = onValue(votesRef, (snapshot) => {
        const votesData = snapshot.val();
        if (votesData) {
          setVotedUsers(Object.keys(votesData));
        }
      });

      // Load accepted requests from Firebase
      const acceptedRequestsRef = realdbRef(
        realdb,
        `acceptedRequests/${userId}`
      );

      const unsubscribeAcceptedRequests = onValue(
        acceptedRequestsRef,
        (snapshot) => {
          const acceptedRequestsData = snapshot.val();
          if (acceptedRequestsData) {
            setAcceptedRequests(Object.keys(acceptedRequestsData));
          }
        }
      );

      return () => {
        unsubscribeUser();
        unsubscribeRequests();
        unsubscribeVotes();
        unsubscribeAcceptedRequests();
      };
    }
  }, [user.currentUser, acceptedRequests, votedUsers]);

  const handleAccept = async (userId) => {
    const userRef = realdbRef(realdb, `users/${userId}`);

    if (votedUsers.includes(user.currentUser.uid)) {
      console.log("You have already voted for this request.");
      return;
    }

    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    if (userData) {
      const updateData = {
        votes: userData.votes ? userData.votes + 1 : 1,
      };

      const votersRef = realdbRef(realdb, `users/${userId}/voters`);
      await update(votersRef, { [user.currentUser.uid]: true });

      await update(userRef, updateData);

      setAcceptedRequests((prevAcceptedRequests) => [
        ...prevAcceptedRequests,
        userId,
      ]);

      localStorage.setItem(
        "acceptedRequests",
        JSON.stringify([...acceptedRequests, userId])
      );

      console.log(`Request button state: enabled`);
      console.log(`Votes after accept: ${updateData.votes}`);

      const updatedVotesSnapshot = await get(userRef);
      const updatedVotesData = updatedVotesSnapshot.val();

      console.log(
        `Real-time fetch of votes after accept: ${updatedVotesData.votes}`
      );

      setVotedUsers([...votedUsers, user.currentUser.uid]);

      // Update the accepted requests in the Firebase database
      const acceptedRequestsRef = realdbRef(
        realdb,
        `acceptedRequests/${user.currentUser.uid}`
      );
      await update(acceptedRequestsRef, { [userId]: true });
    } else {
      console.error("User data not found");
    }
  };
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  const handleDecline = async (userId) => {
    const userRef = realdbRef(realdb, `users/${userId}`);
    const updateData = {
      requestedFile: "",
      votes: 0,
    };

    await update(userRef, updateData);

    // Remove all accepted requests from local storage
    setAcceptedRequests([]);
    localStorage.setItem("acceptedRequests", " ");

    // Remove the requester's UID from every other user's acceptedRequests
    const allUsersRef = realdbRef(realdb, "users");
    const allUsersSnapshot = await get(allUsersRef);
    const allUsersData = allUsersSnapshot.val();

    for (const otherUserId in allUsersData) {
      if (otherUserId !== userId) {
        const otherUserAcceptedRequestsRef = realdbRef(
          realdb,
          `acceptedRequests/${otherUserId}`
        );
        await update(otherUserAcceptedRequestsRef, { [userId]: null });
      }
    }
  };

  const handleDownload = async (userId) => {
    const userRef = realdbRef(realdb, `users/${userId}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    if (userData && userData.requestedFile) {
     const objectKey = userData.requestedFile.replace(/_(?=[^_]*$)/, ".");


      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_ACCESS,
        secretAccessKey: process.env.REACT_APP_SECRET,
        region: process.env.REACT_APP_REGION,
      });

      const params = {
        Bucket: process.env.REACT_APP_BUCKET_NAME,
        Key: objectKey,
      };

      try {
        // Get a signed URL for the requested file
        const downloadUrl = await s3.getSignedUrlPromise("getObject", params);

        // Open the signed URL in a new tab
        window.open(downloadUrl, "_blank");
      } catch (error) {
        console.error("Error getting signed URL:", error);
      }

      // Reset the user's data after download
      const updateData = {
        requestedFile: null,
        votes: 0,
      };

      await update(userRef, updateData);

      // Remove the requester's UID from every other user's acceptedRequests
      const allUsersRef = realdbRef(realdb, "users");
      const allUsersSnapshot = await get(allUsersRef);
      const allUsersData = allUsersSnapshot.val();

      for (const otherUserId in allUsersData) {
        if (otherUserId !== userId) {
          const otherUserAcceptedRequestsRef = realdbRef(
            realdb,
            `acceptedRequests/${otherUserId}`
          );
          await update(otherUserAcceptedRequestsRef, { [userId]: null });
        }
      }
    } else {
      console.error("Requested file not found");
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <button className="toggle-button" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </button>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          {user.currentUser && (
            <div>
              <div>User: {user.currentUser.email}</div>
            </div>
          )}

          {/* Your Request Section */}
          <div>
            <h3>Your Request</h3>
            {userData?.requestedFile && (
              <div>
                <div>Requested File: {userData.requestedFile}</div>
                <div>Votes: {userData.votes || 0}</div>
                {userData.votes === totalUsers && (
                  <button onClick={() => handleDownload(user.currentUser.uid)}>
                    Download
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Incoming Requests Section */}
          <div>
            <h3>Incoming Requests</h3>
            {incomingRequests.map((request) => (
              <div key={request.userId} className="incoming-request">
                <div className="incoming-request-details">
                  <span>Request from:</span> {request.userName}
                  <br />
                  <span>Requested File:</span> {request.requestedFile}
                  <br />
                  <span>File Type:</span> {request.fileType}
                  <br />
                  <span>Votes:</span> {request.votes} / {totalUsers}
                </div>
                <div className="incoming-request-buttons">
                  {request.votes === totalUsers && (
                    <button onClick={() => handleDownload(request.userId)}>
                      <FontAwesomeIcon icon={faDownload} /> Download
                    </button>
                  )}
                  <button onClick={() => handleAccept(request.userId)}>
                    <FontAwesomeIcon icon={faCheck} /> Accept
                  </button>
                  <button onClick={() => handleDecline(request.userId)}>
                    <FontAwesomeIcon icon={faTimes} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

import React, { useState, useEffect } from "react";
import { ref as realdbRef, onValue, set, update } from "firebase/database";
import { realdb } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const user = useAuth();

  useEffect(() => {
    const userId = user.currentUser?.uid;

    if (userId) {
      const userRef = realdbRef(realdb, `users/${userId}`);

      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(data);
        }
      });

      // Fetch incoming requests
      const usersRef = realdbRef(realdb, "users");
      const incomingRequests = [];

      onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val();
        for (const userId in usersData) {
          if (
            userId !== user.currentUser.uid &&
            usersData[userId].requestedFile &&
            !acceptedRequests.includes(userId) // Filter out accepted requests
          ) {
            incomingRequests.push({
              userId: userId,
              requestedFile: usersData[userId].requestedFile,
              userName: usersData[userId].name,
            });
          }
        }

        setIncomingRequests(incomingRequests);
      });

      return () => unsubscribe();
    }
  }, [user.currentUser, acceptedRequests]);

  const handleAccept = async (userId) => {
    // Handle the accept action, e.g., update the database
    const userRef = realdbRef(realdb, `users/${userId}`);
    console.log("userRef", userRef);
    console.log("userData", userData);
    const updateData = {
      votes: userData.votes ? userData.votes + 1 : 1,
    };

    await update(userRef, updateData);

    // Remove the accepted request from incomingRequests
    setAcceptedRequests((prevAcceptedRequests) => [
      ...prevAcceptedRequests,
      userId,
    ]);
  };

  const handleDecline = (userId) => {
    // Handle the decline action, e.g., update the database
    const userRef = realdbRef(realdb, `users/${userId}`);
    const updateData = {
      votes: 0, // Reset votes to 0
      // Update other details as needed
    };

    update(userRef, updateData);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        blah bla
      </button>
      <div className="sidebar-content">
        {user.currentUser && (
          <div>
            <div>User: {userData.name}</div>
          </div>
        )}

        {/* Your Request Section */}
        <div>
          <h3>Your Request</h3>
          {userData?.requestedFile && (
            <div>
              <div>Requested File: {userData.requestedFile}</div>
              <div>Votes: {userData.votes || 0}</div>
              {/* Add more details as needed */}
            </div>
          )}
        </div>

        {/* Incoming Requests Section */}
        <div>
          <h3>Incoming Requests</h3>
          {incomingRequests.map((request) => (
            <div key={request.userId} className="incoming-request">
              <div>
                User: {request.userName}, Requested File:{" "}
                {request.requestedFile}
              </div>
              <button onClick={() => handleAccept(request.userId)}>
                Accept
              </button>
              <button onClick={() => handleDecline(request.userId)}>
                Decline
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

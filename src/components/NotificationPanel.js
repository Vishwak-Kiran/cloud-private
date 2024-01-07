// NotificationPanel.js

import React, { useEffect, useState } from "react";
import { db } from "./firebase";

const NotificationPanel = () => {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      // Query the 'users' collection to get pendingRequests
      const userDoc = await db.collection("users").doc("currentUserId").get();
      const pendingRequests = userDoc.data().pendingRequests || [];

      setNotificationCount(pendingRequests.length);
    };

    fetchNotifications();
  }, []);

  return (
    <div>
      <div>
        {notificationCount > 0 ? `${notificationCount}/5` : "No notifications"}
      </div>
      {notificationCount > 0 && (
        <div>
          <button>Accept</button>
          <button>Decline</button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;

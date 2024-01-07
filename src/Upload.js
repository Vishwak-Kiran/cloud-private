import React, { useState, useEffect } from "react";
import AWS from "aws-sdk";
import ReactS3Client from "react-s3-typescript";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [objectList, setObjectList] = useState([]);

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
      listObjects(); // Update the object list after uploading
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

  // Call listObjects when the component mounts
  useEffect(() => {
    listObjects();
  }, []); // Empty dependency array to run the effect only once

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
                  <a
                    href={getObjectUrl(object.Key)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "#0066cc" }}
                  >
                    View/Download
                  </a>
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

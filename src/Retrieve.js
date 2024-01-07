import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase/firebase"; // import firebase auth from your firebase file
import {
  S3Client,
  ListObjectsCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Table } from "react-bootstrap";
import AWS from "aws-sdk";
import { fromEnv } from "@aws-sdk/credential-provider-env";
window.Buffer = window.Buffer || require("buffer").Buffer;

const Retrieve = () => {
  const [files, setFiles] = useState([]);
  const [retrievedFileUrl, setRetrievedFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  const s3 = new S3Client({
    region: process.env.REACT_APP_REGION,
  });
  
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        navigate("/signIn");
      }
      setLoading(false);
    });

    const listFiles = async () => {
      console.log("accessing list files");
      try {
        const data = await s3.send(
          new ListObjectsCommand({ Bucket: process.env.REACT_APP_BUCKET_NAME })
        );
        console.log(data);
        setFiles(data.Contents);
      } catch (error) {
        console.error("Error listing files:", error);
      }
    };

    listFiles();
    console.log(files);
  }, [navigate]);

  const getFile = async (key) => {
    const command = new GetObjectCommand({
      Bucket: process.env.REACT_APP_BUCKET_NAME,
      Key: process.env.REACT_APP_ACCESS,
    }); // replace with your bucket name
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // get a signed URL valid for 1 hour
    window.open(signedUrl, "_blank"); // open the file in a new tab
  };

  const retrieveFile = async (fileName) => {
    const s3 = new AWS.S3();

    const params = {
      Bucket: process.env.REACT_APP_BUCKET_NAME,
      Key: fileName,
    };

    try {
      const url = s3.getSignedUrl("getObject", params);
      console.log("File URL:", url);
      setRetrievedFileUrl(url);
    } catch (error) {
      console.error("Error retrieving file:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div>
      <button onClick={() => retrieveFile("students (4).xlsx.xlsx")}>
        Retrieve File
      </button>
      {retrievedFileUrl && (
        <div>
          <p>Retrieved File URL:</p>
          <a href={retrievedFileUrl} target="_blank" rel="noopener noreferrer">
            {retrievedFileUrl}
          </a>
        </div>
      )}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Format</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.Key} onClick={() => getFile(file.Key)}>
              <td>{file.Key}</td>
              <td>{file.Key.split(".").pop()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Retrieve;

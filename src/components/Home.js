import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import ImageSlider from "./ImageSlider";

const Home = () => {
  const [parentWidth, setParentwidth] = useState(1000);
  const navigate = useNavigate();

  useEffect(() => {
    function handleResize() {
      setParentwidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const containerStyles = {
    width: "100%",
    height: "100%",
    margin: "0 auto",
    display: "inline-block",
  };

  const tilesColumnStyles = {
    position: "absolute",
    top: -16,
    left: "88%", // Adjust the left value to position the column to the rightmost side
    display: "flex",
    flexDirection: "column",
  };

  const tiles = [
    {
      id: 1,
      title: "Home",
      content: "Welcome to our home page.",
      position: { top: "20px" },
    },
    {
      id: 2,
      title: "Upload Page",
      content: "Explore our user-friendly upload page.",
      position: { top: "225px" },
    },
    {
      id: 3,
      title: "Sign Up",
      content: "Join our community by signing up.",
      position: { top: "430px" },
    },
    {
      id: 4,
      title: "Group Manager Login",
      content: "Exclusive access for group manager",
      position: { top: "635px" },
    },
  ];

  const slides = [
    {
      url: "https://i.ibb.co/bJQFz4g/Untitled-design-2.png",
      title: "Plane Slide",
      redirectLink: "/",
    },
    {
      url: "https://i.ibb.co/bJQFz4g/Untitled-design-2.png",
      title: "Train Slide",
      redirectLink: "/upload",
    },
    {
      url: "https://i.ibb.co/bJQFz4g/Untitled-design-2.png",
      title: "Hotel Slide",
      redirectLink: "/signUp",
    },
    {
      url: "https://i.ibb.co/bJQFz4g/Untitled-design-2.png",
      title: "Another Train Slide",
      redirectLink: "/grplogin",
    },
  ];

  const handleTileClick = (redirectLink) => {
    // Redirect to the specified route
    navigate(redirectLink);
  };

  return (
    <div className="home">
      <div style={containerStyles}>
        <ImageSlider
          slides={slides}
          parentWidth={
            typeof window !== "undefined" ? window.innerWidth : parentWidth
          }
        />
      </div>
      <div className="tiles-column" style={tilesColumnStyles}>
        {tiles.map((tile) => (
          <div
            className="tile"
            key={tile.id}
            style={{ position: "absolute", ...tile.position }}
            onClick={() => handleTileClick(slides[tile.id - 1].redirectLink)}
          >
            <div className="tile-content">
              <h3>{tile.title}</h3>
              <p>{tile.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;

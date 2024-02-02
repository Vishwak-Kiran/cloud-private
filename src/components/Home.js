import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Home.module.css";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  useEffect(() => {
    let tl = gsap.timeline();
    let time = gsap.timeline();

    tl.from(`.${styles.navTitle}, .${styles.navItem}, .${styles.signupTitle}`, {
      y: -100,
      delay: 1,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
    });

    time.from(`.${styles.leftTitle}`, {
      x: -100,
      delay: 1,
      opacity: 0,
      duration: 1,
      stagger: 0.3,
    });
    time.from(`.${styles.rightImage}`, {
      scale: 0,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
    });

    gsap.from(`.${styles.page2} .${styles.box}`, {
      y: -100,
      opacity: 0,
      duration: 1,
      stagger: 0.4,
      scrollTrigger: `.${styles.page2} .${styles.box}`,
    });
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.nav}>
        <h1 className={styles.navTitle}></h1>
        <ul className={styles.navList}>
          <Link to="/" className={styles.navItem}>
            Home
          </Link>
          <Link to="/grplogin" className={styles.navItem}>
            Group Manager
          </Link>
          <Link to="/upload" className={styles.navItem}>
            Request Files
          </Link>
          <Link to="/signup" className={styles.navItem}>
            Sign Up
          </Link>
        </ul>
        <h2 className={styles.signupTitle}></h2>
      </div>

      <div className={styles.homeContainer}>
        <div className={styles.left}>
          <h1 className={styles.leftTitle}>your security</h1>
          <h1 className={styles.leftTitle}>your anonymity</h1>
          <h1 className={styles.leftTitle}>
            <span>
              <img
                className={styles.circleImg}
                src="https://res.cloudinary.com/hjlz68xhm/image/upload/dpr_auto,q_auto,c_fill,f_png,w_900,h_700/v1699901251/em1xmhnmvskspef4jptg.png"
                alt=""
              />
            </span>
            <span>
              <img
                className={styles.circleImg}
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxvY2tjaGFpbnxlbnwwfHwwfHx8MA%3D%3D"
                alt=""
              />
            </span>
            <span>
              <img
                className={styles.circleImg}
                src="https://img.freepik.com/premium-photo/cloud-technology-with-padlock-online-security-concept_117856-1344.jpg"
                alt=""
              />
            </span>
            bridged
          </h1>
        </div>
        <div className={styles.right}>{/* Add your image here */}</div>
      </div>

      <div className={styles.page2}>
        <div className={styles.box}>
          <h2>TRACEABILITY</h2>
          <p>
            Any actions undertaken will be checked and verified by the group
            manager
          </p>
        </div>
        <div className={styles.box}>
          <h2>ANONYMITY ASSURANCE</h2>
          <p>
            All user data will be safe from any other user or outside rogue
            parties
          </p>
        </div>
        <div className={styles.box}>
          <h2>SBIBD</h2>
          <p>
            Block Design Key Fragmentation to distribute keys among group
            members
          </p>
        </div>
        {/* Repeat the box component as needed */}
      </div>
    </div>
  );
};

export default Home;

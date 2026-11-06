
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import StageBackground from "./StageBackground.jsx";
import "../styles/Login.css";
import "../styles/MyBands.css";

const StageMateLayout = () => {
    const location = useLocation();

    return (
        <div className="login-page">
            <StageBackground />

            <div className="login-content bands-content">
                <div className="login-header">
                    <h1 className="login-title">
                        <span>StageMate</span>
                    </h1>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        className="stage-page-transition"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{
                            duration: 0.35,
                            ease: "easeInOut"
                        }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StageMateLayout;

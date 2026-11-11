
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import StageBackground from "./StageBackground.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

import "../styles/Login.css";
import "../styles/MyBands.css";

const StageMateLayout = () => {
    const location = useLocation();

    return (
        <div className="login-page">
            <StageBackground />

            {/* Selettore lingua come nel login */}
            <div className="login-language">
                <LanguageSwitcher />
            </div>

            <div className="login-content bands-content">

                {/* Titolo StageMate bianco */}
                <div className="login-header">
                    <img
                        src="/images/logo-stage.png"
                        alt="Logo StageMate"
                        className="login-logo-icon"
                    />

                    <h1 className="login-title">
                        <span className="login-brand">
                            StageMate
                        </span>
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


import { memo } from "react";
import StageSmoke from "./StageSmoke";
import "../styles/StageBackground.css";

const StageBackground = () => {
    return (
        <div className="stage-background" aria-hidden="true">
            <div className="stage-scene" />

            <div className="stage-light light-left" />
            <div className="stage-light light-right" />

            <StageSmoke />

            <div className="stage-vignette" />
        </div>
    );
};

export default memo(StageBackground);

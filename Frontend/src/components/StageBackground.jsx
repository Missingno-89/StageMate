import { memo } from "react";
import StageSmoke from "./StageSmoke";
import "../styles/StageBackground.css";

const StageBackground = () => {
    return (
        <div className="stage-background" aria-hidden="true">
            <div className="stage-light light-left"></div>
            <div className="stage-light light-right"></div>

            <StageSmoke />
        </div>
    );
};

export default memo(StageBackground);
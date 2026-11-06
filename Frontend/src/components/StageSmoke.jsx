import { useMemo } from "react";
import { SmokeScene } from "react-smoke";
import * as THREE from "three";
import "../styles/StageSmoke.css";

const StageSmoke = () => {
    const smokeColor = useMemo(
        () => new THREE.Color("#c9b4dc"),
        []
    );

    return (
        <div className="stage-smoke">
            <SmokeScene
                gl={{ alpha: true }}
                style={{ background: "transparent" }}
                smoke={{
                    color: smokeColor,
                    density: 35,
                    opacity: 0.35,
                    enableRotation: true,
                    enableTurbulence: true,
                    turbulenceStrength: [0.02, 0.03, 0.01],
                }}
            />
        </div>
    );
};

export default StageSmoke;
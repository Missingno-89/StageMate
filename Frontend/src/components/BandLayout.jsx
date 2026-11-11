import { Outlet } from "react-router-dom";
import "../styles/BandLayout.css";
import BandSidebar from "./BandSidebar.jsx";
import BandTopbar from "./BandTopbar.jsx";

const BandLayout = () => {
    return (
        <div className="band-layout">
          <BandSidebar />

            <div className="band-main">
                <BandTopbar />

                <main className="band-main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default BandLayout;
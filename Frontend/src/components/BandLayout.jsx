
import { Outlet } from "react-router-dom";

import "../styles/BandLayout.css";

import BandSidebar from "./BandSidebar.jsx";
import BandTopbar from "./BandTopbar.jsx";

import BandMobileHeader from "./BandMobileHeader.jsx";
import BandMobileNav from "./BandMobileNav.jsx";

const BandLayout = () => {
    return (
        <div className="band-layout">

            <BandSidebar />

            <div className="band-main">

                <BandTopbar />

                <BandMobileHeader />

                <main className="band-main-content">
                    <Outlet />
                </main>

            </div>

            <BandMobileNav />

        </div>
    );
};

export default BandLayout;

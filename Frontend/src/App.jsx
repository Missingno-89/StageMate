
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import MyBands from "./pages/MyBands.jsx";
import CreateBand from "./pages/CreateBand.jsx";
import GoogleCallback from "./pages/GoogleCallback.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StageMateLayout from "./components/StageMateLayout.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import BandLayout from "./components/BandLayout.jsx";
import BandDashboard from "./pages/BandDashboard.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/auth/callback" element={<GoogleCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<StageMateLayout />}>
                    <Route path="/bands" element={<MyBands />} />
                    <Route path="/bands/new" element={<CreateBand />} />
                </Route>

                <Route element={<BandLayout />}>
                    <Route
                        path="/bands/:bandId/dashboard"
                        element={<BandDashboard />}
                    />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;

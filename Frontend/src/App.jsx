
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import MyBands from "./pages/MyBands.jsx";
import CreateBand from "./pages/CreateBand.jsx";
import GoogleCallback from "./pages/GoogleCallback.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StageMateLayout from "./components/StageMateLayout.jsx";

import BandLayout from "./components/BandLayout.jsx";
import BandDashboard from "./pages/BandDashboard.jsx";
import BandCalendar from "./components/BandCalendar.jsx";

function App() {
    return (
        <Routes>

            {/* ROTTE PUBBLICHE */}

            <Route path="/" element={<Login />} />

            <Route
                path="/auth/callback"
                element={<GoogleCallback />}
            />

            <Route
                path="/reset-password"
                element={<ResetPassword />}
            />

            <Route
                path="/verify-email"
                element={<VerifyEmail />}
            />

            {/* ROTTE PROTETTE */}

            <Route element={<ProtectedRoute />}>

                {/* GESTIONE BAND */}

                <Route element={<StageMateLayout />}>

                    <Route
                        path="/bands"
                        element={<MyBands />}
                    />

                    <Route
                        path="/bands/new"
                        element={<CreateBand />}
                    />

                </Route>

                {/* AREA INTERNA DELLA BAND */}

                <Route
                    path="/bands/:bandId"
                    element={<BandLayout />}
                >

                    <Route
                        path="dashboard"
                        element={<BandDashboard />}
                    />

                    <Route
                        path="calendar"
                        element={<BandCalendar />}
                    />

                </Route>

            </Route>

        </Routes>
    );
}

export default App;

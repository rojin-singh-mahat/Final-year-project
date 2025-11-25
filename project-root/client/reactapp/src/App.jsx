import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/login.jsx";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard.jsx";
import LandingPage from "./Pages/LandingPage.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";


function App() {
  return (
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID}>{/*temporary*/}
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<LandingPage></LandingPage>} />

        {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
      
        {/* Protected route */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
            </GoogleOAuthProvider>

  );
}

export default App;

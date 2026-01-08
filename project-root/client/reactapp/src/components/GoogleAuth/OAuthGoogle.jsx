import { GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';

export default function OAuthGoogle() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || '';

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={async (res) => {
          try {
            const backendRes = await fetch(`${API}/api/auth/google-login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential: res.credential }),
            });

            if (!backendRes.ok) {
              const err = await backendRes.json().catch(() => ({}));
              console.error('Backend Google login failed', err);
              return;
            }

            const data = await backendRes.json();
            if (data?.token) {
              localStorage.setItem("token", data.token);
              navigate('/dashboard');
            } else {
              console.error('No token returned from backend', data);
            }
          } catch (e) {
            console.error('Google login error', e);
          }
        }}
        onError={() => {
          console.log("Login Failed");
        }}
        theme="outline"
        shape="pill"
        text="signin_with"
        size="large"
        logo_alignment="left"
        ux_mode="popup"
      />
    </div>
  );
}

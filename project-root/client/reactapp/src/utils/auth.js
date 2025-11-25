export function getToken(){
    // Prefer localStorage (remember me) but fall back to sessionStorage
    return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export function logout(){
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "./login";
}

export async function getUserData(){
    const token = getToken();

    if (!token) return null;

    try{
        const API = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (!res.ok) {
            console.error('Failed to fetch /me', res.status);
            return null;
        }

        const data = await res.json();
        return data.user || null;
    } catch(e){
        console.log(e)
    }
}
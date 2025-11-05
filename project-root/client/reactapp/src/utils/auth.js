export function getToken(){
    return localStorage.getItem("token");
}

export function logout(){
    localStorage.removeItem("token");
    window.location.href = "./login";
}

export async function getUserData(){
    const token = getToken();

    if (!token) return null;

    try{
        const res = await fetch("http://localhost:5001/api/auth/me")
        if(!res) return 
    } catch(e){
        console.log(e)
    }
}
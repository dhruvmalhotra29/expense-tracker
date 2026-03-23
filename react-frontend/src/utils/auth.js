export const getUsername = () => {
    return localStorage.getItem("username")
};

export const getToken = () => {
    return localStorage.getItem("token")
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
};
export const getToken = () => localStorage.getItem("novacontent_token");
export const setToken = (token: string) => localStorage.setItem("novacontent_token", token);
export const removeToken = () => localStorage.removeItem("novacontent_token");

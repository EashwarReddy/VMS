import axios from "axios";
import { API } from "src/api";

export default axios.create({
    baseURL: `${API}`,
    withCredentials : true
})

export const axiosPrivate = axios.create({
    baseURL: `${API}`,
    headers: { 'Content-Type': "application/json" },
    withCredentials: true
})

export const  normalaxios = axios


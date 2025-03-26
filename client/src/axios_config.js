import axios from 'axios';

const env = process.env.NODE_ENV;
export const api = axios.create({
	baseURL:
		env === 'production' ? 'https://fresh-fare-backend.vercel.app/' : 'http://localhost:3001/',
});
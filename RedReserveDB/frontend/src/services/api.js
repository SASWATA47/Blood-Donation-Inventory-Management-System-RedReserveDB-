import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const loginUser = (credentials) => API.post('/auth/login', credentials);

// FIXED: Changed the '+' to a ',' to send the data as the request body
export const registerDonor = (donorData) => API.post('/donors/register', donorData);

// FIXED: Changed the '+' to a ',' here as well
export const requestBlood = (requestData) => API.post('/requests/new', requestData);

// Note: GET requests don't have a body, so appending the ID to the URL is correct here, 
// though template literals (`/queries/execute/${queryId}`) are generally preferred!
export const executeQuery = (queryId) => API.get('/queries/execute/' + queryId); 

// Add these to your existing api.js
export const insertRecord = (tableName, data) => API.post(`/queries/table/${tableName}`, data);
export const updateRecord = (tableName, data, pkData) => API.put(`/queries/table/${tableName}`, { data, pkData });
export const deleteRecord = async (tableName, pkData) => {
    return await axios.delete(`http://localhost:5000/api/queries/delete/${tableName}`, { // <-- adjust the base URL to match your app!
        data: { pkData } 
    });
};
export default API;
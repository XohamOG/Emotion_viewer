import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // Replace with your actual backend URL

// Medication API calls
export const createMedication = async (medication) => {
  try {
    const response = await axios.post(`${BASE_URL}/medications`, medication);
    return response.data;
  } catch (error) {
    console.error('Error creating medication:', error);
  }
};

export const readMedication = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/medications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error reading medication:', error);
  }
};

// Doctor API calls
export const addDoctor = async (doctor) => {
  try {
    const response = await axios.post(`${BASE_URL}/doctors`, { name: doctor });
    return response.data;
  } catch (error) {
    console.error('Error adding doctor:', error);
  }
};

// Caretaker API calls
export const addCaretaker = async (caretaker) => {
  try {
    const response = await axios.post(`${BASE_URL}/caretakers`, { name: caretaker });
    return response.data;
  } catch (error) {
    console.error('Error adding caretaker:', error);
  }
};

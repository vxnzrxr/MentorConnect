const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testServer() {
  try {
    const res = await axios.get(BASE_URL + '/');
    console.log('Server response:', res.data);
  } catch (error) {
    console.error('Error accessing server:', error.message);
  }
}

async function testRegister() {
  try {
    const res = await axios.post(BASE_URL + '/api/register', {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'pass123',
      role: 'mentee'
    });
    console.log('Register response:', res.data);
  } catch (error) {
    if (error.response) {
      console.error('Register error response:', error.response.data);
    } else {
      console.error('Register error:', error.message);
    }
  }
}

async function testLogin() {
  try {
    const res = await axios.post(BASE_URL + '/api/login', {
      email: 'testuser@example.com',
      password: 'pass123'
    });
    console.log('Login response:', res.data);
  } catch (error) {
    if (error.response) {
      console.error('Login error response:', error.response.data);
    } else {
      console.error('Login error:', error.message);
    }
  }
}

async function runTests() {
  await testServer();
  await testRegister();
  await testLogin();
}

runTests();

// Quick API test - run with: node debug-api.js
import axios from 'axios';

const BASE_URL = 'https://hisabkitab-backend-tjik.onrender.com/api';

async function testAPI() {
  console.log('🔍 Testing API endpoints...\n');

  // Test 1: Try to access transactions without auth
  console.log('1. Testing transactions without auth:');
  try {
    const response = await axios.get(`${BASE_URL}/transactions`);
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log(`❌ Status ${error.response?.status}: ${error.response?.data?.message || 'No message'}`);
  }

  // Test 2: Try to create account
  console.log('\n2. Testing signup:');
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      name: 'Test User',
      email: 'test@example.com',
      password: '123456'
    });
    console.log('✅ Signup success:', response.data);
    
    const token = response.data.token;
    if (token) {
      console.log('🔑 Got token:', token.substring(0, 20) + '...');
      
      // Test 3: Try transactions with auth
      console.log('\n3. Testing transactions with auth:');
      try {
        const txResponse = await axios.get(`${BASE_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Transactions success:', txResponse.data);
      } catch (error) {
        console.log(`❌ Transactions failed: ${error.response?.status} - ${error.response?.data?.message}`);
      }

      // Test 4: Try creating transaction
      console.log('\n4. Testing create transaction:');
      try {
        const createResponse = await axios.post(`${BASE_URL}/transactions`, {
          title: 'Test Transaction',
          amount: 100,
          category: 'Food',
          type: 'expense',
          date: '2024-01-01'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Create transaction success:', createResponse.data);
      } catch (error) {
        console.log(`❌ Create transaction failed: ${error.response?.status}`);
        console.log('Error data:', error.response?.data);
      }
    }
  } catch (error) {
    console.log(`❌ Signup failed: ${error.response?.status} - ${error.response?.data?.message}`);
  }
}

testAPI();
import axios from 'axios';

const API_BASE_URL = 'https://hisabkitab-backend-tjik.onrender.com/api';

async function testBackend() {
  console.log('🧪 Testing backend endpoints...\n');

  // Test 1: Check if backend is responding
  try {
    const response = await axios.get(`${API_BASE_URL}/`);
    console.log('✅ Backend is responding');
  } catch (error) {
    console.log('❌ Backend root endpoint failed:', error.response?.status || error.message);
  }

  // Test 2: Try to signup a test user
  try {
    const signupData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };
    
    console.log('\n📝 Testing signup with:', signupData);
    const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, signupData);
    console.log('✅ Signup successful');
    
    const token = signupResponse.data.token;
    console.log('🔑 Got token:', token ? 'Yes' : 'No');

    // Test 3: Try to create a category with the token
    if (token) {
      const categoryData = {
        name: 'Test Category',
        type: 'expense'
      };
      
      console.log('\n📂 Testing category creation with:', categoryData);
      
      try {
        const categoryResponse = await axios.post(`${API_BASE_URL}/categories`, categoryData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Category creation successful');
        console.log('📄 Response:', categoryResponse.data);
      } catch (catError) {
        console.log('❌ Category creation failed');
        console.log('Status:', catError.response?.status);
        console.log('Error:', catError.response?.data);
      }
    }

  } catch (error) {
    console.log('❌ Signup failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
}

testBackend();
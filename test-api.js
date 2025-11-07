// Simple API test script
// Run with: node test-api.js

import axios from 'axios';

const API_BASE_URL = 'https://hisabkitab-backend-tjik.onrender.com/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health/status endpoint
    console.log('1. Testing API health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`).catch(() => null);
    if (healthResponse) {
      console.log('✅ API is reachable');
    } else {
      console.log('❌ API health check failed, trying auth endpoint...');
    }

    // Test different auth endpoint structures
    console.log('\n2. Testing auth endpoints structure...');
    const authPaths = ['/auth/login', '/login', '/api/auth/login', '/users/login'];
    
    for (const path of authPaths) {
      try {
        await axios.post(`${API_BASE_URL}${path}`, {
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      } catch (error) {
        if (error.response) {
          console.log(`✅ Found auth endpoint: ${path} (Status: ${error.response.status})`);
          console.log(`   Response: ${error.response.data?.message || 'No message'}`);
          break;
        }
      }
    }

    // Test different categories endpoint structures
    console.log('\n3. Testing categories endpoint...');
    const categoryPaths = ['/categories', '/api/categories', '/category'];
    
    for (const path of categoryPaths) {
      try {
        await axios.get(`${API_BASE_URL}${path}`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`✅ Found categories endpoint: ${path} (requires auth)`);
          break;
        } else if (error.response?.status !== 404) {
          console.log(`✅ Found categories endpoint: ${path} (Status: ${error.response?.status})`);
          break;
        }
      }
    }

    // Test different transactions endpoint structures
    console.log('\n4. Testing transactions endpoint...');
    const transactionPaths = ['/transactions', '/api/transactions', '/transaction'];
    
    for (const path of transactionPaths) {
      try {
        await axios.get(`${API_BASE_URL}${path}`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`✅ Found transactions endpoint: ${path} (requires auth)`);
          break;
        } else if (error.response?.status !== 404) {
          console.log(`✅ Found transactions endpoint: ${path} (Status: ${error.response?.status})`);
          break;
        }
      }
    }

  } catch (error) {
    console.log('❌ General API test failed:', error.message);
  }

  console.log('\n🏁 API test completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm start');
  console.log('   2. Test login/signup in the app');
  console.log('   3. Check browser console for any errors');
}

testAPI();
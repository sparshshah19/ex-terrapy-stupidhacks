// Simple test for the API endpoint
const testAPI = async () => {
  try {
    console.log('🧪 Testing /api/respond endpoint...');
    
    const response = await fetch('http://localhost:3000/api/respond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'therapy',
        inputText: 'I feel anxious about my presentation',
        consent: true,
        safeMode: true
      }),
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testAPI();
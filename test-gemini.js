// Test script for Gemini API
async function testGeminiAPI() {
  try {
    console.log('🧪 Testing Gemini API endpoint...')
    
    const response = await fetch('http://localhost:3000/api/respond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'therapy',
        inputText: 'Hello, this is a test message',
        consent: true,
        safeMode: true
      }),
    });

    console.log(`📈 Status: ${response.status}`);
    const data = await response.json();
    console.log('📥 Response:', JSON.stringify(data, null, 2));
    
    if (data.provider === 'gemini') {
      console.log('✅ Successfully using Gemini API!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGeminiAPI();
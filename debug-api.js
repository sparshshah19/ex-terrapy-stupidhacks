// Debug test for the API
async function testAPI() {
  try {
    console.log('Testing API...')
    const response = await fetch('http://localhost:3002/api/respond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'therapy',
        inputText: 'Hello, this is a test',
        consent: true,
        safeMode: true
      })
    })
    
    console.log('Response status:', response.status)
    const data = await response.json()
    console.log('Response data:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('API test failed:', error)
  }
}

testAPI();
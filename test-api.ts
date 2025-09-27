// Test script for the /api/respond endpoint
// Run with: npx tsx test-api.ts

const API_URL = 'http://localhost:3001/api/respond';

interface TestCase {
  name: string;
  payload: {
    mode: 'therapy' | 'blunt' | 'closure';
    inputText: string;
    consent: boolean;
    safeMode?: boolean;
  };
  expectError?: boolean;
}

const testCases: TestCase[] = [
  {
    name: 'Therapy mode - normal input',
    payload: {
      mode: 'therapy',
      inputText: 'I feel really anxious about my job interview tomorrow.',
      consent: true,
      safeMode: true
    }
  },
  {
    name: 'Blunt mode - relationship advice',
    payload: {
      mode: 'blunt',
      inputText: 'Should I text my ex who hasn\'t replied in 3 days?',
      consent: true
    }
  },
  {
    name: 'Closure mode - processing breakup',
    payload: {
      mode: 'closure',
      inputText: 'We broke up without any explanation and I keep wondering what went wrong.',
      consent: true
    }
  },
  {
    name: 'No consent - should fail',
    payload: {
      mode: 'therapy',
      inputText: 'Help me with anxiety',
      consent: false
    },
    expectError: true
  },
  {
    name: 'Empty input - should fail',
    payload: {
      mode: 'therapy',
      inputText: '',
      consent: true
    },
    expectError: true
  },
  {
    name: 'Crisis keywords - should trigger safety response',
    payload: {
      mode: 'therapy',
      inputText: 'I want to hurt myself and end it all',
      consent: true
    }
  }
];

async function testAPI() {
  console.log('🧪 Testing /api/respond endpoint...\n');

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log('📤 Payload:', JSON.stringify(testCase.payload, null, 2));

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload),
      });

      const data = await response.json();
      
      console.log(`📈 Status: ${response.status}`);
      console.log('📥 Response:', JSON.stringify(data, null, 2));

      if (testCase.expectError && response.ok) {
        console.log('❌ Expected error but got success');
      } else if (!testCase.expectError && !response.ok) {
        console.log('❌ Expected success but got error');
      } else {
        console.log('✅ Test passed');
      }

    } catch (error) {
      console.log('❌ Request failed:', error);
    }

    console.log('─'.repeat(50));
  }
}

// Run the tests
testAPI().catch(console.error);
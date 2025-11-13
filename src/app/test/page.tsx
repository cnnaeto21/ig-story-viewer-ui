'use client';

import { api } from '../../lib/api';
import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState('');

  const testLogin = async () => {
    try {
      const response = await api.login({
        igUsername: 'banneryear2024',
        igPassword: 'YOUR_PASSWORD',
      });
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">API Test</h1>
      <button
        onClick={testLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Test Login
      </button>
      <pre className="mt-4 p-4 bg-gray-100 rounded">
        {result}
      </pre>
    </div>
  );
}
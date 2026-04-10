#!/usr/bin/env node
/**
 * Test MiniMax API response format
 * Run: MINIMAX_API_KEY=your_key node test-minimax.mjs
 */

const API_KEY = process.env.MINIMAX_API_KEY;
const BASE_URL = 'https://api.minimax.chat/v1';
const MODEL = 'MiniMax-M2.5';

async function chat(messages) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      temperature: 0.3
    })
  });

  const data = await response.json();
  return data;
}

async function test1() {
  console.log('\n=== Test 1: Simple JSON output request ===');
  const messages = [
    { role: 'user', content: 'Say hello and return JSON with format: {"greeting": "hello"}' }
  ];
  const result = await chat(messages);
  console.log('Response:', JSON.stringify(result, null, 2));
  console.log('\n--- Content field: ---');
  console.log(result.choices[0].message.content);
}

async function test2() {
  console.log('\n=== Test 2: With think tags ===');
  const messages = [
    { role: 'user', content: 'What is 2+2? Return JSON: {"answer": number}' }
  ];
  const result = await chat(messages);
  console.log('Response:', JSON.stringify(result, null, 2));
}

async function test3() {
  console.log('\n=== Test 3: Navigator-like prompt (strict JSON) ===');
  const messages = [
    { role: 'system', content: 'You are a web navigation agent. ALWAYS respond in JSON format only, no other text.' },
    { role: 'user', content: 'Navigate to https://example.com. Return JSON: {"action": [{"jump_to_url": "https://example.com"}], "current_state": {"next_goal": "done"}, "web_task": true}' }
  ];
  const result = await chat(messages);
  console.log('Response:', JSON.stringify(result, null, 2));
}

async function test4() {
  console.log('\n=== Test 4: Force JSON with example ===');
  const messages = [
    { role: 'user', content: `You must respond ONLY with valid JSON. Example format:
{"action": [{"jump_to_url": "https://example.com"}], "web_task": true}

Task: Navigate to https://example.com
Respond now:` }
  ];
  const result = await chat(messages);
  console.log('Response:', JSON.stringify(result, null, 2));
  console.log('\n--- Content field: ---');
  console.log(result.choices[0].message.content);
}

async function main() {
  if (!API_KEY) {
    console.log('Please set MINIMAX_API_KEY environment variable');
    console.log('Example: MINIMAX_API_KEY=your_key node test-minimax.mjs');
    process.exit(1);
  }

  await test1();
  await test2();
  await test3();
  await test4();
}

main().catch(console.error);
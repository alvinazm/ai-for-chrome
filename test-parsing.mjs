#!/usr/bin/env node
/**
 * Test the actual parsing logic
 */

// Simulate the removeThinkTags function
function removeThinkTags(text) {
  const thinkRegex = /<think>[\s\S]*?<\/think>/g;
  let result = text.replace(thinkRegex, '');

  const strayCloseTagRegex = /[\s\S]*?<\/think>/g;
  result = result.replace(strayCloseTagRegex, '');

  return result.trim();
}

// Simulate the extractJsonFromModelOutput function
function extractJsonFromModelOutput(content) {
  let processedContent = content;
  
  // Handle code blocks
  if (processedContent.includes('```')) {
    const parts = processedContent.split('```');
    processedContent = parts[1];
    if (processedContent.startsWith('json')) {
      processedContent = processedContent.substring(4).trim();
    }
  }
  
  return JSON.parse(processedContent);
}

// Test with MiniMax response format
const testCases = [
  {
    name: 'Test 1: With code block',
    input: "<think>The user wants me to say hello\n\nHere's the JSON:\n```json\n{\"greeting\": \"hello\"}\n```\n\nHello! Here's the JSON you requested:\n\n```json\n{\"greeting\": \"hello\"}\n```",
  },
  {
    name: 'Test 2: Simple JSON after think',
    input: "<think>Thinking about the answer...\n\n\n{\"answer\": 4}",
  },
  {
    name: 'Test 3: Navigator output (real format)',
    input: "<think>The user wants me to navigate to a URL and return a specific JSON format. I need to use the browser tool to navigate to the URL, then return the JSON response as specified.\n\nLet me use the browser tool to navigate to https://example.com first.\n\n{\"action\": [{\"jump_to_url\": \"https://example.com\"}], \"current_state\": {\"next_goal\": \"done\"}, \"web_task\": true}",
  },
  {
    name: 'Test 4: With markdown code block wrapper',
    input: "<think>Thinking...\n\n\n```json\n{\"action\": [{\"jump_to_url\": \"https://example.com\"}], \"web_task\": true}\n```",
  }
];

console.log('Testing parsing logic:\n');

for (const tc of testCases) {
  console.log(`=== ${tc.name} ===`);
  console.log('Input:', tc.input.substring(0, 100) + '...');
  
  try {
    const cleaned = removeThinkTags(tc.input);
    console.log('After removeThinkTags:', cleaned.substring(0, 100) + '...');
    
    const parsed = extractJsonFromModelOutput(cleaned);
    console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
    console.log('SUCCESS!\n');
  } catch (e) {
    console.log('FAILED:', e.message, '\n');
  }
}
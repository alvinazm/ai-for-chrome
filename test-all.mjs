#!/usr/bin/env node
/**
 * Final test with all cases
 */

function removeThinkTags(text) {
  if (!text) return '';
  
  const THINK_OPEN_TAG = '<think>';
  const THINK_CLOSE_TAG = '';  // Empty string works!
  const TOOL_CALL_OPEN_TAG = '<tool_call>';
  const TOOL_CALL_CLOSE_TAG = '</tool_call>';
  
  let buffer = text;
  let result = '';
  let mode = 'text';
  
  while (buffer) {
    if (mode === 'thinking') {
      const tagIndex = buffer.indexOf(THINK_CLOSE_TAG);
      if (tagIndex >= 0) {
        buffer = buffer.slice(tagIndex + THINK_CLOSE_TAG.length);
        mode = 'text';
        continue;
      } else {
        const nextNewline = buffer.indexOf('\n');
        const nextOpenBrace = buffer.indexOf('{');
        
        if (nextOpenBrace >= 0 && (nextNewline === -1 || nextOpenBrace < nextNewline)) {
          result += buffer;
          break;
        } else if (nextNewline >= 0) {
          buffer = buffer.slice(nextNewline + 1);
          continue;
        } else {
          break;
        }
      }
    } else if (mode === 'tool_call') {
      const tagIndex = buffer.indexOf(TOOL_CALL_CLOSE_TAG);
      if (tagIndex >= 0) {
        const toolCallContent = buffer.slice(0, tagIndex);
        result += toolCallContent;
        buffer = buffer.slice(tagIndex + TOOL_CALL_CLOSE_TAG.length);
        mode = 'text';
        continue;
      } else {
        return result.trim();
      }
    } else {
      const thinkIndex = buffer.indexOf(THINK_OPEN_TAG);
      const toolCallIndex = buffer.indexOf(TOOL_CALL_OPEN_TAG);
      
      let tagIndex = -1;
      let nextMode = 'text';
      let nextTagLength = 0;
      
      if (thinkIndex >= 0 && (toolCallIndex < 0 || thinkIndex <= toolCallIndex)) {
        result += buffer.slice(0, thinkIndex);
        tagIndex = thinkIndex;
        nextMode = 'thinking';
        nextTagLength = THINK_OPEN_TAG.length;
      } else if (toolCallIndex >= 0) {
        result += buffer.slice(0, toolCallIndex);
        tagIndex = toolCallIndex;
        nextMode = 'tool_call';
        nextTagLength = TOOL_CALL_OPEN_TAG.length;
      } else {
        result += buffer;
        break;
      }
      
      buffer = buffer.slice(tagIndex + nextTagLength);
      mode = nextMode;
    }
  }
  
  return result.trim();
}

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
  
  // Handle <tool_call> format
  if (processedContent.includes('<tool_call>')) {
    const startTag = '<tool_call>';
    const endTag = '</tool_call>';
    const startIndex = processedContent.indexOf(startTag) + startTag.length;
    let endIndex = processedContent.indexOf(endTag);

    if (endIndex === -1) {
      endIndex = processedContent.length;
    }

    processedContent = processedContent.substring(startIndex, endIndex).trim();

    try {
      return JSON.parse(processedContent);
    } catch {
      const toolNameMatch = processedContent.match(/<tool name="([^"]+)">/);
      const paramMatch = processedContent.match(/<\/tool>/);

      if (toolNameMatch && paramMatch) {
        try {
          return JSON.parse(paramMatch[1]);
        } catch {
          return { action: paramMatch[1], tool: toolNameMatch[1] };
        }
      }
    }
  }
  
  return JSON.parse(processedContent);
}

// Test cases
const testCases = [
  {
    name: 'Test 1: MiniMax tool_call only',
    input: `<tool_call>{"action":[],"current_state":{}}</tool_call>`,
  },
  {
    name: 'Test 2: Think without close tag + JSON',
    input: `<think>The user wants me to navigate.

{"action":[{"jump_to_url":"https://example.com"}],"web_task":true}`,
  },
  {
    name: 'Test 3: Think + tool_call',
    input: `<think>Thinking...

<tool_call>{"action":[{"jump_to_url":"https://example.com"}],"web_task":true}</tool_call>`,
  },
  {
    name: 'Test 4: Plain JSON',
    input: `{"action":[{"jump_to_url":"https://example.com"}],"web_task":true}`,
  },
];

console.log('Testing all cases:\n');

for (const tc of testCases) {
  console.log(`=== ${tc.name} ===`);
  
  try {
    const cleaned = removeThinkTags(tc.input);
    console.log('Cleaned:', cleaned.substring(0, 60));
    
    const parsed = extractJsonFromModelOutput(cleaned);
    console.log('Parsed:', JSON.stringify(parsed).substring(0, 60));
    console.log('SUCCESS!\n');
  } catch (e) {
    console.log('FAILED:', e.message, '\n');
  }
}
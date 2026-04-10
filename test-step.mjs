#!/usr/bin/env node
/**
 * Debug removeThinkTags step by step
 */

function removeThinkTags(text) {
  if (!text) return '';
  
  const THINK_OPEN_TAG = '<think>';
  const THINK_CLOSE_TAG = '</think>';
  const TOOL_CALL_OPEN_TAG = '<tool_call>';
  const TOOL_CALL_CLOSE_TAG = '</tool_call>';
  
  let buffer = text;
  let result = '';
  let mode = 'text';
  let step = 0;
  
  console.log('Input:', text.substring(0, 50), '...\n');
  
  while (buffer && step < 20) {
    step++;
    console.log(`\n--- Step ${step} ---`);
    console.log('mode:', mode, 'buffer.length:', buffer.length);
    
    if (mode === 'thinking') {
      const tagIndex = buffer.indexOf(THINK_CLOSE_TAG);
      console.log('Looking for close tag, index:', tagIndex);
      if (tagIndex >= 0) {
        buffer = buffer.slice(tagIndex + THINK_CLOSE_TAG.length);
        mode = 'text';
        console.log('Found close tag, switching to text mode');
        continue;
      } else {
        console.log('No close tag found, returning result');
        return result.trim();
      }
    } else if (mode === 'tool_call') {
      const tagIndex = buffer.indexOf(TOOL_CALL_CLOSE_TAG);
      console.log('Looking for tool_call close tag, index:', tagIndex);
      if (tagIndex >= 0) {
        buffer = buffer.slice(tagIndex + TOOL_CALL_CLOSE_TAG.length);
        mode = 'text';
        console.log('Found tool_call close tag, switching to text mode');
        continue;
      } else {
        console.log('No close tag found, returning result');
        return result.trim();
      }
    } else {
      const thinkIndex = buffer.indexOf(THINK_OPEN_TAG);
      const toolCallIndex = buffer.indexOf(TOOL_CALL_OPEN_TAG);
      
      console.log('thinkIndex:', thinkIndex, 'toolCallIndex:', toolCallIndex);
      
      let tagIndex = -1;
      let nextMode = 'text';
      let nextTagLength = 0;
      
      if (thinkIndex >= 0 && (toolCallIndex < 0 || thinkIndex <= toolCallIndex)) {
        result += buffer.slice(0, thinkIndex);
        tagIndex = thinkIndex;
        nextMode = 'thinking';
        nextTagLength = THINK_OPEN_TAG.length;
        console.log('Found think tag at', tagIndex, 'switching to thinking mode');
      } else if (toolCallIndex >= 0) {
        result += buffer.slice(0, toolCallIndex);
        tagIndex = toolCallIndex;
        nextMode = 'tool_call';
        nextTagLength = TOOL_CALL_OPEN_TAG.length;
        console.log('Found tool_call at', tagIndex, 'switching to tool_call mode');
      } else {
        result += buffer;
        console.log('No more tags, adding remaining buffer');
        break;
      }
      
      buffer = buffer.slice(tagIndex + nextTagLength);
      mode = nextMode;
    }
  }
  
  console.log('\nResult:', result.substring(0, 50), '...');
  return result.trim();
}

// Test 1
const input1 = `<tool_call>{"action":[]}</tool_call>`;
console.log('\n========== Test 1: tool_call only ==========');
const r1 = removeThinkTags(input1);
console.log('Final result:', r1);

// Test 2
const input2 = `<think>think</think>{"action":[]}`;
console.log('\n========== Test 2: think only ==========');
const r2 = removeThinkTags(input2);
console.log('Final result:', r2);

// Test 3 - what miniMax actually returns
const input3 = `<think>think content here
think content
</think>
<tool_call>{"action":[]}</tool_call>`;
console.log('\n========== Test 3: think + tool_call ==========');
const r3 = removeThinkTags(input3);
console.log('Final result:', r3);
#!/usr/bin/env node
/**
 * Debug Test 2
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
  
  console.log('Input:', text);
  console.log('---');
  
  while (buffer) {
    if (mode === 'thinking') {
      const tagIndex = buffer.indexOf(THINK_CLOSE_TAG);
      console.log('In thinking mode, looking for', THINK_CLOSE_TAG, 'index:', tagIndex);
      if (tagIndex >= 0) {
        buffer = buffer.slice(tagIndex + THINK_CLOSE_TAG.length);
        console.log('Found, remaining buffer:', buffer);
        mode = 'text';
        continue;
      } else {
        console.log('No close tag found');
        return result.trim();
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
      
      console.log('In text mode, thinkIndex:', thinkIndex, 'toolCallIndex:', toolCallIndex);
      
      let tagIndex = -1;
      let nextMode = 'text';
      let nextTagLength = 0;
      
      if (thinkIndex >= 0 && (toolCallIndex < 0 || thinkIndex <= toolCallIndex)) {
        result += buffer.slice(0, thinkIndex);
        console.log('Added text before think:', result);
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
        console.log('No more tags, added remaining');
        break;
      }
      
      buffer = buffer.slice(tagIndex + nextTagLength);
      mode = nextMode;
      console.log('Switched to', mode, 'mode, remaining buffer:', buffer.substring(0, 50));
    }
  }
  
  return result.trim();
}

// Test 2 - think + JSON without tool_call tags
const input = `<think>The user wants me to navigate to a URL.

{"action":[{"jump_to_url":"https://example.com"}],"web_task":true}`;

const result = removeThinkTags(input);
console.log('\n=== Result ===');
console.log(result);
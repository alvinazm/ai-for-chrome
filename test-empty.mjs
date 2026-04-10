#!/usr/bin/env node
/**
 * Test with the FINAL fix
 */

function removeThinkTags(text) {
  if (!text) return '';
  
  const THINK_OPEN_TAG = '<think>';
  const THINK_CLOSE_TAG = '';  // Empty string causes issues!
  const TOOL_CALL_OPEN_TAG = '<tool_call>';
  const TOOL_CALL_CLOSE_TAG = '</tool_call>';
  
  let buffer = text;
  let result = '';
  let mode = 'text';
  
  while (buffer) {
    if (mode === 'thinking') {
      // With empty close tag, this causes issues!
      const tagIndex = buffer.indexOf(THINK_CLOSE_TAG);
      console.log('In thinking mode, indexOf empty string:', tagIndex);
      if (tagIndex >= 0) {
        buffer = buffer.slice(tagIndex + THINK_CLOSE_TAG.length);
        mode = 'text';
        continue;
      } else {
        // Handle missing close tag
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

// Test case: think without close tag
const input = `<think>The user wants me to navigate to a URL.

{"action":[{"jump_to_url":"https://example.com"}],"web_task":true}`;

console.log('Input:', input.substring(0, 80));
console.log('---\n');
const result = removeThinkTags(input);
console.log('\n=== Result ===');
console.log(result);
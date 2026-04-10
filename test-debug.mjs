#!/usr/bin/env node
/**
 * Test removeThinkTags more carefully
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
  
  console.log('[removeThinkTags] Input:', text.length, 'chars');
  
  while (buffer) {
    if (mode === 'thinking') {
      const tagIndex = buffer.indexOf(THINK_CLOSE_TAG);
      if (tagIndex >= 0) {
        console.log('[removeThinkTags] Found close tag at', tagIndex);
        buffer = buffer.slice(tagIndex + THINK_CLOSE_TAG.length);
        mode = 'text';
        continue;
      } else {
        console.log('[removeThinkTags] No close tag found, returning current result');
        return result.trim();
      }
    } else {
      const thinkIndex = buffer.indexOf(THINK_OPEN_TAG);
      const toolCallIndex = buffer.indexOf(TOOL_CALL_OPEN_TAG);
      
      console.log('[removeThinkTags] thinkIndex:', thinkIndex, 'toolCallIndex:', toolCallIndex);
      
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
      console.log('[removeThinkTags] mode changed to:', mode, 'buffer length:', buffer.length);
    }
  }
  
  console.log('[removeThinkTags] Final result:', result.length, 'chars');
  return result.trim();
}

// Test
const input = `<tool_call>{"action":[{"click_element":{"index":25}},{"click_element":{"index":28}}],"current_state":{"evaluation_previous_goal":"Success - ","memory":"","next_goal":""}}</tool_call>`;

console.log('=== Test ===\n');
const result = removeThinkTags(input);
console.log('\n=== Result ===');
console.log(result);
console.log('\n=== Length:', result.length, '===');
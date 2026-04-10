#!/usr/bin/env node
/**
 * Test removeThinkTags with think + tool_call
 */

function removeThinkTags(text) {
  if (!text) return '';
  
  const THINK_OPEN_TAG = '<think>';
  const THINK_CLOSE_TAG = '';
  const TOOL_CALL_OPEN_TAG = '<tool_call>';
  const TOOL_CALL_CLOSE_TAG = '</tool_call>';
  
  let buffer = text;
  let result = '';
  let mode = 'text';
  
  console.log('Input:', text.substring(0, 80));
  
  while (buffer) {
    if (mode === 'thinking') {
      console.log('Mode: thinking, buffer:', buffer.substring(0, 50));
      const tagIndex = buffer.indexOf(THINK_CLOSE_TAG);
      console.log('  indexOf empty string:', tagIndex);
      if (tagIndex >= 0) {
        buffer = buffer.slice(tagIndex);
        mode = 'text';
        continue;
      } else {
        const nextNewline = buffer.indexOf('\n');
        const nextOpenBrace = buffer.indexOf('{');
        console.log('  nextNewline:', nextNewline, 'nextOpenBrace:', nextOpenBrace);
        
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
      console.log('Mode: tool_call, buffer:', buffer.substring(0, 50));
      const tagIndex = buffer.indexOf(TOOL_CALL_CLOSE_TAG);
      console.log('  indexOf </tool_call>:', tagIndex);
      if (tagIndex >= 0) {
        const toolCallContent = buffer.slice(0, tagIndex);
        console.log('  Extracting:', toolCallContent.substring(0, 50));
        result += toolCallContent;
        buffer = buffer.slice(tagIndex + TOOL_CALL_CLOSE_TAG.length);
        mode = 'text';
        continue;
      } else {
        return result.trim();
      }
    } else {
      console.log('Mode: text, buffer:', buffer.substring(0, 50));
      const thinkIndex = buffer.indexOf(THINK_OPEN_TAG);
      const toolCallIndex = buffer.indexOf(TOOL_CALL_OPEN_TAG);
      console.log('  thinkIndex:', thinkIndex, 'toolCallIndex:', toolCallIndex);
      
      let tagIndex = -1;
      let nextMode = 'text';
      let nextTagLength = 0;
      
      if (thinkIndex >= 0 && (toolCallIndex < 0 || thinkIndex <= toolCallIndex)) {
        result += buffer.slice(0, thinkIndex);
        tagIndex = thinkIndex;
        nextMode = 'thinking';
        nextTagLength = THINK_OPEN_TAG.length;
        console.log('  Found think at', tagIndex, ', switch to thinking');
      } else if (toolCallIndex >= 0) {
        result += buffer.slice(0, toolCallIndex);
        tagIndex = toolCallIndex;
        nextMode = 'tool_call';
        nextTagLength = TOOL_CALL_OPEN_TAG.length;
        console.log('  Found tool_call at', tagIndex, ', switch to tool_call');
      } else {
        result += buffer;
        console.log('  No more tags, add remaining');
        break;
      }
      
      buffer = buffer.slice(tagIndex + nextTagLength);
      mode = nextMode;
    }
  }
  
  return result.trim();
}

// Test case: think + tool_call
const input = `<think>Thinking...

Here is the result:

<tool_call>{"action":[{"jump_to_url":"https://example.com"}],"web_task":true}</tool_call>`;

const result = removeThinkTags(input);
console.log('\n=== Result ===');
console.log(result);
console.log('\n=== Length:', result.length, '===');
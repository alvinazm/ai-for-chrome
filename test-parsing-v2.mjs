#!/usr/bin/env node
/**
 * Test removeThinkTags and extractJsonFromModelOutput functions
 */

// Copy the removeThinkTags function
function removeThinkTags(text) {
  if (!text) return '';
  
  const THINK_OPEN_TAG = '<think>';
  const THINK_CLOSE_TAG = '</think>';
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

// Copy the extractJsonFromModelOutput function (simplified)
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
  
  // Handle <tool_call> format - MiniMax format
  if (processedContent.includes('<tool_call>')) {
    const startTag = '<tool_call>';
    const endTag = '</tool_call>';
    const startIndex = processedContent.indexOf(startTag) + startTag.length;
    let endIndex = processedContent.indexOf(endTag);

    if (endIndex === -1) {
      endIndex = processedContent.length;
    }

    processedContent = processedContent.substring(startIndex, endIndex).trim();

    // Try to parse as JSON directly first
    try {
      return JSON.parse(processedContent);
    } catch {
      // If not valid JSON, try to find tool name and parameters
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
    name: 'Test 1: MiniMax real format (from earlier debug)',
    input: `<tool_call>{"action":[{"click_element":{"index":25}},{"click_element":{"index":28}}],"current_state":{"evaluation_previous_goal":"Success - 当前页面显示有未发布的视频,需要先处理。点击了"放弃"按钮来丢弃之前的视频,现在需要点击上传视频按钮来上传新视频。","memory":"任务步骤:1.丢弃之前的未发布视频 2.点击上传视频按钮 3.上传视频文件/Users/azm/Downloads/xhs智能总结.mp4。当前第1步已完成,正��执行第2步。","next_goal":"点击上传视频按钮后,需要上传视频文件/Users/azm/Downloads/xhs智能总结.mp4"}}</tool_call>`,
  },
  {
    name: 'Test 2: With think tags',
    input: `<think>The user wants me to navigate to a URL and return a specific JSON format.

{"action":[{"jump_to_url":"https://example.com"}],"web_task":true}`,
  },
  {
    name: 'Test 3: Think tag + tool_call',
    input: `<think>Thinking...

Here is the result:

<tool_call>{"action":[{"jump_to_url":"https://example.com"}],"web_task":true}</tool_call>`,
  },
  {
    name: 'Test 4: Multiple think sections',
    input: `<think>First thought process...

<think>Nested thought...

<tool_call>{"action":[{"jump_to_url":"https://example.com"}],"web_task":true}</tool_call>`,
  },
  {
    name: 'Test 5: Plain JSON',
    input: `{"action":[{"jump_to_url":"https://example.com"}],"web_task":true}`,
  },
  {
    name: 'Test 6: With code block',
    input: `\`\`\`json
{"action":[{"jump_to_url":"https://example.com"}],"web_task":true}
\`\`\``,
  },
];

console.log('Testing parsing functions:\n');

for (const tc of testCases) {
  console.log(`=== ${tc.name} ===`);
  console.log('Input:', tc.input.substring(0, 100) + (tc.input.length > 100 ? '...' : ''));
  
  try {
    // Step 1: Remove think tags
    const cleaned = removeThinkTags(tc.input);
    console.log('After removeThinkTags:', cleaned.substring(0, 100) + (cleaned.length > 100 ? '...' : ''));
    
    // Step 2: Extract JSON
    const parsed = extractJsonFromModelOutput(cleaned);
    console.log('Parsed:', JSON.stringify(parsed, null, 2).substring(0, 200));
    console.log('SUCCESS!\n');
  } catch (e) {
    console.log('FAILED:', e.message, '\n');
  }
}
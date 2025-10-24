async function summarizeWithChatGPT(content, instructions = '') {
  console.log('Summarizing content with ChatGPT');

  const apiKey = process.env.CHATGPT_API_KEY;
  
  if (!apiKey) {
    throw new Error('ChatGPT API key is required');
  }

  try {
    console.log('Calling OpenAI API for summarization');

    // Build the user prompt based on whether instructions are provided
    let userPrompt = 'Please provide a comprehensive but concise summary of the following content. Focus on the main points, key insights, and important details';
    
    if (instructions && instructions.trim()) {
      userPrompt += `\n\nAdditional instructions: ${instructions.trim()}`;
    }
    
    userPrompt += `:\n\n${content}`;

    // OpenAI API endpoint
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that creates concise, well-structured summaries. Your summaries should capture the main points and key insights while being clear and easy to understand. Follow any additional instructions provided by the user.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const result = await response.json();
    
    if (result.choices && result.choices[0] && result.choices[0].message) {
      return {
        success: true,
        summary: result.choices[0].message.content.trim(),
        usage: result.usage
      };
    } else {
      throw new Error('No summary generated from ChatGPT');
    }

  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    throw error;
  }
}

// Helper function for consistent CORS headers
function getCorsHeaders(event) {
  const origin = event?.headers?.origin || 
                 event?.headers?.Origin || 
                 'http://localhost:3100';
  
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Allow-Credentials': 'true'
  };
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if ((event.httpMethod || event.requestContext?.http?.method) === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return {
      statusCode: 200,
      headers: {
        ...getCorsHeaders(event),
        'Access-Control-Max-Age': '3600'
      },
      body: ''
    };
  }

  // Check if the request method is POST
  const httpMethod = event.httpMethod || event.requestContext?.http?.method;
  
  if (httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: getCorsHeaders(event),
      body: JSON.stringify({
        error: 'Method not allowed. Please use POST.'
      })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    
    // Validate required fields
    const { content, instructions } = body;
    
    if (!content) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(event),
        body: JSON.stringify({
          error: 'Missing required field: content'
        })
      };
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(event),
        body: JSON.stringify({
          error: 'Content must be a non-empty string'
        })
      };
    }

    if (content.length > 10000) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(event),
        body: JSON.stringify({
          error: 'Content too long. Maximum 10,000 characters allowed.'
        })
      };
    }

    // Generate summary using ChatGPT
    const result = await summarizeWithChatGPT(content.trim(), instructions);

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify({
        success: true,
        summary: result.summary,
        usage: result.usage,
        originalLength: content.length,
        summaryLength: result.summary.length
      })
    };

  } catch (error) {
    console.error('Error in summarize handler:', error);
    
    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({
        error: 'Failed to generate summary',
        details: error.message
      })
    };
  }
};
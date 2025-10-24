async function sendEmail(to, subject, textContent, htmlContent, fromEmail = null, fromName = null) {
  console.log('Sending email via SendGrid');

  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    throw new Error('SendGrid API key is required');
  }

  try {
    console.log('Trying to send email via SendGrid');

    // SendGrid API v3 endpoint
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email: to,
                name: to.split('@')[0] // Use email prefix as name if not provided
              }
            ]
          }
        ],
        from: {
          email: fromEmail || 'noreply@yourdomain.com',
          name: fromName || 'Your App'
        },
        subject: subject,
        content: [
          {
            type: 'text/plain',
            value: textContent
          },
          {
            type: 'text/html',
            value: htmlContent
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('SendGrid API Error:', errorData);
      throw new Error(`SendGrid API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    // SendGrid returns 202 status code for successful acceptance
    if (response.status === 202) {
      // SendGrid doesn't return JSON data on success, just empty body
      const messageId = response.headers.get('x-message-id') || `sendgrid-${Date.now()}`;
      return {
        success: true,
        messageId: messageId,
        provider: 'SendGrid'
      };
    } else {
      throw new Error(`Email sending failed with status: ${response.status}`);
    }

  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    throw error;
  }
}

// Helper function for consistent CORS headers
function getCorsHeaders(event) {
  // Get the origin from the request headers or use a default
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
    const { to, subject, message } = body;
    
    if (!to) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(event),
        body: JSON.stringify({
          error: 'Missing required field: to (recipient email)'
        })
      };
    }

    if (!subject) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(event),
        body: JSON.stringify({
          error: 'Missing required field: subject'
        })
      };
    }

    if (!message) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(event),
        body: JSON.stringify({
          error: 'Missing required field: message'
        })
      };
    }

    // Send email using SendGrid
    const result = await sendEmail(
      to,
      subject,
      message, // text content
      message.replace(/\n/g, '<br>'), // simple HTML conversion
      body.fromEmail,
      body.fromName
    );

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully via SendGrid',
        messageId: result.messageId,
        provider: result.provider,
        to: to,
        subject: subject
      })
    };

  } catch (error) {
    console.error('Error in email handler:', error);
    
    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({
        error: 'Failed to send email',
        details: error.message
      })
    };
  }
};
// api/index.js - CommonJS version
const fetch = require('node-fetch'); // Add to package.json dependencies

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  // Extract username from query parameters
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ 
      error: 'Username or email is required',
      usage: `Use: ${req.headers.host}/?username=your_username_or_email`,
      example: `${req.headers.host}/?username=john_doe`
    });
  }

  try {
    console.log(`🔄 Processing reset request for: ${username}`);

    // Generate fresh session data to avoid cookie issues
    const sessionData = generateSessionData();
    
    // Instagram's password reset endpoint
    const resetUrl = 'https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/';
    
    // Mimic real browser headers
    const headers = {
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.instagram.com',
      'Referer': 'https://www.instagram.com/accounts/password/reset/',
      'Sec-Ch-Ua': '"Not)A;Brand";v="24", "Chromium";v="122", "Google Chrome";v="122"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'X-Asbd-Id': '129477',
      'X-Csrftoken': sessionData.csrfToken,
      'X-Ig-App-Id': '936619743392459',
      'X-Ig-Www-Claim': sessionData.wwwClaim,
      'X-Instagram-Ajax': sessionData.ajaxId,
      'X-Requested-With': 'XMLHttpRequest'
    };

    // Prepare form data
    const formData = new URLSearchParams({
      'email_or_username': username.trim(),
      'recaptcha_challenge_field': ''
    });

    // Make request to Instagram with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(resetUrl, {
      method: 'POST',
      headers: headers,
      body: formData.toString(),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw_response: responseText.substring(0, 500) };
    }

    console.log(`📊 Instagram Response: ${response.status}`, responseData);

    if (response.ok || response.status === 200) {
      return res.status(200).json({
        success: true,
        message: `✅ Password reset email sent successfully for "${username}"`,
        status: response.status,
        data: responseData,
        instructions: '📧 Check the email associated with this Instagram account',
        note: 'If no email received, check spam folder or verify the username/email is correct'
      });
    } 
    else if (response.status >= 400 && response.status < 500) {
      return res.status(200).json({
        success: false,
        message: `❌ Failed to send reset for "${username}"`,
        error: 'User not found or invalid request',
        status: response.status,
        details: responseData,
        suggestions: [
          'Verify the username/email is correct',
          'Check if the account exists',
          'Try using email instead of username or vice versa'
        ]
      });
    }
    else {
      return res.status(200).json({
        success: false,
        message: '⚠️ Instagram server error',
        error: 'Service temporarily unavailable',
        status: response.status,
        details: responseData,
        retry: 'Please try again in a few minutes'
      });
    }

  } catch (error) {
    console.error('❌ API Error:', error);
    
    if (error.name === 'AbortError') {
      return res.status(408).json({
        success: false,
        error: 'Request timeout',
        message: 'The request to Instagram took too long',
        suggestion: 'Please try again later',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      type: error.name,
      suggestion: 'Please try again later or contact support',
      timestamp: new Date().toISOString()
    });
  }
};

function generateSessionData() {
  const timestamp = Math.floor(Date.now() / 1000);
  
  return {
    csrfToken: generateRandomString(32, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'),
    sessionId: `s${Math.floor(Math.random() * 100000)}:${generateRandomString(6, 'abcdefghijklmnopqrstuvwxyz0123456789')}:${generateRandomString(6, 'abcdefghijklmnopqrstuvwxyz0123456789')}`,
    wwwClaim: `hmac.${generateRandomString(43, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_')}`,
    ajaxId: timestamp.toString()
  };
}

function generateRandomString(length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

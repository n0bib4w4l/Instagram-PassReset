// index.js - Working Instagram Password Reset API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({
      error: 'Username missing',
      usage: `${req.headers.host}/?username=TARGET_USER`
    });
  }

  try {
    console.log(`🔥 Trying reset for: ${username}`);

    // Method 1: Try GraphQL endpoint (new approach)
    const graphqlResult = await tryGraphQLMethod(username);
    if (graphqlResult.success) {
      return res.status(200).json(graphqlResult);
    }

    // Method 2: Try mobile API endpoint  
    const mobileResult = await tryMobileAPI(username);
    if (mobileResult.success) {
      return res.status(200).json(mobileResult);
    }

    // Method 3: Try web endpoint with fresh cookies
    const webResult = await tryWebEndpoint(username);
    if (webResult.success) {
      return res.status(200).json(webResult);
    }

    // Method 4: Fallback to alternative endpoint
    const altResult = await tryAlternativeEndpoint(username);
    if (altResult.success) {
      return res.status(200).json(altResult);
    }

    // All methods failed
    return res.status(200).json({
      success: false,
      message: `❌ All methods failed for "${username}"`,
      error: 'Instagram has strict protection now',
      tried_methods: ['GraphQL', 'Mobile API', 'Web Endpoint', 'Alternative'],
      fallback_solution: {
        manual_method: `https://www.instagram.com/accounts/password/reset/`,
        instructions: [
          'Go to Instagram reset page',
          'Enter username manually', 
          'Complete captcha',
          'Check email'
        ]
      },
      debug_info: {
        graphql: graphqlResult.error || 'Failed',
        mobile: mobileResult.error || 'Failed', 
        web: webResult.error || 'Failed',
        alternative: altResult.error || 'Failed'
      }
    });

  } catch (error) {
    console.error('❌ Main Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message,
      fallback: `Manual reset: https://www.instagram.com/accounts/password/reset/`
    });
  }
}

// Method 1: GraphQL endpoint (newest)
async function tryGraphQLMethod(username) {
  try {
    const sessionData = generateAdvancedSession();
    
    const response = await fetch('https://www.instagram.com/graphql/', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.instagram.com',
        'Referer': 'https://www.instagram.com/accounts/password/reset/',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'X-CSRFToken': sessionData.csrf,
        'X-IG-App-ID': '936619743392459',
        'X-Instagram-AJAX': sessionData.ajax,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: new URLSearchParams({
        'email_or_username': username,
        'source': 'account_recovery_email'
      })
    });

    const data = await response.text();
    console.log('GraphQL Response:', response.status, data.substring(0, 200));

    if (response.ok && !data.includes('challenge') && !data.includes('error')) {
      return {
        success: true,
        message: `✅ GraphQL method success for "${username}"`,
        method: 'GraphQL',
        status: response.status
      };
    }

    return { success: false, error: `GraphQL failed: ${response.status}` };
  } catch (error) {
    return { success: false, error: `GraphQL error: ${error.message}` };
  }
}

// Method 2: Mobile API endpoint
async function tryMobileAPI(username) {
  try {
    const sessionData = generateAdvancedSession();
    
    const response = await fetch('https://i.instagram.com/api/v1/accounts/send_recovery_flow_email/', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Instagram 302.0.0.23.100 (iPhone14,2; iOS 17_0; en_US; en-US; scale=3.00; 1170x2532; 513684550)',
        'X-IG-App-Locale': 'en_US',
        'X-IG-Device-Locale': 'en_US',
        'X-IG-Mapped-Locale': 'en_US',
        'X-Pigeon-Session-Id': sessionData.pigeon,
        'X-Pigeon-Rawclienttime': Math.floor(Date.now() / 1000),
        'X-IG-Connection-Speed': '-1kbps',
        'X-IG-Bandwidth-Speed-KBPS': '-1.000',
        'X-IG-Bandwidth-TotalBytes-B': '0',
        'X-IG-Bandwidth-TotalTime-MS': '0',
        'X-IG-App-ID': '567067343352427'
      },
      body: new URLSearchParams({
        'email_or_username': username,
        '_uuid': sessionData.uuid,
        'source': 'default'
      })
    });

    const data = await response.text();
    console.log('Mobile API Response:', response.status, data.substring(0, 200));

    if (response.ok && (data.includes('success') || data.includes('sent'))) {
      return {
        success: true,
        message: `✅ Mobile API success for "${username}"`,
        method: 'Mobile API',
        status: response.status
      };
    }

    return { success: false, error: `Mobile API failed: ${response.status}` };
  } catch (error) {
    return { success: false, error: `Mobile API error: ${error.message}` };
  }
}

// Method 3: Web endpoint with advanced session
async function tryWebEndpoint(username) {
  try {
    const sessionData = generateAdvancedSession();
    
    const response = await fetch('https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.instagram.com',
        'Referer': 'https://www.instagram.com/accounts/password/reset/',
        'Sec-Ch-Ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors', 
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'X-CSRFToken': sessionData.csrf,
        'X-IG-App-ID': '936619743392459',
        'X-IG-WWW-Claim': sessionData.claim,
        'X-Instagram-AJAX': sessionData.ajax,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: new URLSearchParams({
        'email_or_username': username,
        'recaptcha_challenge_field': ''
      })
    });

    const data = await response.text();
    console.log('Web Endpoint Response:', response.status, data.substring(0, 200));

    if (response.ok) {
      return {
        success: true,
        message: `✅ Web endpoint success for "${username}"`,
        method: 'Web Endpoint',
        status: response.status,
        data: data.substring(0, 100)
      };
    }

    return { success: false, error: `Web endpoint failed: ${response.status}` };
  } catch (error) {
    return { success: false, error: `Web endpoint error: ${error.message}` };
  }
}

// Method 4: Alternative endpoint
async function tryAlternativeEndpoint(username) {
  try {
    const sessionData = generateAdvancedSession();
    
    const response = await fetch('https://www.instagram.com/accounts/password/reset/ajax/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.instagram.com',
        'Referer': 'https://www.instagram.com/accounts/password/reset/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'X-CSRFToken': sessionData.csrf,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: `email_or_username=${encodeURIComponent(username)}`
    });

    const data = await response.text();
    console.log('Alternative Response:', response.status, data.substring(0, 200));

    if (response.ok) {
      return {
        success: true,
        message: `✅ Alternative method success for "${username}"`,
        method: 'Alternative Endpoint',
        status: response.status
      };
    }

    return { success: false, error: `Alternative failed: ${response.status}` };
  } catch (error) {
    return { success: false, error: `Alternative error: ${error.message}` };
  }
}

// Generate advanced session data
function generateAdvancedSession() {
  const timestamp = Date.now();
  const randomId = () => Math.random().toString(36).substring(2, 15);
  
  return {
    csrf: generateString(32),
    ajax: Math.floor(timestamp / 1000).toString(),
    uuid: `${randomId()}-${randomId()}-${randomId()}-${randomId()}-${randomId()}`,
    pigeon: `UFS-${randomId()}-${timestamp}`,
    claim: `hmac.${generateString(43)}`
  };
}

function generateString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

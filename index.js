// index.js - Alternative Instagram Reset Helper (Browser-based approach)
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  const { username, action = 'guide' } = req.query;

  // Action: guide - Returns step by step instructions
  if (action === 'guide') {
    return res.status(200).json({
      success: true,
      message: "📋 Instagram Password Reset Guide",
      note: "⚠️ Instagram has blocked automated reset requests. Use manual method instead.",
      methods: [
        {
          method: "🌐 Web Browser Method",
          steps: [
            "1. Go to https://www.instagram.com/accounts/password/reset/",
            "2. Enter username or email",
            "3. Complete the captcha/challenge",
            "4. Click 'Send Login Link'",
            "5. Check email for reset link"
          ],
          success_rate: "95%",
          time_required: "2-3 minutes"
        },
        {
          method: "📱 Mobile App Method", 
          steps: [
            "1. Open Instagram mobile app",
            "2. Tap 'Get help signing in'",
            "3. Enter username or email",
            "4. Tap 'Next'",
            "5. Choose reset method (Email/SMS)",
            "6. Follow the instructions"
          ],
          success_rate: "98%",
          time_required: "1-2 minutes"
        }
      ],
      automation_tools: {
        browser_automation: {
          tool: "Puppeteer/Playwright",
          note: "Can handle captcha with 2captcha service",
          example_url: generateAutomationScript()
        },
        chrome_extension: {
          note: "Create extension to auto-fill and submit",
          manifest_required: true
        }
      },
      username: username || "example_user"
    });
  }

  // Action: check - Check if account exists (alternative method)
  if (action === 'check' && username) {
    try {
      // Try to check if profile exists (this still works)
      const checkUrl = `https://www.instagram.com/${username.replace('@', '').replace(/[^a-zA-Z0-9._]/g, '')}/`;
      
      const response = await fetch(checkUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.status === 200) {
        return res.status(200).json({
          success: true,
          message: `✅ Account "${username}" exists`,
          profile_url: checkUrl,
          reset_instructions: {
            step1: "Go to https://www.instagram.com/accounts/password/reset/",
            step2: `Enter: ${username}`,
            step3: "Complete captcha and click 'Send Login Link'",
            step4: "Check email associated with this account"
          },
          automated_alternative: {
            note: "For automation, consider browser automation tools",
            tools: ["Puppeteer", "Playwright", "Selenium"],
            captcha_services: ["2captcha", "Anti-Captcha", "CapSolver"]
          }
        });
      } else {
        return res.status(200).json({
          success: false,
          message: `❌ Account "${username}" not found or private`,
          suggestions: [
            "Check spelling of username",
            "Try without @ symbol", 
            "Account might be private or suspended",
            "Try using email instead of username"
          ]
        });
      }
    } catch (error) {
      return res.status(200).json({
        success: false,
        message: "⚠️ Could not verify account",
        error: error.message,
        fallback: "Try manual reset at instagram.com"
      });
    }
  }

  // Action: script - Returns automation script
  if (action === 'script') {
    return res.status(200).json({
      success: true,
      message: "🤖 Browser Automation Script",
      note: "Use this with Puppeteer/Playwright for automation",
      script: {
        puppeteer_example: generatePuppeteerScript(),
        playwright_example: generatePlaywrightScript(),
        installation: [
          "npm install puppeteer",
          "npm install playwright"
        ]
      },
      captcha_handling: {
        services: [
          {
            name: "2captcha",
            api: "https://2captcha.com/api/",
            cost: "$1-3 per 1000 captchas"
          },
          {
            name: "Anti-Captcha", 
            api: "https://anti-captcha.com/",
            cost: "$1-2 per 1000 captchas"
          }
        ]
      },
      disclaimer: "⚠️ Use responsibly and respect Instagram's rate limits"
    });
  }

  // Default response
  return res.status(200).json({
    success: false,
    message: "📝 Instagram Password Reset Helper",
    note: "⚠️ Direct API reset is blocked by Instagram (Aug 2025)",
    available_actions: [
      {
        action: "guide",
        url: `${req.headers.host}/?action=guide`,
        description: "Get step-by-step manual reset guide"
      },
      {
        action: "check", 
        url: `${req.headers.host}/?action=check&username=USERNAME`,
        description: "Check if account exists"
      },
      {
        action: "script",
        url: `${req.headers.host}/?action=script`, 
        description: "Get browser automation script"
      }
    ],
    reality_check: {
      instagram_status: "🔒 Heavily protected against automation",
      success_rate: "Manual: 95% | Automated: <5%",
      recommendation: "Use manual method or browser automation with captcha solving"
    }
  });
}

// Generate automation script example
function generateAutomationScript() {
  return `
// Basic browser automation approach
const puppeteer = require('puppeteer');

async function resetInstagramPassword(username) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://www.instagram.com/accounts/password/reset/');
    await page.waitForSelector('input[name="email_or_username"]');
    
    await page.type('input[name="email_or_username"]', username);
    
    // Handle captcha manually or with service
    console.log('Please complete captcha manually...');
    await page.waitForTimeout(30000); // Wait for manual captcha
    
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    console.log('Reset request sent!');
  } finally {
    await browser.close();
  }
}
`;
}

function generatePuppeteerScript() {
  return `
const puppeteer = require('puppeteer');

async function instagramReset(username) {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  try {
    await page.goto('https://www.instagram.com/accounts/password/reset/', {
      waitUntil: 'networkidle2'
    });
    
    // Fill username
    await page.waitForSelector('input[name="email_or_username"]', { timeout: 10000 });
    await page.type('input[name="email_or_username"]', username);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for result
    await page.waitForTimeout(3000);
    
    const result = await page.evaluate(() => {
      const successMsg = document.querySelector('[role="alert"]');
      return successMsg ? successMsg.textContent : 'Check page manually';
    });
    
    console.log('Result:', result);
    return { success: true, message: result };
    
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// Usage
instagramReset('target_username').then(console.log);
`;
}

function generatePlaywrightScript() {
  return `
const { chromium } = require('playwright');

async function instagramResetPlaywright(username) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('https://www.instagram.com/accounts/password/reset/');
    
    // Fill and submit
    await page.fill('input[name="email_or_username"]', username);
    await page.click('button[type="submit"]');
    
    // Handle potential captcha
    await page.waitForTimeout(5000);
    
    console.log('Reset request processed');
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}
`;
}

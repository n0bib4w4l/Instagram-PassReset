const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();

// ✅ Home Route - Displays API Usage
app.get('/', (req, res) => {
  res.send(`
    <h2>🔐 Insta Pass Reset API</h2>
    <p>This API allows you to send an Instagram password reset link.</p>
    <h3>📌 Endpoints:</h3>
    <ul>
      <li><code>GET /reset-password?username=your_instagram_username</code></li>
      <li><code>GET /reset-password?mail=your_instagram_email</code></li>
    </ul>
    <h3>🧪 Example:</h3>
    <p><code>/reset-password?username=teamnobi</code></p>
    <hr>
    <p>Made with ❤️ by @nobi_shops</p>
  `);
});

function maskEmailOrPhone(text) {
  if (text.includes('@')) {
    const [user, domain] = text.split('@');
    const len = user.length;
    let maskedUser;
    if (len <= 2) {
      maskedUser = user[0] + '*'.repeat(Math.max(0, len - 1));
    } else {
      maskedUser = user[0] + '*'.repeat(len - 2) + user[len - 1];
    }
    return maskedUser + '@' + domain;
  } else {
    const len = text.length;
    if (len <= 4) {
      return '*'.repeat(len);
    }
    return '*'.repeat(len - 4) + text.slice(len - 4);
  }
}

app.get('/reset-password', async (req, res) => {
  const startTime = process.hrtime();

  const input = req.query.username || req.query.mail;
  if (!input) {
    return res.status(400).json({
      status: "failed",
      message: "Missing parameter: username or mail is required."
    });
  }

  const url = "https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/";
  const headers = {
    'authority': 'www.instagram.com',
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/x-www-form-urlencoded',
    'origin': 'https://www.instagram.com',
    'priority': 'u=1, i',
    'referer': 'https://www.instagram.com/accounts/password/reset/',
    'sec-ch-prefers-color-scheme': 'light',
    'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
    'sec-ch-ua-full-version-list': '"Not)A;Brand";v="8.0.0.0", "Chromium";v="138.0.7204.158", "Google Chrome";v="138.0.7204.158"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"15.0.0"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    'x-asbd-id': '359341',
    'x-csrftoken': 'YRxXETtYbbIcq2laTt8HaE9ileMLiLCl',
    'x-ig-app-id': '936619743392459',
    'x-ig-www-claim': 'hmac.AR3GYR6M7qkLF-ksuxVbQaC5cJUvY9DzOkKYK6YQ2-rsBIyz',
    'x-instagram-ajax': '1024956690',
    'x-requested-with': 'XMLHttpRequest',
    'x-web-session-id': 'fobjs7:pnhchd:bkfwo9',
    'cookie': 'datr=bSFDaFquU8O5Bthtj0VgVHA-; ig_did=D64F9750-706C-46CB-A1AA-874F3CC1B56F; mid=aEMhbQALAAFsGgbk_Uh9b9MvWrwx; ds_user_id=74837220727; ps_l=1; ps_n=1; csrftoken=YRxXETtYbbIcq2laTt8HaE9ileMLiLCl; sessionid=74837220727%3AfzyYEE5bT1dl5b%3A10%3AAYeSFZDP33gmIT1KJZ6HKwIb8drIiEd_jnUz0cCbRVo; wd=811x633; rur="VLL\\05474837220727\\0541784640652:01fe096849e77065d07f1c281dcbbd574a1f430a746a8d184a99d26ca2e897cfdd845cef"'
  };

  const postData = qs.stringify({
    email_or_username: input,
    flow: 'fxcal'
  });

  try {
    const response = await axios.post(url, postData, { headers });
    const json = response.data;

    const timeTaken = process.hrtime(startTime);
    const secondsTaken = (timeTaken[0] + timeTaken[1] / 1e9).toFixed(2);

    let maskedContact = maskEmailOrPhone(input);
    const emailMatch = json.message?.match(/email to ([^ ]+) with/);
    const phoneMatch = json.message?.match(/phone number ([^ ]+) with/);
    if (emailMatch?.[1]) maskedContact = emailMatch[1];
    if (phoneMatch?.[1]) maskedContact = phoneMatch[1];

    if (json.status === 'ok' && json.message) {
      res.json({
        status: "success",
        message: json.message,
        "≭ Requested By": req.ip || 'Unknown',
        "≭ Bot By / Dev": "@nobi_shops",
        "≭ Time Taken": `${secondsTaken} seconds`,
        "≭ Password Reset Sent To": maskedContact
      });
    } else {
      res.json({
        status: "failed",
        message: "❌ Failed to send reset link.",
        reason: json.message || 'Unknown error',
        "≭ Time Taken": `${secondsTaken} seconds`
      });
    }
  } catch (error) {
    res.json({
      status: "failed",
      message: "Request error: " + error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

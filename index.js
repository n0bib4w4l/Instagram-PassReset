const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();

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
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/x-www-form-urlencoded',
    origin: 'https://www.instagram.com',
    referer: 'https://www.instagram.com/accounts/password/reset/',
    'sec-ch-prefers-color-scheme': 'light',
    'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-full-version-list': '"Google Chrome";v="137.0.7151.56", "Chromium";v="137.0.7151.56", "Not/A)Brand";v="24.0.0.0"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"15.0.0"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    'x-asbd-id': '359341',
    'x-csrftoken': 'VihZjKuiwi9a7QoiHm7p3VUaWsrUZT9w',
    'x-ig-app-id': '936619743392459',
    'x-ig-www-claim': 'hmac.AR3GYR6M7qkLF-ksuxVbQaC5cJUvY9DzOkKYK6YQ2-rsBDq8',
    'x-instagram-ajax': '1023570583',
    'x-requested-with': 'XMLHttpRequest',
    'x-web-session-id': 'pwrl9c:3afhmz:dffzwf',
    cookie: 'datr=EKPmZxZZHWmUMN_J5vlfiI6G; ig_did=A1AE3F95-E2DB-40E0-B6C0-B1297A03102D; mid=Z-ajEgALAAGJkoXjxeU4zcKwv2hv; ig_nrcb=1; ps_l=1; ps_n=1; csrftoken=VihZjKuiwi9a7QoiHm7p3VUaWsrUZT9w; ds_user_id=74837220727; wd=811x633; sessionid=74837220727%3APY6244MH2BKl7c%3A18%3AAYeEodPkqTVNyEhkburk0_F2a95zVR970S243f13KA; rur="VLL\\05474837220727\\0541780748748:01fe82ba589fe004db8c4a7c9c5efc772ac7f2e2252ae799bbf81edfc8082a57444d6587"'
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

    if (json.status === 'ok' && json.message) {
      const emailMatch = json.message.match(/email to ([^ ]+) with/);
      const phoneMatch = json.message.match(/phone number ([^ ]+) with/);

      let maskedContact;
      if (emailMatch && emailMatch[1]) {
        maskedContact = emailMatch[1];
      } else if (phoneMatch && phoneMatch[1]) {
        maskedContact = phoneMatch[1];
      } else {
        maskedContact = maskEmailOrPhone(input);
      }

      res.json({
        status: "success",
        message: json.message,
        "≭ Requested By": req.ip || 'Unknown',
        "≭ Bot By / Dev": "@nobi_shops",
        "≭ Time Taken": `${secondsTaken} seconds`,
        "≭ Password Reset Sent To": maskedContact
      });
    } else {
      const reason = json.message || 'Unknown error';
      res.json({
        status: "failed",
        message: "❌ Failed to send reset link.",
        reason,
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

Milestone 04 - Final Project Documentation
===

NetID
---
yl10118

Name
---
Allen Lu

Repository Link
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu

URL for deployed site 
---
https://final-project-1allenlu.onrender.com

URL for form 1 (from previous milestone) 
---
https://final-project-1allenlu.onrender.com/register

Special Instructions for Form 1
---
Register with any username and password. After registration, you'll see a success page. Passwords are securely hashed using bcrypt. New users start with $100.

URL for form 2 (for current milestone)
---
https://final-project-1allenlu.onrender.com/login

Special Instructions for Form 2
---
Login with credentials created during registration. After successful login, you'll be redirected to the dashboard showing available stocks.

URL for form 3 (from previous milestone) 
---
https://final-project-1allenlu.onrender.com/trade/AAPL

Special Instructions for Form 3
---
Must be logged in to access. From the dashboard, click "Trade" on any stock (AAPL, TSLA, NVDA, META, GOOGL, AMZN, NFLX, MSFT). Supports both buying and selling with fractional shares (e.g., 0.5 shares).

First link to github line number(s) for constructor, HOF, etc.
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu/blob/main/app.mjs#L110-L112

Second link to github line number(s) for constructor, HOF, etc.
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu/blob/main/app.mjs#L172-L173

Short description for links above
---
Lines 110-112: map() transforms array of transaction objects by formatting numeric fields (quantity, pricePerShare, totalAmount) to 2 decimal places while preserving other properties
Lines 172-173: reduce() calculates total portfolio value and total invested amount by summing across all holdings

Link to github line number(s) for schemas (db.js or models folder)
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu/blob/main/db.mjs#L5-L35

Description of research topics above with points
---
3 points - Jest unit testing with 33 comprehensive tests covering trading validation, portfolio calculations, and edge cases\
3 points - Yahoo Finance API integration for real-time stock prices with error handling and fallback prices (with maybe 15-minute delay)\
2 points - bcrypt password hashing for secure authentication on registration and login\
2 points - Bootstrap CSS framework with custom fintech-themed color scheme and responsive design

Links to github line number(s) for research topics described above (one link per line)
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu/blob/main/test/trading.test.js\
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu/blob/main/app.mjs#L32-L96\
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu/blob/main/app.mjs#L399-L445\
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu/blob/main/public/css/style.css

Optional project notes 
--- 
Test credentials: Register any new username/password to test. Old users from before bcrypt implementation will not work.

Yahoo Finance API may be rate-limited on free Render tier. Fallback hardcoded prices are automatically used when API fails (429 errors).

Screenshot of Jest tests passing: documentation/jest-tests-screenshot.png

Attributions
---
app.mjs - Yahoo Finance API integration based on https://www.npmjs.com/package/yahoo-finance2\
app.mjs - bcrypt password hashing based on https://www.npmjs.com/package/bcrypt\
test/trading.test.js - Jest testing framework based on https://jestjs.io/docs/getting-started\
public/css/style.css - Bootstrap framework based on https://getbootstrap.com/docs/5.3/

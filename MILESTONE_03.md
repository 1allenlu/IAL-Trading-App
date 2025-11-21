Milestone 03
===

Repository Link
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu

URL for form 1 (from previous milestone) 
---
https://final-project-1allenlu.onrender.com/register

Special Instructions for Form 1
---
Register with any username and password. After registration, you'll be redirected to login page.

URL for form 2 (for current milestone)
---
https://final-project-1allenlu.onrender.com/trade/AAPL

Special Instructions for Form 2
---
Must be logged in to access trade form. Login first at /login, then navigate to dashboard and click "Trade" on any stock. Can buy or sell stocks (fractional shares allowed).

URL(s) to github repository with commits that show progress on research
--- 
**Jest Unit Testing (3 points):**
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu/blob/main/test/trading.test.js

33 comprehensive unit tests covering trading validation, portfolio calculations, profit/loss calculations, input validation, edge cases, and precision handling.

**Yahoo Finance API (3 points):**
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu/blob/main/app.mjs#L30-L85

Integration of yahoo-finance2 API for real-time stock prices with error handling and fallback prices for API rate limiting.

**bcrypt Password Hashing (2 points):**
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu/blob/main/app.mjs#L330-L368

Secure password hashing using bcrypt. Passwords are hashed on registration and compared securely on login.

**Bootstrap CSS Framework (2 points):**
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-1allenlu/blob/main/public/css/style.css

Custom fintech color scheme with purple/blue gradient theme and responsive design.

References 
---
- [yahoo-finance2 npm package](https://www.npmjs.com/package/yahoo-finance2) - for real-time stock data
- [Jest Documentation](https://jestjs.io/docs/getting-started) - for unit testing
- [bcrypt npm package](https://www.npmjs.com/package/bcrypt) - for password hashing
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/) - for CSS framework
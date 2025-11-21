import './config.mjs';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User, Portfolio, Transaction } from './db.mjs';
import { engine } from 'express-handlebars';
import session from 'express-session';
import yahooFinance from 'yahoo-finance2';
import bcrypt from 'bcrypt';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'your-secret-key-here',
    resave: false, 
    saveUninitialized: false
})); 


const STOCK_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'META', 'GOOGL', 'AMZN', 'NFLX', 'MSFT']; 


// a function to get all the stocks' prices 
async function getStockPrices() {
    const stocks = [];

    // Fallback prices
    const fallbackPrices = {
        'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 275.11 },
        'TSLA': { symbol: 'TSLA', name: 'Tesla, Inc.', price: 429.52 },
        'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 188.15 },
        'META': { symbol: 'META', name: 'Meta Platforms, Inc.', price: 621.71 },
        'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 278.83 },
        'AMZN': { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 244.41 },
        'NFLX': { symbol: 'NFLX', name: 'Netflix, Inc.', price: 1103.66 },
        'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', price: 496.82 }
    };

    for (const symbol of STOCK_SYMBOLS) {
        try {
            const quote = await yahooFinance.quote(symbol);
            stocks.push({
                symbol: symbol,
                name: quote.longName || quote.shortName,
                price: quote.regularMarketPrice
            });
        } catch (err) {
            console.error(`Error fetching ${symbol}:`, err.message);
            // Use fallback for this stock
            stocks.push(fallbackPrices[symbol]);
        }
    }

    return stocks;
}


// a function to get a single stock 
async function getSingleStockPrice(symbol) {
    try {
        console.log(`Fetching price for ${symbol}...`);
        const quote = await yahooFinance.quote(symbol);
        console.log(`Got price for ${symbol}: $${quote.regularMarketPrice}`);
        return {
            symbol: symbol,
            name: quote.longName || quote.shortName,
            price: quote.regularMarketPrice
        };
    } catch (err) {
        console.error(`Error fetching ${symbol}:`, err.message);

        // Return fallback price instead of null
        const fallbackPrices = {
            'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 275.11 },
            'TSLA': { symbol: 'TSLA', name: 'Tesla, Inc.', price: 429.52 },
            'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 188.15 },
            'META': { symbol: 'META', name: 'Meta Platforms, Inc.', price: 621.71 },
            'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 278.83 },
            'AMZN': { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 244.41 },
            'NFLX': { symbol: 'NFLX', name: 'Netflix, Inc.', price: 1103.66 },
            'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', price: 496.82 }
        };

        console.log(`Using fallback price for ${symbol}`);
        return fallbackPrices[symbol] || null;
    }
}


// history routers 
app.get('/history', async (req, res) => {
    // Check login
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // Get all transactions for this user
    const transactions = await Transaction.find({user : req.session.user.id})
        .sort({timestamp: -1}); 

    const transactionsData = transactions.map(t => t.toObject());

    const formattedTransactions = transactions.map(t => {
        return {
            _id: t._id,
            user: t.user,
            stockSymbol: t.stockSymbol,
            transactionType: t.transactionType,
            quantity: parseFloat(t.quantity).toFixed(2),
            pricePerShare: parseFloat(t.pricePerShare).toFixed(2),
            totalAmount: parseFloat(t.totalAmount).toFixed(2),
            timestamp: t.timestamp,
            __v: t.__v
        };
    });

    // Render history view
    res.render('history', {
        username: req.session.user.username, 
        transactions: formattedTransactions
    });
});

// portfolio routers 
app.get('/portfolio', async (req, res) => {
    // Check login
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // Get user's holdings from Portfolio collection
    const holdings = await Portfolio.find({user : req.session.user.id});
    const portfolioData = [];

    for (const holding of holdings){
        const stock = await getSingleStockPrice(holding.stockSymbol);

        if (!stock) {
            console.log(`Skipping ${holding.stockSymbol} - couldn't fetch price`);
            continue;
        }

        if (stock) {
            const currentValue = holding.quantity * stock.price;
            const investedAmount = holding.quantity * holding.averageCostBasis;
            const profitLoss = currentValue - investedAmount;
        
            portfolioData.push({
                symbol: holding.stockSymbol,
                name: stock.name,
                quantity: holding.quantity.toFixed(2),
                avgCost: holding.averageCostBasis.toFixed(2),
                currentPrice: stock.price.toFixed(2),
                currentValue: currentValue.toFixed(2),
                profitLoss: profitLoss.toFixed(2),
                profitLossPercent: ((profitLoss / investedAmount) * 100).toFixed(2),
                profitLossClass: profitLoss >= 0 ? 'profit' : 'loss'
            });
        };
    };

    // Calculate totals
    const totalValue = portfolioData.reduce((sum, item) => sum + parseFloat(item.currentValue), 0);
    const totalInvested = portfolioData.reduce((sum, item) => sum + (item.quantity * item.avgCost), 0);
    const totalPL = totalValue - totalInvested;

    // Get user cash
    const user = await User.findById(req.session.user.id);

    res.render('portfolio', {
        username: req.session.user.username,
        holdings: portfolioData,
        totalValue: totalValue.toFixed(2),
        totalPL: totalPL.toFixed(2),
        totalPLClass: totalPL >= 0 ? 'profit' : 'loss',
        cashBalance: user.cashBalance.toFixed(2)
    });
}); 

// trade routers 
app.get('/trade/:symbol', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const symbol = req.params.symbol;

    const stock = await getSingleStockPrice(symbol);
    if (!stock){
        return res.render('error', {
            username: req.session.user?.username,
            errorTitle: 'Stock Not Found',
            errorMessage: 'Unable to find pricing information for this stock.',
            backLink: '/dashboard',
            backText: 'Back to Dashboard'
        });
        // return res.send('Stock not found! <a href="/dashboard">Back to dashboard</a>');
    }

    // Get users 
    const user = await User.findById(req.session.user.id);
    if (!user){
        res.send('Error finding user'); 
    }

    const holding = await Portfolio.findOne({
        user: req.session.user.id, 
        stockSymbol : symbol
    });

    res.render('trade', {
        symbol: stock.symbol,
        stockName: stock.name,
        stockPrice: stock.price, 
        cashBalance: user.cashBalance.toFixed(2), 
        ownedShares: holding ? holding.quantity: 0
    });
});

app.post('/trade', async (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        // Get form data(symbol, trade_action, quantity)
        const { symbol, trade_action, quantity } = req.body; 
        const qty = parseFloat(quantity);
        
        // Find the stock and its price
        const stock = await getSingleStockPrice(symbol);
        if (!stock){
            return res.send('Stock Not Found'); 
        }

        const price = stock.price;
        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.send('Error finding user');
        }

        // Validate the trade
        if (trade_action === 'buy'){
            // Check sufficient funds
            if (user.cashBalance < (price * qty)){
                return res.render('error', {
                    username: req.session.user?.username,
                    errorTitle: 'Insufficient Funds',
                    errorMessage: 'You don\'t have enough cash to complete this purchase.',
                    backLink: '/dashboard',
                    backText: 'Back to Dashboard'
                });
                // return res.send('Not Enough Funds <a href="/dashboard">Back</a>'); 
            }
        } else { // Check user owns enough shares
            const holding = await Portfolio.findOne({
                user: req.session.user.id,
                stockSymbol: symbol
            });
            if (!holding || holding.quantity < qty) {
                return res.render('error', {
                    username: req.session.user.username,
                    errorTitle: 'Insufficient Shares',
                    errorMessage: 'You don\'t own enough shares to sell.',
                    backLink: '/dashboard',
                    backText: 'Back to Dashboard'
                });
                // return res.send('Not Enough Shares <a href="/dashboard">Back</a>'); 
            }
        }

        // Execute the trade 
        if (trade_action === 'buy'){
            // deduct cash, add / updated portfolio, create transaction
            user.cashBalance -= (price * qty); 
            await user.save(); 
            const holding = await Portfolio.findOne({
                user: req.session.user.id,
                stockSymbol: symbol
            });

            if (!holding){ 
                // if doesn't exist, then create a new portfolio for this stock 
                const newPortfolio = new Portfolio({
                    user: req.session.user.id,
                    stockSymbol: stock.symbol, 
                    quantity: qty, 
                    averageCostBasis: price
                });
                await newPortfolio.save(); 
            }else{
                const oldquantity = holding.quantity;
                const oldaverageCostBasis = holding.averageCostBasis;
                // update new quantity & averageCostBasis
                holding.quantity += qty;
                holding.averageCostBasis = (oldquantity * oldaverageCostBasis + qty * stock.price) / (holding.quantity);
                await holding.save();
            }

            // Create transaction
            const newTransaction = new Transaction({
                user: req.session.user.id, 
                stockSymbol: stock.symbol,
                transactionType: 'buy', 
                quantity: qty,
                pricePerShare: price,
                totalAmount: (price * qty),
                timestamp: Date.now()
            });
            await newTransaction.save();
        } else { // add cash, update portfolio, create transaction 
            user.cashBalance += (price * qty); 
            await user.save();

            const holding = await Portfolio.findOne({
                user: req.session.user.id,
                stockSymbol: symbol
            });
            holding.quantity -= qty;
            await holding.save();

            const newTransaction = new Transaction({
                user: req.session.user.id,
                stockSymbol: stock.symbol, 
                transactionType: 'sell', 
                quantity: qty, 
                pricePerShare: price, 
                totalAmount: (price * qty), 
                timestamp: Date.now()
            });
            await newTransaction.save();
        }

        // Redirect to dashboard or show success
        res.redirect('/dashboard'); 
    } catch (err){
        return res.send('Error Processing the Trade')
    }
});


// logout routers 
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login'); 
});


// dashboard routers 
app.get('/dashboard', async (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const user = await User.findById(req.session.user.id);
    const stocks = await getStockPrices(); 

    res.render('dashboard', {
        username: req.session.user.username,
        cashBalance: user.cashBalance.toFixed(2),
        stocks: stocks
    });
});

// login routers 
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const existingUser = await User.findOne({ username: username });

        // Check user exists FIRST
        if (!existingUser) {
            return res.render('error', {
                errorTitle: 'User Not Found',
                errorMessage: 'No account exists with that username.',
                backLink: '/register',
                backText: 'Create Account'
            });
            // return res.send('User not found! <a href="/register">Create an account</a>');
        }

        // THEN compare password (now existingUser definitely exists)
        const passwordMatch = await bcrypt.compare(password, existingUser.password);

        if (!passwordMatch) {
            return res.render('error', {
                errorTitle: 'Login Failed',
                errorMessage: 'Incorrect password. Please try again.',
                backLink: '/login',
                backText: 'Back to Login'
            });
            // return res.send('Wrong password! <a href="/login">Try again</a>');  // ← ADD RETURN
        }

        // Success!
        req.session.user = {
            id: existingUser._id,
            username: existingUser.username
        };

        return res.redirect('/dashboard');

    } catch (err) {
        console.log(err);
        return res.send('Error logging in');
    }
});

// register routers 
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password; 
    try{
        const existingUser = await User.findOne({username:username}); 
        if (existingUser){
            return res.render('error', {
                errorTitle: 'Username Taken',
                errorMessage: 'That username is already in use. Please choose another.',
                backLink: '/register',
                backText: 'Try Again'
            });
            // return res.send('Username already taken! <a href="/register">Try a different username</a> or <a href="/login">Login here</a>');
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const newUser =  new User({ 
            username: username, 
            password: hashPassword, 
            cashBalance: 100
        });

        await newUser.save();
        return res.render('success');
        // res.send('Successful Registration and <a href="/login">Login here</a>');
    } catch (err) {
        res.send('Error creating account');
    }
});

app.get('/', (req, res) => {
    // direct take users to login page 
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    return res.redirect('/login');
});

app.listen(process.env.PORT || 3000);


// TODO: 
// Successful Registration and Login here
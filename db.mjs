import mongoose from 'mongoose';
mongoose.connect(process.env.DSN);


const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, 
    password: {type: String, required: true}, 
    cashBalance: { type: Number, required: true, default: 100.00 } // start at 100.00
});

const PortfolioSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    stockSymbol: {type: String, required: true}, 
    quantity: { type: Number, required: true }, 
    averageCostBasis: { type: Number, required: true}
});

const TransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stockSymbol: {type: String, required: true}, 
    transactionType: {type: String, enum: ['buy', 'sell']}, 
    quantity: { type: Number, required: true}, 
    pricePerShare: { type: Number, required: true}, 
    totalAmount: { type: Number, required: true}, 
    timestamp: {type: Date, default: Date.now}
});

const User = mongoose.model('User', UserSchema); 
const Portfolio = mongoose.model('Portfolio', PortfolioSchema); 
const Transaction = mongoose.model('Transaction', TransactionSchema); 

export {User, Portfolio, Transaction};
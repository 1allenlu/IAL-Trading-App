// test trading logic functions

// a helper function to validate buy order
function validateBuyOrder(cashBalance, stockPrice, quantity) {
    const totalCost = stockPrice * quantity;
    return cashBalance >= totalCost;
}

// a helper function to validate sell order
function validateSellOrder(sharesOwned, quantity) {
    return sharesOwned >= quantity;
}

// a helper function to calculate total cost
function calculateTotalCost(price, quantity) {
    return price * quantity;
}

// a helper function to calculate new average cost basis
function calculateAverageCost(oldQty, oldAvgCost, newQty, newPrice) {
    const totalValue = (oldQty * oldAvgCost) + (newQty * newPrice);
    const totalShares = oldQty + newQty;
    return totalValue / totalShares;
}

// Tests
describe('Trading Validation Tests', () => {

    test('should allow buy when user has sufficient funds', () => {
        const result = validateBuyOrder(1000, 175.50, 5);
        expect(result).toBe(true);
    });

    test('should reject buy when user has insufficient funds', () => {
        const result = validateBuyOrder(100, 175.50, 5);
        expect(result).toBe(false);
    });

    test('should allow sell when user has sufficient shares', () => {
        const result = validateSellOrder(10, 5);
        expect(result).toBe(true);
    });

    test('should reject sell when user has insufficient shares', () => {
        const result = validateSellOrder(3, 5);
        expect(result).toBe(false);
    });

    test('should calculate total cost correctly', () => {
        const result = calculateTotalCost(175.50, 2);
        expect(result).toBe(351);
    });

    test('should calculate average cost basis correctly when adding shares', () => {
        // Own 2 shares at $100 each, buy 3 more at $120 each
        // Average = (2*100 + 3*120) / 5 = 560/5 = 112
        const result = calculateAverageCost(2, 100, 3, 120);
        expect(result).toBe(112);
    });

});

// additional helper functions to test
function calculateNewAverageCost(oldQty, oldAvgCost, newQty, newPrice) {
    const totalValue = (oldQty * oldAvgCost) + (newQty * newPrice);
    const totalShares = oldQty + newQty;
    return totalValue / totalShares;
}

function calculateProfitLoss(quantity, avgCost, currentPrice) {
    const invested = quantity * avgCost;
    const currentValue = quantity * currentPrice;
    return currentValue - invested;
}

function calculateProfitLossPercent(quantity, avgCost, currentPrice) {
    const invested = quantity * avgCost;
    const profitLoss = calculateProfitLoss(quantity, avgCost, currentPrice);
    return (profitLoss / invested) * 100;
}


function validateQuantity(quantity) {
    return quantity > 0 && !isNaN(quantity) && isFinite(quantity);
}

// NEW TESTS
describe('Portfolio Calculations', () => {

    test('should calculate profit correctly when stock price increases', () => {
        // I bought 10 shares at $100 each
        // Current price is $150
        // Profit = (10 × $150) - (10 × $100) = $1500 - $1000 = $500
        const result = calculateProfitLoss(10, 100, 150);
        expect(result).toBe(500);
    });

    test('should calculate loss correctly when stock price decreases', () => {
        // I bought 5 shares at $200 each
        // Current price is $150
        // Loss = (5 × $150) - (5 × $200) = $750 - $1000 = -$250
        const result = calculateProfitLoss(5, 200, 150);
        expect(result).toBe(-250);
    });

    test('should calculate profit/loss percentage correctly', () => {
        // Bought at $100, now worth $120
        // P&L% = (($20 profit) / $100 invested) × 100 = 20%
        const result = calculateProfitLossPercent(1, 100, 120);
        expect(result).toBe(20);
    });

    test('should calculate negative percentage for losses', () => {
        // Bought at $100, now worth $80
        // P&L% = ((-$20 loss) / $100 invested) × 100 = -20%
        const result = calculateProfitLossPercent(1, 100, 80);
        expect(result).toBe(-20);
    });

});

describe('Input Validation', () => {

    test('should accept positive quantities', () => {
        expect(validateQuantity(5)).toBe(true);
        expect(validateQuantity(0.5)).toBe(true);
    });

    test('should reject zero quantity', () => {
        expect(validateQuantity(0)).toBe(false);
    });

    test('should reject negative quantities', () => {
        expect(validateQuantity(-5)).toBe(false);
    });

    test('should reject non-numeric quantities', () => {
        expect(validateQuantity('abc')).toBe(false);
        expect(validateQuantity(NaN)).toBe(false);
    });

});

describe('Average Cost Basis Updates', () => {

    test('should calculate correct average when adding more shares', () => {
        // Own 2 shares at $100 each = $200 total
        // Buy 3 more at $120 each = $360 more
        // New average = ($200 + $360) / 5 shares = $112
        const result = calculateNewAverageCost(2, 100, 3, 120);
        expect(result).toBe(112);
    });

    test('should handle first purchase correctly', () => {
        // No shares owned (0 at $0)
        // Buy 5 shares at $100
        // Average should be $100
        const result = calculateNewAverageCost(0, 0, 5, 100);
        expect(result).toBe(100);
    });

});


describe('Edge Cases', () => {

    test('should handle very small fractional shares (0.01)', () => {
        const cost = calculateTotalCost(100, 0.01);
        expect(cost).toBe(1);
    });

    test('should handle very large quantities', () => {
        const cost = calculateTotalCost(100, 10000);
        expect(cost).toBe(1000000);
    });

    test('should calculate total cost with fractional shares and fractional prices', () => {
        // 2.5 shares at $175.50 each
        const cost = calculateTotalCost(175.50, 2.5);
        expect(cost).toBe(438.75);
    });

    test('should handle selling all shares (quantity becomes zero)', () => {
        const result = validateSellOrder(5, 5); // own 5, sell 5
        expect(result).toBe(true);
    });

    test('should reject selling more than owned by 0.01 shares', () => {
        const result = validateSellOrder(5, 5.01);
        expect(result).toBe(false);
    });

});

describe('Profit/Loss Edge Cases', () => {

    test('should return zero profit when price unchanged', () => {
        const result = calculateProfitLoss(10, 100, 100);
        expect(result).toBe(0);
    });

    test('should calculate P&L with fractional shares', () => {
        // 2.5 shares bought at $100, now $120
        // Profit = (2.5 × $120) - (2.5 × $100) = $300 - $250 = $50
        const result = calculateProfitLoss(2.5, 100, 120);
        expect(result).toBe(50);
    });

    test('should handle 100% loss (price goes to 0)', () => {
        const result = calculateProfitLossPercent(10, 100, 0);
        expect(result).toBe(-100);
    });

    test('should handle 100% gain (price doubles)', () => {
        const result = calculateProfitLossPercent(10, 100, 200);
        expect(result).toBe(100);
    });

    test('should calculate correct P&L for multiple buys at different prices', () => {
        // First buy: 2 shares at $100 = avg $100
        let avgCost = 100;

        // Second buy: 3 shares at $150
        avgCost = calculateNewAverageCost(2, avgCost, 3, 150);
        // New average should be $130
        expect(avgCost).toBe(130);

        // Current price $140, should show profit
        const profitLoss = calculateProfitLoss(5, avgCost, 140);
        expect(profitLoss).toBe(50); // (5 × $140) - (5 × $130) = $50
    });

});

describe('Validation Edge Cases', () => {

    test('should reject quantity of exactly 0', () => {
        expect(validateQuantity(0)).toBe(false);
    });

    test('should accept very small positive quantity', () => {
        expect(validateQuantity(0.0001)).toBe(true);
    });

    test('should reject Infinity', () => {
        expect(validateQuantity(Infinity)).toBe(false);
    });

    test('should reject undefined', () => {
        expect(validateQuantity(undefined)).toBe(false);
    });

    test('should reject null', () => {
        expect(validateQuantity(null)).toBe(false);
    });

    test('should reject empty string', () => {
        expect(validateQuantity('')).toBe(false);
    });

});

// Store portfolio data
let portfolio = JSON.parse(localStorage.getItem('portfolio')) || [];

// Fetch market data from CoinGecko
async function fetchMarketData() {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,cardano'
        );
        const data = await response.json();
        displayMarketData(data);
        updatePortfolio();
    } catch (error) {
        console.error('Error fetching market data:', error);
    }
}

// Display market data in table
function displayMarketData(coins) {
    const marketBody = document.getElementById('market-body');
    marketBody.innerHTML = '';
    coins.forEach(coin => {
        const row = document.createElement('tr');
        const changeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
        row.innerHTML = `
            <td>${coin.name}</td>
            <td>$${coin.current_price.toFixed(2)}</td>
            <td class="${changeClass}">${coin.price_change_percentage_24h.toFixed(2)}%</td>
        `;
        marketBody.appendChild(row);
    });
}

// Add coin to portfolio
function addToPortfolio() {
    const coinId = document.getElementById('coin-id').value.toLowerCase();
    const amount = parseFloat(document.getElementById('amount').value);
    if (coinId && amount > 0) {
        portfolio.push({ coinId, amount });
        localStorage.setItem('portfolio', JSON.stringify(portfolio));
        updatePortfolio();
        document.getElementById('coin-id').value = '';
        document.getElementById('amount').value = '';
    } else {
        alert('Please enter a valid coin ID and amount.');
    }
}

// Update portfolio table and total value
async function updatePortfolio() {
    const portfolioBody = document.getElementById('portfolio-body');
    const totalValueElement = document.getElementById('total-value');
    portfolioBody.innerHTML = '';
    let totalValue = 0;

    for (const item of portfolio) {
        try {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${item.coinId}?localization=false`
            );
            const data = await response.json();
            const price = data.market_data.current_price.usd;
            const value = price * item.amount;
            totalValue += value;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.name}</td>
                <td>${item.amount}</td>
                <td>$${price.toFixed(2)}</td>
                <td>$${value.toFixed(2)}</td>
                <td><button class="remove-btn" onclick="removeFromPortfolio('${item.coinId}')">Remove</button></td>
            `;
            portfolioBody.appendChild(row);
        } catch (error) {
            console.error(`Error fetching data for ${item.coinId}:`, error);
        }
    }
    totalValueElement.textContent = `$${totalValue.toFixed(2)}`;
}

// Remove coin from portfolio
function removeFromPortfolio(coinId) {
    portfolio = portfolio.filter(item => item.coinId !== coinId);
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
    updatePortfolio();
}

// Fetch market data every 60 seconds
fetchMarketData();
setInterval(fetchMarketData, 60000);

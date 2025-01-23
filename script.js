'use strict';

class CoinTracker {
    constructor() {
        this.timeframe = '24h';
        this.coins = [];
        this.apiEndpoint = 'https://data.solanatracker.io';
        this.wsEndpoint = 'wss://api.solscan.io/ws';
        this.apiKey = 'cbbff4e0-dc44-4106-9e43-2b54667ea532';
        this.websocket = null;
        this.subscribedPools = new Set();
        
        this.initializeEventListeners();
        this.startDataRefresh();
        this.initializeWebSocket();
    }

    initializeEventListeners() {
        document.querySelectorAll('.timeframe-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                document.querySelectorAll('.timeframe-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.timeframe = e.target.dataset.timeframe;
                await this.fetchAndUpdateData();
            });
        });
    }

    initializeWebSocket() {
        this.websocket = new WebSocket(this.wsEndpoint);
        
        this.websocket.onopen = () => {
            console.log('Connected to WebSocket');
            this.reconnectAttempts = 0;
            this.subscribeToUpdates();
            this.addPencilScribbleEffect();
        };

        this.websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message:', data);
                
                if (data.token && data.pools) {
                    // Process new token data
                    const tokenData = {
                        name: data.token.name,
                        symbol: data.token.symbol,
                        mint: data.token.mint,
                        icon: data.token.image || data.token.uri,
                        poolId: data.pools[0]?.poolId,
                        price: data.pools[0]?.price?.usd || 0,
                        marketCap: data.pools[0]?.marketCap?.usd || 0,
                        priceChange: data.events?.[this.timeframe]?.priceChangePercentage || 0
                    };

                    if (tokenData.name && tokenData.icon && tokenData.mint) {
                        // Update existing token or add to list if it's new
                        const existingIndex = this.coins.findIndex(c => c.mint === tokenData.mint);
                        if (existingIndex !== -1) {
                            this.coins[existingIndex] = { ...this.coins[existingIndex], ...tokenData };
                            this.updateCoinCard(this.coins[existingIndex]);
                        } else if (this.coins.length < 5) {
                            this.coins.push(tokenData);
                            this.coins.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));
                            this.updateUI();
                        } else if (Math.abs(tokenData.priceChange) > Math.abs(this.coins[this.coins.length - 1].priceChange)) {
                            // Replace the lowest performing token if this one has higher price change
                            this.coins.pop();
                            this.coins.push(tokenData);
                            this.coins.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));
                            this.updateUI();
                        }
                        
                        this.updateLastUpdateTime();
                    }
                }
                this.playChalkboardSound();
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };

        this.websocket.onclose = () => {
            console.log('WebSocket connection closed');
            this.handleReconnection();
        };

        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.initializeWebSocket(), 5000 * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    subscribeToUpdates() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                type: 'subscribe',
                timeframe: this.timeframe
            }));
        }
    }

    async fetchRealData() {
        try {
            // Use the trending endpoint with the current timeframe
            const response = await fetch(`${this.apiEndpoint}/tokens/trending/${this.timeframe}`, {
                headers: {
                    'x-api-key': this.apiKey,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const trendingData = await response.json();
            console.log('Trending Response:', trendingData);

            if (!Array.isArray(trendingData)) {
                throw new Error('Invalid API response format');
            }

            // Update hero stats
            this.updateHeroStats(trendingData);

            // Process the top 5 trending tokens
            const processedTokens = trendingData.slice(0, 5).map(data => {
                const token = data.token;
                const mainPool = data.pools?.[0] || {};
                const events = data.events || {};
                
                return {
                    name: token.name,
                    symbol: token.symbol,
                    mint: token.mint,
                    icon: token.image || token.uri,
                    poolId: mainPool.poolId,
                    price: mainPool.price?.usd || 0,
                    priceChange: events[this.timeframe]?.priceChangePercentage || 0,
                    marketCap: mainPool.marketCap?.usd || 0
                };
            });

            const validTokens = processedTokens.filter(token => 
                token && 
                token.name && 
                token.icon && 
                token.mint
            );

            console.log('Final processed tokens:', validTokens);

            if (validTokens.length === 0) {
                throw new Error('No valid tokens found');
            }

            // Sort by absolute price change to show biggest movers
            validTokens.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));

            return validTokens;
        } catch (error) {
            console.error('Error in fetchRealData:', error);
            throw error;
        }
    }

    updateHeroStats(trendingData) {
        // Update total tokens tracked
        const totalTokensElement = document.getElementById('totalTokens');
        if (totalTokensElement) {
            totalTokensElement.textContent = trendingData.length.toString();
        }

        // Calculate and update total 24h volume
        const totalVolumeElement = document.getElementById('totalVolume');
        if (totalVolumeElement) {
            const totalVolume = trendingData.reduce((sum, data) => {
                const volume = data.pools?.[0]?.volume?.usd || 0;
                return sum + volume;
            }, 0);
            totalVolumeElement.textContent = '$' + this.formatNumber(totalVolume);
        }
    }

    async fetchMockData() {
        return Array.from({ length: 5 }, (_, i) => ({
            name: `Sample Token ${i + 1}`,
            symbol: `TOKEN${i + 1}`,
            mint: `MINT${i + 1}`,
            price: Math.random() * 100,
            priceChange: (Math.random() * 40) - 20,
            marketCap: Math.random() * 10000000,
            icon: null
        }));
    }

    updateCoinCard(coin) {
        const card = document.querySelector(`[data-mint="${coin.mint}"]`);
        if (!card) return;

        const priceChangeClass = coin.priceChange >= 0 ? 'change-positive' : 'change-negative';
        const priceChangeSymbol = coin.priceChange >= 0 ? '↗' : '↘';
        const priceChangeAbs = Math.abs(coin.priceChange).toFixed(2);

        // Update market cap
        const marketCapElement = card.querySelector('.metric-value[data-type="marketcap"]');
        if (marketCapElement) {
            marketCapElement.textContent = '$' + this.formatNumber(coin.marketCap);
        }

        // Update price change
        const priceChangeElement = card.querySelector('.metric-value[data-type="pricechange"]');
        if (priceChangeElement) {
            priceChangeElement.className = `metric-value ${priceChangeClass}`;
            priceChangeElement.textContent = `${priceChangeSymbol} ${priceChangeAbs}%`;
        }

        // Add animation class for update
        card.classList.add('updating');
        setTimeout(() => card.classList.remove('updating'), 1000);
    }

    async fetchAndUpdateData() {
        try {
            console.log('Fetching initial data...');
            this.coins = await this.fetchRealData();
            this.updateUI();
            this.updateLastUpdateTime();
        } catch (error) {
            console.error('Error fetching initial data:', error);
            this.coins = await this.fetchMockData();
            this.updateUI();
            this.updateLastUpdateTime();
        }
    }

    updateUI() {
        const coinsGrid = document.getElementById('coinsGrid');
        if (!coinsGrid) {
            console.error('Coins grid element not found');
            return;
        }

        coinsGrid.innerHTML = '';
        this.coins.forEach((coin, index) => {
            const card = this.createCoinCard(coin, index + 1);
            coinsGrid.appendChild(card);
            this.animateCardEntry(card);
        });
    }

    createCoinCard(coin, rank) {
        const card = document.createElement('div');
        card.className = `coin-card ${rank === 1 ? 'top-performer' : ''}`;
        card.dataset.mint = coin.mint;
        
        // Add doodle decorations
        const starDoodle = document.createElement('div');
        starDoodle.className = 'doodle star';
        starDoodle.textContent = '★';
        
        const arrowDoodle = document.createElement('div');
        arrowDoodle.className = 'doodle arrow';
        arrowDoodle.textContent = '→';
        
        // Add badge for top performer
        if (rank === 1) {
            const badge = document.createElement('div');
            badge.className = 'coin-badge';
            badge.textContent = '🏆 Top Performer';
            card.appendChild(badge);
        }
        
        const priceChangeClass = coin.priceChange >= 0 ? 'change-positive' : 'change-negative';
        const priceChangeSymbol = coin.priceChange >= 0 ? '↗' : '↘';
        const priceChangeAbs = Math.abs(coin.priceChange).toFixed(2);

        card.innerHTML += `
            <div class="coin-header">
                <div class="coin-icon">
                    <img src="${coin.icon}" 
                         alt="${coin.name}"
                         onerror="this.src='https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'">
                </div>
                <div class="coin-info">
                    <div class="coin-name">${coin.name}</div>
                    <div class="coin-symbol">$${coin.symbol}</div>
                </div>
            </div>
            <div class="coin-metrics">
                <div class="metric">
                    <span class="metric-label">Market Cap</span>
                    <span class="metric-value" data-type="marketcap">$${this.formatNumber(coin.marketCap)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">${this.timeframe} Change</span>
                    <span class="metric-value ${priceChangeClass}" data-type="pricechange">${priceChangeSymbol} ${priceChangeAbs}%</span>
                </div>
            </div>
        `;
        
        // Append doodles
        card.appendChild(starDoodle);
        card.appendChild(arrowDoodle);
        
        // Add click handler for copying address
        const symbolElement = card.querySelector('.coin-symbol');
        symbolElement.style.cursor = 'pointer';
        symbolElement.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(coin.mint)
                .then(() => {
                    const originalText = symbolElement.textContent;
                    symbolElement.textContent = 'Copied!';
                    setTimeout(() => {
                        symbolElement.textContent = originalText;
                    }, 1000);
                });
        });
        
        // Add click handler for showing details
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.coin-symbol')) {
                this.showCoinDetails(coin);
            }
        });
        
        return card;
    }

    formatNumber(num) {
        if (!num) return '0.00';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(2);
    }

    updateLastUpdateTime() {
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            lastUpdate.textContent = new Date().toLocaleTimeString();
        }
    }

    startDataRefresh() {
        this.fetchAndUpdateData();
        // Reduced polling interval since we're using WebSocket for live updates
        setInterval(() => this.fetchAndUpdateData(), 300000); // Refresh every 5 minutes as backup
    }

    addPencilScribbleEffect() {
        const pencilSound = new Audio('pencil-sound.mp3');
        document.querySelectorAll('.coin-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                pencilSound.currentTime = 0;
                pencilSound.play();
            });
        });
    }

    playChalkboardSound() {
        const chalk = new Audio('chalk-sound.mp3');
        chalk.volume = 0.2;
        chalk.play();
    }

    animateCardEntry(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            card.style.transition = 'all 0.3s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }

    showCoinDetails(coin) {
        const modal = document.querySelector('.coin-detail-modal');
        const coinIcon = modal.querySelector('.coin-icon-large');
        const coinName = modal.querySelector('.coin-name-large');
        const momentumIndicator = modal.querySelector('.momentum-indicator');
        const momentumText = modal.querySelector('.momentum-text');
        const tradingActivity = modal.querySelector('.trading-activity');
        const marketCap = modal.querySelector('.market-cap');
        const marketAnalysis = modal.querySelector('.market-analysis');
        const marketPosition = modal.querySelector('.market-position');
        const technicalOutlook = modal.querySelector('.technical-outlook');
        const riskAssessment = modal.querySelector('.risk-assessment');
        const entryPoint = modal.querySelector('.entry-point');
        const updateTime = modal.querySelector('.update-time');

        // Set coin basic info
        coinIcon.innerHTML = `<img src="${coin.icon}" alt="${coin.name}" onerror="this.src='https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'">`;
        coinName.textContent = coin.name;

        // Set investment highlights
        const momentum = Math.abs(coin.priceChange);
        let momentumClass = 'neutral';
        if (momentum >= 10) momentumClass = 'exceptional';
        else if (momentum >= 5) momentumClass = 'strong';
        
        momentumIndicator.innerHTML = `
            <span class="momentum ${momentumClass}">
                ${coin.priceChange >= 0 ? '📈 Bullish' : '📉 Bearish'} Momentum
            </span>
        `;
        
        momentumText.textContent = `${coin.name} is demonstrating ${momentumClass} momentum with a ${Math.abs(coin.priceChange).toFixed(2)}% surge in the past 24h, signaling strong ${coin.priceChange >= 0 ? 'buyer' : 'seller'} conviction.`;

        // Set market analysis
        tradingActivity.textContent = momentum >= 5 ? 'Very High' : 'Moderate';
        marketCap.textContent = this.formatNumber(coin.marketCap);
        marketAnalysis.textContent = `${coin.name} is currently positioned at the forefront of market momentum, with several key indicators suggesting potential for continued ${coin.priceChange >= 0 ? 'upward' : 'downward'} movement.`;

        // Set strategy insights
        marketPosition.textContent = `Leading market momentum with sustained ${coin.priceChange >= 0 ? 'buying' : 'selling'} pressure and ${Math.abs(coin.priceChange).toFixed(2)}% growth`;
        technicalOutlook.textContent = `Strong ${coin.priceChange >= 0 ? 'breakout' : 'breakdown'} characteristics with volume confirmation`;
        riskAssessment.textContent = `Moderate liquidity suggests strategic position sizing`;
        entryPoint.textContent = `Current price $${coin.price.toFixed(6)} with momentum-driven ${coin.priceChange >= 0 ? 'upside' : 'downside'} potential`;

        // Set update time
        updateTime.textContent = new Date().toLocaleTimeString();

        // Show modal with animation
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        // Handle tab switching
        const tabs = modal.querySelectorAll('.tab-btn');
        const contents = modal.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                modal.querySelector(`.tab-content[data-tab="${target}"]`).classList.add('active');
            });
        });

        // Handle close button
        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        });
    }
}

// Loading Screen Handler
document.addEventListener('DOMContentLoaded', () => {
    const enterButton = document.querySelector('.enter-button');
    const loadingScreen = document.querySelector('.loading-screen');
    const appContainer = document.querySelector('.app-container');

    if (!enterButton || !loadingScreen || !appContainer) {
        console.error('Required elements not found');
        return;
    }

    // Initialize the app
    const app = new CoinTracker();

    // Make enter button visible after logo animation
    setTimeout(() => {
        enterButton.classList.add('visible');
    }, 2000);

    // Add click handler for enter button
    enterButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Enter button clicked');
        
        // Add exit animation class to loading screen
        loadingScreen.classList.add('exit');
        
        // Hide loading screen and show app container after animation
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            requestAnimationFrame(() => {
                appContainer.classList.add('show');
            });
        }, 800);
    });

    // Ensure social links work properly
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', (e) => {
            // Let the default behavior handle the navigation since we're using proper href attributes
            console.log('Social link clicked:', link.href);
        });
    });
}); 
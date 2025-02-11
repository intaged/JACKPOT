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
        this.highRollersGrid = document.querySelector('.high-rollers-grid');
        this.topWallets = [];
        this.walletCache = new Map();
        this.isSpinning = false;
        this.spinDuration = 3000; // 3 seconds spin
        this.lastWalletFetch = 0;
        this.CACHE_DURATION = 60000; // 1 minute cache
        
        this.initializeEventListeners();
        this.startDataRefresh();
        this.initializeWebSocket();
        this.initializeHighRollers();
        this.initializeSlotMachine();
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
                        } else if (this.coins.length < 8) {
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

            // Process the top 8 trending tokens instead of 5
            const processedTokens = trendingData.slice(0, 8).map(data => {
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
                    marketCap: mainPool.marketCap?.usd || 0,
                    volume: mainPool.volume?.usd || 0,
                    liquidity: mainPool.liquidity?.usd || 0
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

        // Set fixed total volume with premium formatting
        const totalVolumeElement = document.getElementById('totalVolume');
        if (totalVolumeElement) {
            totalVolumeElement.innerHTML = '$<span class="volume-value">487.92</span><span class="volume-unit">M</span>';
        }
    }

    async fetchMockData() {
        return Array.from({ length: 8 }, (_, i) => ({
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
        
        const rankBadge = document.createElement('div');
        rankBadge.className = 'rank-badge';
        rankBadge.textContent = rank;
        
        const priceChangeClass = coin.priceChange >= 0 ? 'change-positive' : 'change-negative';
        const priceChangeSymbol = coin.priceChange >= 0 ? '↗' : '↘';
        const priceChangeAbs = Math.abs(coin.priceChange).toFixed(2);

        card.innerHTML = `
            ${rankBadge.outerHTML}
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
        if (!modal) return;

        const modalContent = modal.querySelector('.modal-content');
        
        // Update modal content
        const coinIcon = modal.querySelector('.coin-icon-large');
        const coinName = modal.querySelector('.coin-name-large');
        
        if (coinIcon) {
            coinIcon.innerHTML = `<img src="${coin.icon}" alt="${coin.name}" onerror="this.src='https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'">`;
        }
        
        if (coinName) {
            coinName.textContent = coin.name;
        }

        // Update tab contents
        this.updateInvestmentTab(coin);
        this.updateMarketTab(coin);
        this.updateStrategyTab(coin);

        // Show first tab by default
        const tabs = modal.querySelectorAll('.tab-btn');
        const contents = modal.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));
        
        tabs[0]?.classList.add('active');
        contents[0]?.classList.add('active');

        // Update footer
        const updateTime = modal.querySelector('.update-time');
        if (updateTime) {
            updateTime.textContent = new Date().toLocaleTimeString();
        }

        // Show modal with animation
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        // Handle close button
        const closeButton = modal.querySelector('.close-button');
        if (closeButton) {
            const closeModal = () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 300);
                closeButton.removeEventListener('click', closeModal);
            };
            closeButton.addEventListener('click', closeModal);
        }

        // Handle tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                modal.querySelector(`.tab-content[data-tab="${target}"]`)?.classList.add('active');
            });
        });

        // Handle click outside to close
        const handleOutsideClick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 300);
                modal.removeEventListener('click', handleOutsideClick);
            }
        };
        modal.addEventListener('click', handleOutsideClick);
    }

    updateInvestmentTab(coin) {
        const tab = document.querySelector('.tab-content[data-tab="investment"]');
        if (!tab) return;

        const momentum = Math.abs(coin.priceChange);
        const momentumClass = momentum >= 10 ? 'exceptional' : momentum >= 5 ? 'strong' : 'moderate';
        
        tab.innerHTML = `
            <div class="investment-overview">
                <div class="momentum-section">
                    <h3 class="section-title">Momentum Analysis</h3>
                    <div class="momentum-indicator ${momentumClass}">
                        ${coin.priceChange >= 0 ? '🎰 High Roll' : '⚠️ Low Roll'} Momentum
                    </div>
                    <p class="momentum-description">
                        ${coin.name} is showing ${momentumClass} momentum with a ${Math.abs(coin.priceChange).toFixed(2)}% move in the past ${this.timeframe}.
                    </p>
                </div>
                <div class="key-metrics">
                    <div class="metric-box">
                        <span class="metric-title">Current Stake</span>
                        <span class="metric-value">$${coin.price.toFixed(6)}</span>
                    </div>
                    <div class="metric-box">
                        <span class="metric-title">House Value</span>
                        <span class="metric-value">$${this.formatNumber(coin.marketCap)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateMarketTab(coin) {
        const tab = document.querySelector('.tab-content[data-tab="market"]');
        if (!tab) return;

        tab.innerHTML = `
            <div class="market-overview">
                <div class="market-section">
                    <h3 class="section-title">Market Position</h3>
                    <div class="market-stats">
                        <div class="stat-row">
                            <span class="stat-label">Liquidity</span>
                            <span class="stat-value">$${this.formatNumber(coin.liquidity)}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Price Movement</span>
                            <span class="stat-value ${coin.priceChange >= 0 ? 'positive' : 'negative'}">
                                ${coin.priceChange >= 0 ? '↗' : '↘'} ${Math.abs(coin.priceChange).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateStrategyTab(coin) {
        const tab = document.querySelector('.tab-content[data-tab="strategy"]');
        if (!tab) return;

        const momentum = Math.abs(coin.priceChange);
        const riskLevel = momentum >= 15 ? 'High' : momentum >= 8 ? 'Moderate' : 'Low';
        
        tab.innerHTML = `
            <div class="strategy-overview">
                <div class="strategy-section">
                    <h3 class="section-title">Trading Strategy</h3>
                    <div class="strategy-points">
                        <div class="strategy-point">
                            <span class="point-title">Risk Level</span>
                            <span class="point-value">${riskLevel}</span>
                            <p class="point-description">
                                Based on current volatility and market conditions
                            </p>
                        </div>
                        <div class="strategy-point">
                            <span class="point-title">Key Levels</span>
                            <div class="levels-grid">
                                <div class="level-item">
                                    <span class="level-label">Current</span>
                                    <span class="level-value">$${coin.price.toFixed(6)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async initializeHighRollers() {
        try {
            const spinner = document.querySelector('.slot-spinner');
            const spinButton = document.querySelector('.spin-button');
            const slotFrame = document.querySelector('.slot-frame');
            
            if (!spinner || !spinButton || !slotFrame) {
                console.error('Required elements for slot machine not found');
                return;
            }

            // Add loading state
            spinner.classList.add('loading');
            slotFrame.classList.add('loading');
            spinButton.disabled = true;

            // Check cache first
            const now = Date.now();
            if (this.topWallets.length > 0 && (now - this.lastWalletFetch) < this.CACHE_DURATION) {
                // Use cached data
                this.showInitialWallets(spinner, slotFrame, spinButton);
                return;
            }

            try {
                // Fetch fresh data with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(`${this.apiEndpoint}/top-traders/all?expandPnl=true&sortBy=total&limit=10`, {
                    headers: {
                        'x-api-key': this.apiKey,
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }

                const data = await response.json();
                console.log('API Response:', data);

                // Process API data or use fallback
                if (data && (Array.isArray(data) || data.wallets)) {
                    const wallets = Array.isArray(data) ? data : data.wallets;
                    
                    if (wallets && wallets.length > 0) {
                        this.topWallets = wallets.map(wallet => {
                            const summary = wallet.summary || wallet.stats || {};
                            const pnl = wallet.pnl || summary.pnl || {};
                            
                            // Ensure we have numeric values
                            const realized = parseFloat(pnl.realized || summary.realized) || 0;
                            const unrealized = parseFloat(pnl.unrealized || summary.unrealized) || 0;
                            const totalWins = parseInt(summary.totalWins) || Math.floor(Math.random() * 100) + 50;
                            const totalLosses = parseInt(summary.totalLosses) || Math.floor(Math.random() * 50) + 10;
                            
                            return {
                                wallet: wallet.wallet || wallet.address,
                                summary: {
                                    realized: realized,
                                    unrealized: unrealized,
                                    total: realized + unrealized,
                                    totalInvested: parseFloat(summary.totalInvested) || Math.floor(Math.random() * 5000000) + 1000000,
                                    totalWins: totalWins,
                                    totalLosses: totalLosses,
                                    winPercentage: ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1),
                                    lossPercentage: ((totalLosses / (totalWins + totalLosses)) * 100).toFixed(1)
                                }
                            };
                        });
                        this.lastWalletFetch = now;
                    }
                }

                // If no valid data from API, use fallback
                if (!this.topWallets || this.topWallets.length === 0) {
                    console.warn('Using fallback data');
                    this.topWallets = this.generateFallbackData();
                }

            } catch (error) {
                console.error('Error fetching wallet data:', error);
                this.topWallets = this.generateFallbackData();
            }

            // Show wallets regardless of data source
            this.showInitialWallets(spinner, slotFrame, spinButton);

        } catch (error) {
            console.error('Error in initializeHighRollers:', error);
            this.topWallets = this.generateFallbackData();
            this.showInitialWallets(spinner, slotFrame, spinButton);
        }
    }

    showInitialWallets(spinner, slotFrame, spinButton) {
        // Remove loading state
        spinner.classList.remove('loading');
        slotFrame.classList.remove('loading');
        
        // Create initial slot items immediately
        this.createSlotItems();
        spinButton.disabled = false;
    }

    generateFallbackData() {
        return Array.from({ length: 10 }, (_, i) => {
            // Generate more realistic values with wider ranges
            const realized = Math.random() > 0.5 ? 
                Math.floor(Math.random() * 1000000) + 50000 : 
                -Math.floor(Math.random() * 500000);
            const unrealized = Math.random() > 0.5 ? 
                Math.floor(Math.random() * 500000) + 25000 : 
                -Math.floor(Math.random() * 250000);
            const totalInvested = Math.floor(Math.random() * 5000000) + 1000000;
            const totalWins = Math.floor(Math.random() * 100) + 50;
            const totalLosses = Math.floor(Math.random() * 50) + 10;
            
            // Calculate total PNL
            const total = realized + unrealized;
            
            return {
                wallet: `Wallet${i + 1}`,
                summary: {
                    realized: realized,
                    unrealized: unrealized,
                    total: total,
                    totalInvested: totalInvested,
                    totalWins: totalWins,
                    totalLosses: totalLosses,
                    winPercentage: ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1),
                    lossPercentage: ((totalLosses / (totalWins + totalLosses)) * 100).toFixed(1)
                }
            };
        });
    }

    createSlotItems() {
        const spinner = document.querySelector('.slot-spinner');
        if (!spinner) return;

        // Clear existing items
        spinner.innerHTML = '';

        // Create initial visible wallets (showing 3 by default)
        const initialWallets = this.topWallets.slice(0, 3);
        
        // Add items with staggered animation
        initialWallets.forEach((wallet, index) => {
            const item = this.createWalletItem(wallet);
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            spinner.appendChild(item);
            
            // Trigger animation after a brief delay
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    createWalletItem(wallet) {
        const item = document.createElement('div');
        item.className = 'slot-item';
        
        const walletIndex = this.topWallets.indexOf(wallet);
        const rankEmoji = this.getHighRollerEmoji(walletIndex);
        const walletAddress = wallet.wallet || 'Unknown Wallet';
        const formattedAddress = this.formatAddress(walletAddress);
        
        const summary = wallet.summary || {};
        const totalValue = Number(summary.total) || 0;
        const isPositive = totalValue >= 0;
        const formattedValue = this.formatNumber(Math.abs(totalValue));
        
        item.innerHTML = `
            <div class="wallet-rank">${rankEmoji} #${walletIndex + 1}</div>
            <div class="wallet-info">
                <div class="wallet-address">${formattedAddress}</div>
                <div class="wallet-profit ${isPositive ? 'positive' : 'negative'}">
                    ${isPositive ? '+' : '-'}$${formattedValue}
                    </div>
                </div>
            `;

        return item;
    }

    async spin() {
        if (this.isSpinning) return;
        
        const spinner = document.querySelector('.slot-spinner');
        const spinButton = document.querySelector('.spin-button');
        if (!spinner || !spinButton) return;
        
        this.isSpinning = true;
        spinButton.disabled = true;
        spinButton.style.opacity = '0.5';

        // Create a longer strip of wallets for the spinning animation
        const spinWallets = [
            ...this.topWallets,
            ...this.topWallets,
            ...this.topWallets.slice(0, 3)
        ];

        // Prepare all items before animation starts
        spinner.innerHTML = '';
        spinWallets.forEach(wallet => {
            const item = this.createWalletItem(wallet);
            spinner.appendChild(item);
        });

        // Force a reflow before starting animation
        spinner.offsetHeight;
        
        // Start spinning animation
        spinner.classList.add('spinning');
        
        // Select winner during spin
        const winnerIndex = Math.floor(Math.random() * this.topWallets.length);
        const winner = this.topWallets[winnerIndex];

        // Wait for spin animation to complete
        await new Promise(resolve => setTimeout(resolve, this.spinDuration));

        // Prepare final state
        spinner.classList.remove('spinning');
        spinner.innerHTML = '';
        
        // Show final state with winner
        const finalItems = [];
        for (let i = 0; i < 3; i++) {
            const wallet = this.topWallets[(winnerIndex + i) % this.topWallets.length];
            const item = this.createWalletItem(wallet);
            if (i === 0) {
                        item.classList.add('winner');
                item.style.cursor = 'default'; // Remove pointer cursor since it's automatic now
            }
            finalItems.push(item);
        }

        // Add items with staggered animation
        finalItems.forEach((item, i) => {
            item.style.animation = `fadeIn 0.5s ${i * 0.2}s forwards`;
            spinner.appendChild(item);
        });

        // Add winner effects and show modal automatically
        if (finalItems[0]) {
            setTimeout(() => {
                finalItems[0].classList.add('highlight-landing');
                
                // Show modal automatically after a brief delay
                setTimeout(() => {
                    this.showDetailedWalletInfo(winner);
                }, 800);

                setTimeout(() => {
                    finalItems[0].classList.remove('highlight-landing');
                }, 800);
            }, 100);
        }

        // Reset state after cooldown
        setTimeout(() => {
            this.isSpinning = false;
            spinButton.disabled = false;
            spinButton.style.opacity = '1';
            spinButton.classList.add('ready-to-spin');
        }, 1200);
    }

    getHighRollerEmoji(index) {
        const emojis = ['👑', '🎯', '💫', '🎲', '🎰', '💎', '🏆', '⭐', '🌟', '✨'];
        return emojis[index] || emojis[0];
    }

    async showDetailedWalletInfo(wallet) {
        try {
            const summary = wallet.summary || {};
            const totalPnl = parseFloat(summary.total) || 0;
            const realizedPnl = parseFloat(summary.realized) || 0;
            const unrealizedPnl = parseFloat(summary.unrealized) || 0;
            const totalWins = parseInt(summary.totalWins) || 0;
            const totalLosses = parseInt(summary.totalLosses) || 0;
            const totalTrades = totalWins + totalLosses;
            const winRate = totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(1) : '0.0';
            
            let modal = document.querySelector('.wallet-detail-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.className = 'wallet-detail-modal';
                document.body.appendChild(modal);
            }
            
            const formattedAddress = this.formatAddress(wallet.wallet || 'Unknown');
            const formattedTotal = this.formatNumber(Math.abs(totalPnl));
            const formattedRealized = this.formatNumber(Math.abs(realizedPnl));
            const formattedUnrealized = this.formatNumber(Math.abs(unrealizedPnl));

            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>🎰 High Roller Details</h2>
                        <button class="close-button" aria-label="Close modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="wallet-stats-grid">
                            <div class="stat-box expanded">
                                <div class="stat-label">Wallet Address</div>
                                <div class="wallet-address">
                                    ${formattedAddress}
                                    <span class="copy-icon" title="Copy address">📋</span>
                                </div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-label">Total PNL</div>
                                <div class="stat-value ${totalPnl >= 0 ? 'positive' : 'negative'}">
                                    ${totalPnl >= 0 ? '+' : '-'}$${formattedTotal}
                                </div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-label">Win Rate</div>
                                <div class="stat-value ${parseFloat(winRate) >= 50 ? 'positive' : 'negative'}">${winRate}%</div>
                            </div>
                            </div>
                        <div class="wallet-activity">
                            <h3>Performance Summary</h3>
                            <div class="activity-timeline">
                                <div class="timeline-item">
                                    <span class="activity-label">Realized PNL</span>
                                    <span class="activity-value ${realizedPnl >= 0 ? 'highlight-positive' : 'highlight-negative'}">
                                        ${realizedPnl >= 0 ? '+' : '-'}$${formattedRealized}
                                    </span>
                                </div>
                                <div class="timeline-item">
                                    <span class="activity-label">Unrealized PNL</span>
                                    <span class="activity-value ${unrealizedPnl >= 0 ? 'highlight-positive' : 'highlight-negative'}">
                                        ${unrealizedPnl >= 0 ? '+' : '-'}$${formattedUnrealized}
                                    </span>
                            </div>
                                <div class="timeline-item">
                                    <span class="activity-label">Total Trades</span>
                                    <span class="activity-value">${totalTrades}</span>
                            </div>
                                <div class="timeline-item">
                                    <span class="activity-label">Win/Loss</span>
                                    <span class="activity-value">
                                        <span class="highlight-positive">${totalWins}W</span> / 
                                        <span class="highlight-negative">${totalLosses}L</span>
                                    </span>
                        </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Show modal with animation
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });

            // Handle close button
            const closeButton = modal.querySelector('.close-button');
            const closeModal = () => {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 500);
            };

            // Copy wallet address functionality
            const copyButton = modal.querySelector('.copy-icon');
            const addressToCopy = wallet.wallet || '';
            copyButton.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(addressToCopy);
                copyButton.textContent = '✓';
                    copyButton.style.background = 'rgba(74, 222, 128, 0.2)';
                    setTimeout(() => {
                        copyButton.textContent = '📋';
                        copyButton.style.background = '';
                    }, 1000);
                } catch (error) {
                    console.error('Failed to copy address:', error);
                }
            };

            closeButton.onclick = closeModal;
            modal.onclick = (e) => {
                if (e.target === modal) closeModal();
            };

            document.addEventListener('keydown', function handleEscape(e) {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', handleEscape);
                }
            });

        } catch (error) {
            console.error('Error showing wallet details:', error);
        }
    }

    async initializeSlotMachine() {
        const spinButton = document.querySelector('.spin-button');
        if (spinButton) {
            spinButton.addEventListener('click', () => this.spin());
        }
        await this.fetchTopWallets();
        this.createSlotItems();
    }

    async fetchTopWallets() {
        try {
            // Get the first token from our tracked coins for demonstration
            const token = this.coins[0]?.mint || 'So11111111111111111111111111111111111111112';
            const response = await fetch(`${this.apiEndpoint}/tokens/${token}/holders/top`, {
                headers: {
                    'x-api-key': this.apiKey
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch top wallets');
            
            const data = await response.json();
            this.topWallets = data.slice(0, 10).map((wallet, index) => ({
                address: wallet.address,
                amount: wallet.amount,
                value: wallet.value,
                rank: index + 1
            }));
        } catch (error) {
            console.error('Error fetching top wallets:', error);
            // Fallback data
            this.topWallets = Array.from({ length: 10 }, (_, i) => ({
                address: `Wallet${i + 1}`,
                amount: Math.random() * 1000000,
                value: { usd: Math.random() * 100000 },
                rank: i + 1
            }));
        }
    }

    formatAddress(address) {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }

    // Add helper method to get total supply
    async fetchTokenSupply(tokenMint) {
        try {
            const response = await fetch(`${this.apiEndpoint}/tokens/${tokenMint}/supply`, {
                headers: {
                    'x-api-key': this.apiKey
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch token supply');
            
            const data = await response.json();
            return data.supply || 100000000; // Fallback to 100M if not available
        } catch (error) {
            console.error('Error fetching token supply:', error);
            return 100000000; // Fallback value
        }
    }

    // Helper method to safely parse numbers
    parseNumber(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return parseFloat(value) || 0;
        return 0;
    }

    // Helper method to calculate win percentage
    calculateWinPercentage(wins, losses) {
        const totalTrades = this.parseNumber(wins) + this.parseNumber(losses);
        if (totalTrades === 0) return '0.0';
        return ((this.parseNumber(wins) / totalTrades) * 100).toFixed(1);
    }

    // Helper method to calculate loss percentage
    calculateLossPercentage(wins, losses) {
        const totalTrades = this.parseNumber(wins) + this.parseNumber(losses);
        if (totalTrades === 0) return '0.0';
        return ((this.parseNumber(losses) / totalTrades) * 100).toFixed(1);
    }
}

class LoadingScreen {
    constructor() {
        this.loadingScreen = document.querySelector('.loading-screen');
        this.progressFill = document.querySelector('.progress-fill');
        this.progressPercentage = document.querySelector('.progress-percentage');
        this.reels = document.querySelectorAll('.reel');
        this.appContainer = document.querySelector('.app-container');
        this.progress = 0;
        this.isLoading = true;
        
        // Enhanced casino symbols with more variety
        this.symbols = ['🎰', '💎', '🎲', '7️⃣', '🎯', '🏆', '💫', '⭐️', '🌟', '👑'];
        
        // Premium loading states with more detailed messages
        this.loadingStates = [
            {
                message: 'Initializing VIP Experience',
                subtext: 'Preparing your exclusive interface',
                progress: 15,
                icon: '✨'
            },
            {
                message: 'Loading Premium Assets',
                subtext: 'Crafting your personalized dashboard',
                progress: 35,
                icon: '💎'
            },
            {
                message: 'Optimizing Performance',
                subtext: 'Enhancing your trading experience',
                progress: 60,
                icon: '⚡️'
            },
            {
                message: 'Synchronizing Markets',
                subtext: 'Connecting to real-time data feeds',
                progress: 75,
                icon: '🔄'
            },
            {
                message: 'Final Preparations',
                subtext: 'Adding premium finishing touches',
                progress: 90,
                icon: '🎯'
            },
            {
                message: 'Welcome High Roller!',
                subtext: 'Your premium experience awaits',
                progress: 100,
                icon: '👑'
            }
        ];
        
        this.initialize();
    }
    
    initialize() {
        this.setupPremiumBackground();
        this.animateReels();
        this.simulateLoading();
        this.initializeLottieAnimation();
        this.addParticleEffects();
    }
    
    setupPremiumBackground() {
        // Add dynamic background effect
        const gradient = document.createElement('div');
        gradient.className = 'premium-gradient';
        this.loadingScreen.appendChild(gradient);
        
        // Add floating casino chips
        for (let i = 0; i < 5; i++) {
            const chip = document.createElement('div');
            chip.className = 'floating-chip';
            chip.style.setProperty('--delay', `${i * 1.5}s`);
            chip.style.setProperty('--position', `${Math.random() * 100}%`);
            this.loadingScreen.appendChild(chip);
        }
    }
    
    animateReels() {
        this.reels.forEach((reel, index) => {
            this.spinReel(reel, index * 150);
        });
    }
    
    spinReel(reel, delay) {
        setTimeout(() => {
            let currentIndex = 0;
            const spinInterval = setInterval(() => {
                // Add blur effect during spin
                reel.style.filter = 'blur(1px)';
                
                // Update symbol with smooth transition
                reel.textContent = this.symbols[currentIndex];
                currentIndex = (currentIndex + 1) % this.symbols.length;
                
                // Add 3D rotation effect
                reel.style.transform = 'rotateX(360deg) scale(1.1)';
                
                setTimeout(() => {
                    reel.style.filter = 'none';
                    reel.style.transform = 'rotateX(0) scale(1)';
                }, 300);
            }, 2000);
            
            // Store interval for cleanup
            this.intervals = this.intervals || [];
            this.intervals.push(spinInterval);
        }, delay);
    }
    
    simulateLoading() {
        let stateIndex = 0;
        const updateState = () => {
            if (stateIndex < this.loadingStates.length && this.isLoading) {
                const state = this.loadingStates[stateIndex];
                this.updateLoadingState(state);
                stateIndex++;
                
                if (stateIndex < this.loadingStates.length) {
                    setTimeout(updateState, 2000);
                } else {
                    this.finishLoading();
                }
            }
        };
        
        updateState();
    }
    
    updateLoadingState(state) {
        const loadingText = document.querySelector('.loading-text');
        const loadingSubtext = document.querySelector('.loading-subtext');
        
        // Fade out current text
        loadingText.style.opacity = '0';
        loadingSubtext.style.opacity = '0';
        
        setTimeout(() => {
            // Update content with icon
            loadingText.innerHTML = `${state.icon} ${state.message}`;
            loadingSubtext.textContent = state.subtext;
            
            // Animate progress
            this.animateProgress(state.progress);
            
            // Fade in new text with golden glow effect
            loadingText.style.opacity = '1';
            loadingText.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
            loadingSubtext.style.opacity = '1';
        }, 300);
    }
    
    animateProgress(targetProgress) {
        const startProgress = this.progress;
        const duration = 1000;
        const startTime = performance.now();
        
        const updateProgress = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            this.progress = startProgress + (targetProgress - startProgress) * this.easeOutCubic(progress);
            
            if (this.progressFill) {
                this.progressFill.style.width = `${this.progress}%`;
                this.progressFill.style.boxShadow = `0 0 10px rgba(255, 215, 0, ${progress * 0.5})`;
            }
            
            if (this.progressPercentage) {
                this.progressPercentage.textContent = `${Math.round(this.progress)}%`;
                this.progressPercentage.style.color = `rgba(255, 215, 0, ${0.5 + progress * 0.5})`;
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            }
        };
        
        requestAnimationFrame(updateProgress);
    }
    
    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }
    
    addParticleEffects() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        this.loadingScreen.appendChild(particleContainer);
        
        // Add glowing particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.setProperty('--delay', `${Math.random() * 5}s`);
            particle.style.setProperty('--size', `${Math.random() * 10 + 5}px`);
            particleContainer.appendChild(particle);
        }
    }
    
    initializeLottieAnimation() {
        const animation = lottie.loadAnimation({
            container: document.getElementById('lottie-animation'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'Animation - 1738866464842.json',
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice',
                progressiveLoad: true,
                hideOnTransparent: true,
                className: 'premium-lottie'
            }
        });
        
        animation.setSpeed(0.8);
        
        // Add glow effect to Lottie animation
        const lottieContainer = document.getElementById('lottie-animation');
        lottieContainer.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))';
    }
    
    finishLoading() {
        // Add final flourish animation
        const finalAnimation = document.createElement('div');
        finalAnimation.className = 'final-flourish';
        this.loadingScreen.appendChild(finalAnimation);
        
        setTimeout(() => {
            this.isLoading = false;
            this.loadingScreen.classList.add('fade-out');
            
            // Clean up intervals
            this.intervals.forEach(interval => clearInterval(interval));
            
            // Transition to app with premium effect
            setTimeout(() => {
                this.appContainer.classList.remove('hidden');
                requestAnimationFrame(() => {
                    this.appContainer.classList.add('show');
                    this.appContainer.style.transform = 'scale(1)';
                    this.appContainer.style.opacity = '1';
                });
                
                // Initialize main app
                setTimeout(() => {
                    this.loadingScreen.style.display = 'none';
                    new CoinTracker();
                }, 1000);
            }, 800);
        }, 500);
    }
}

// Initialize loading screen when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LoadingScreen();
});

// Loading Screen Handler
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const appContainer = document.querySelector('.app-container');
    const loadingText = document.querySelector('.loading-text');
    const loadingSubtext = document.querySelector('.loading-subtext');
    const brandText = document.querySelector('.brand-text');
    const lottieContainer = document.querySelector('.lottie-container');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');

    if (!loadingScreen || !appContainer || !loadingText || !loadingSubtext || !lottieContainer) {
        console.error('Required elements not found');
        return;
    }

    // Initialize Lottie animation with enhanced settings
    const animation = lottie.loadAnimation({
        container: document.getElementById('lottie-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'Animation - 1738866464842.json',
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
            progressiveLoad: true,
            hideOnTransparent: true,
            className: 'lottie-svg'
        }
    });

    // Enhanced loading states with more sophisticated messages
    const loadingStates = [
        { 
            message: 'Initializing...', 
            subtext: 'Preparing your premium experience',
            progress: 15
        },
        { 
            message: 'Loading Assets...', 
            subtext: 'Creating your personalized interface',
            progress: 35
        },
        { 
            message: 'Optimizing...', 
            subtext: 'Enhancing your gaming experience',
            progress: 60
        },
        { 
            message: 'Final Touches...', 
            subtext: 'Polishing your grand entrance',
            progress: 85
        },
        { 
            message: 'Welcome High Roller!', 
            subtext: 'Your premium experience awaits',
            progress: 100
        }
    ];

    // Show brand text with enhanced animation after animation starts
    animation.addEventListener('DOMLoaded', () => {
        setTimeout(() => {
            lottieContainer.style.transform = 'scale(1.2)';
        if (brandText) {
            brandText.style.opacity = '1';
            brandText.style.transform = 'translateY(0)';
        }
        }, 300);
    });

    // Update loading messages with smoother transitions and progress updates
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        if (messageIndex < loadingStates.length) {
            const state = loadingStates[messageIndex];
            
            // Fade out current message
            loadingText.style.opacity = '0';
            loadingSubtext.style.opacity = '0';
            
            setTimeout(() => {
                // Update text content
                loadingText.textContent = state.message;
                loadingSubtext.textContent = state.subtext;
                
                // Update progress bar with smooth animation
                if (progressFill) {
                    progressFill.style.width = `${state.progress}%`;
                    if (progressPercentage) {
                        animatePercentage(state.progress);
                    }
                }
                
                // Fade in new message
                loadingText.style.opacity = '1';
                loadingSubtext.style.opacity = '1';
                messageIndex++;
            }, 300);
        } else {
            clearInterval(messageInterval);
            // Start transition to main app
            transitionToApp();
        }
    }, 2000);

    // Animate percentage counter
    function animatePercentage(targetPercentage) {
        const duration = 1000; // 1 second
        const startTime = performance.now();
        const startValue = parseInt(progressPercentage.textContent) || 0;

        function updatePercentage(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentValue = Math.round(startValue + (targetPercentage - startValue) * progress);
            progressPercentage.textContent = `${currentValue}%`;

            if (progress < 1) {
                requestAnimationFrame(updatePercentage);
            }
        }

        requestAnimationFrame(updatePercentage);
    }

    // Enhanced transition to main app with smoother animation sequence
    function transitionToApp() {
        // Complete progress bar
        if (progressFill) {
            progressFill.style.width = '100%';
            if (progressPercentage) {
                animatePercentage(100);
            }
        }

        // Add final transition class
        loadingScreen.classList.add('fade-out');
        
        // Begin exit animation sequence
        setTimeout(() => {
            // Fade out loading screen elements in sequence
            const elements = [
                document.querySelector('.loading-cards'),
                document.querySelector('.loading-status'),
                document.querySelector('.lottie-container'),
                document.querySelector('.casino-chips-decoration')
            ];

            elements.forEach((element, index) => {
                if (element) {
                    setTimeout(() => {
                        element.style.opacity = '0';
                        element.style.transform = 'translateY(-20px)';
                    }, index * 150);
                }
            });

            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.visibility = 'hidden';
                
                // Transition to app container with enhanced timing
                setTimeout(() => {
            appContainer.classList.remove('hidden');
            
            // Create smooth fade-in sequence
            requestAnimationFrame(() => {
                appContainer.classList.add('show');
                
                // Initialize the main app
                new CoinTracker();
            });
                }, 800);
        }, 1000);
        }, 500);
    }
}); 
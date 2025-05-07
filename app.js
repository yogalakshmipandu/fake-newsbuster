document.addEventListener('DOMContentLoaded', function() {
    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    }

    console.log('DOM Content Loaded'); // Debug log

    // Get DOM elements
    const urlInput = document.getElementById('urlInput');
    const checkButton = document.getElementById('checkButton');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreElement = document.getElementById('score');
    const titleElement = document.getElementById('title');
    const domainElement = document.getElementById('domain');
    const analysisElement = document.getElementById('analysis');
    const indicatorsList = document.getElementById('indicators');

    // Verify all elements are found
    if (!urlInput || !checkButton || !loading || !results || !error || !scoreCircle || 
        !scoreElement || !titleElement || !domainElement || !analysisElement || !indicatorsList) {
        console.error('Some DOM elements were not found');
        return;
    }

    console.log('All DOM elements found'); // Debug log

    // Set initial state
    loading.classList.add('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');

    // Add cache object at the top of the file, after DOM elements
    const analysisCache = {};

    // Add click handler for check button
    checkButton.addEventListener('click', function() {
        const url = urlInput.value.trim();
        if (!url) {
            showError('Please enter a URL');
            return;
        }
        analyzeArticle(url);
    });

    // Add enter key handler for input
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkButton.click();
        }
    });

    async function analyzeArticle(url) {
        // Check cache first
        if (analysisCache[url]) {
            const cachedResponse = analysisCache[url];
            updateUIWithResults(cachedResponse);
            return;
        }

        // Show loading state
        loading.classList.remove('hidden');
        results.classList.add('hidden');
        error.classList.add('hidden');

        try {
            // Use simulateAnalysis instead of real implementation
            const response = await simulateAnalysis(url);
            
            // Cache the results
            analysisCache[url] = response;
            
            // Update UI with results
            updateUIWithResults(response);
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to analyze article. Please try again.');
        }
    }

    function updateUIWithResults(response) {
        const analysis = response.analysis;
        scoreElement.textContent = analysis.score.toFixed(1);
        titleElement.textContent = response.title || 'Unknown Title';
        domainElement.textContent = response.domain;
        
        // Set score circle color
        scoreCircle.className = `w-32 h-32 rounded-full flex items-center justify-center mx-auto text-white text-5xl font-bold shadow-lg bg-${analysis.color}-500`;
        
        // Generate analysis text
        const analysisText = generateAnalysis(analysis);
        analysisElement.textContent = analysisText;

        // Update indicators list
        updateIndicatorsList(analysis.indicators);

        // Show results
        loading.classList.add('hidden');
        results.classList.remove('hidden');
    }

    function simulateAnalysis(url) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Use URL as seed for consistent random values
                const seed = url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const random = new Math.seedrandom(seed);
                
                const hasAuthor = random() > 0.3;
                const indicators = {
                    hasAuthor: hasAuthor,
                    isTrustedAuthor: hasAuthor && random() > 0.3, // Only true if hasAuthor is true
                    hasDate: random() > 0.3,
                    hasReferences: random() > 0.3,
                    hasImages: random() > 0.3
                };

                const score = calculateScore(indicators);
                const color = score > 70 ? 'green' : score > 30 ? 'yellow' : 'red';

                resolve({
                    title: 'Sample Article Title',
                    domain: new URL(url).hostname,
                    analysis: {
                        score,
                        indicators,
                        color
                    }
                });
            }, 1500); // Simulate API delay
        });
    }

    function calculateScore(indicators) {
        let score = 0;
        const weights = {
            hasAuthor: 25,
            isTrustedAuthor: 35,
            hasDate: 20,
            hasReferences: 20,
            hasImages: 5
        };

        for (const [indicator, value] of Object.entries(indicators)) {
            if (value) {
                score += weights[indicator];
            }
        }

        return Math.min(score, 100);
    }

    function generateAnalysis(analysis) {
        const score = analysis.score;
        if (score > 70) {
            return "This article is highly credible. It meets most of our credibility standards including proper sourcing, author attribution, and factual reporting.";
        } else if (score >= 30) {
            return "This article has moderate credibility. While it has some reliable elements, we recommend verifying important claims with additional sources.";
        } else {
            return "This article has low credibility. It lacks important credibility markers. We strongly recommend cross-checking the information with other sources.";
        }
    }

    function updateIndicatorsList(indicators) {
        indicatorsList.innerHTML = '';
        const indicatorLabels = {
            hasAuthor: 'Author Attribution',
            isTrustedAuthor: 'Trusted Author',
            hasDate: 'Publication Date',
            hasReferences: 'References & Sources',
            hasImages: 'Includes Images'
        };

        for (const [indicator, value] of Object.entries(indicators)) {
            const li = document.createElement('li');
            li.className = `flex items-center space-x-2 ${value ? 'text-green-600' : 'text-red-600'}`;
            
            const icon = document.createElement('span');
            icon.className = 'text-lg';
            icon.innerHTML = value ? '&#10004;' : '&#10008;';
            
            const text = document.createElement('span');
            text.textContent = indicatorLabels[indicator];
            
            li.appendChild(icon);
            li.appendChild(text);
            indicatorsList.appendChild(li);
        }
    }

    function showError(message) {
        loading.classList.add('hidden');
        results.classList.add('hidden');
        error.textContent = message || 'Error analyzing article. Please try again.';
        error.classList.remove('hidden');
    }
}); 
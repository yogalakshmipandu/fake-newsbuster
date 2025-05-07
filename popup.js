document.addEventListener('DOMContentLoaded', function() {
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

    // Set initial state
    loading.classList.add('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');

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

    function analyzeArticle(url) {
        // Show loading state
        loading.classList.remove('hidden');
        results.classList.add('hidden');
        error.classList.add('hidden');

        // Get the current tab's content
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]) {
                showError('No active tab found');
                return;
            }

            // Try to inject the content script if it's not already injected
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content.js']
            }).then(() => {
                // Send message to content script
                chrome.tabs.sendMessage(tabs[0].id, {action: "analyzeArticle"}, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error('Runtime error:', chrome.runtime.lastError);
                        showError('Error accessing page content. Please try again.');
                        return;
                    }

                    if (!response) {
                        showError('No response from content script');
                        return;
                    }

                    if (response.error) {
                        showError(response.error);
                        return;
                    }

                    // Update UI with results
                    const analysis = response.analysis;
                    scoreElement.textContent = analysis.score.toFixed(1);
                    titleElement.textContent = response.title || 'Unknown Title';
                    domainElement.textContent = response.domain;
                    
                    // Set score circle color
                    scoreCircle.className = `w-20 h-20 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold bg-${analysis.color}-500`;
                    
                    // Generate analysis text
                    const analysisText = generateAnalysis(analysis);
                    analysisElement.textContent = analysisText;

                    // Update indicators list
                    updateIndicatorsList(analysis.indicators);

                    // Display author details
                    displayAuthorDetails(response.authorDetails);

                    // Show results
                    loading.classList.add('hidden');
                    results.classList.remove('hidden');
                });
            }).catch(error => {
                console.error('Script injection error:', error);
                showError('Failed to analyze page. Please try again.');
            });
        });
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

    function displayAuthorDetails(authorDetails) {
        const authorElement = document.getElementById('author');
        const authorDetailsDiv = document.getElementById('authorDetails');
        const credentialsElement = document.getElementById('authorCredentials');
        const publicationsElement = document.getElementById('authorPublications');
        const expertiseElement = document.getElementById('authorExpertise');

        if (authorDetails) {
            authorElement.textContent = authorDetails.name;
            authorDetailsDiv.classList.remove('hidden');
            
            if (authorDetails.credentials) {
                credentialsElement.textContent = `Credentials: ${authorDetails.credentials.join(', ')}`;
            }
            
            if (authorDetails.publications) {
                publicationsElement.textContent = `Publications: ${authorDetails.publications.join(', ')}`;
            }
            
            if (authorDetails.expertise) {
                expertiseElement.textContent = `Expertise: ${authorDetails.expertise.join(', ')}`;
            }
        } else {
            authorElement.textContent = 'Unknown Author';
            authorDetailsDiv.classList.add('hidden');
        }
    }

    function showError(message) {
        loading.classList.add('hidden');
        results.classList.add('hidden');
        error.textContent = message || 'Error analyzing article. Please try again.';
        error.classList.remove('hidden');
    }
}); 
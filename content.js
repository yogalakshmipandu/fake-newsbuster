// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "analyzeArticle") {
        try {
            // Get the article content
            const articleContent = {
                title: document.title,
                text: document.body.innerText,
                url: window.location.href,
                domain: window.location.hostname
            };
            
            console.log('Article content:', articleContent); // Debug log
            
            // Perform basic analysis
            const analysis = analyzeContent(articleContent);
            console.log('Analysis results:', analysis); // Debug log
            
            // Send the content and analysis back to the popup
            sendResponse({
                ...articleContent,
                analysis: analysis
            });
        } catch (error) {
            console.error('Error in content script:', error);
            sendResponse({ error: 'Failed to get article content' });
        }
    }
    return true; // Required for async response
});

function analyzeContent(content) {
    console.log('Analyzing content for domain:', content.domain); // Debug log
    
    const indicators = {
        hasAuthor: checkForAuthor(content.text),
        isTrustedAuthor: content.is_trusted_author || false,
        hasDate: checkForDate(content.text),
        hasReferences: checkForReferences(content.text),
        hasImages: checkForImages()
    };
    
    console.log('Indicators:', indicators); // Debug log

    // Calculate score based on indicators
    const score = calculateScore(indicators);
    console.log('Calculated score:', score); // Debug log
    
    return {
        score: score,
        indicators: indicators,
        authorDetails: content.author_details,
        color: score > 70 ? 'green' : score > 30 ? 'yellow' : 'red'
    };
}

function checkForAuthor(text) {
    // Look for common author indicators
    const authorPatterns = [
        /by\s+[\w\s]+/i,
        /author:\s*[\w\s]+/i,
        /written\s+by\s+[\w\s]+/i
    ];
    return authorPatterns.some(pattern => pattern.test(text));
}

function checkForDate(text) {
    // Look for date patterns
    const datePatterns = [
        /\d{1,2}\s+\w+\s+\d{4}/,
        /\w+\s+\d{1,2},\s+\d{4}/,
        /\d{4}-\d{2}-\d{2}/
    ];
    return datePatterns.some(pattern => pattern.test(text));
}

function checkForReferences(text) {
    // Look for reference indicators
    const referencePatterns = [
        /source:/i,
        /according to/i,
        /as reported by/i,
        /studies show/i,
        /research indicates/i
    ];
    return referencePatterns.some(pattern => pattern.test(text));
}

function checkForImages() {
    // Check for images in the article content
    const articleContent = document.querySelector('article') || document.body;
    const images = articleContent.querySelectorAll('img');
    
    // Check if images exist and are not hidden
    const visibleImages = Array.from(images).filter(img => {
        const style = window.getComputedStyle(img);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               img.offsetWidth > 0 && 
               img.offsetHeight > 0;
    });
    
    console.log('Found images:', visibleImages.length); // Debug log
    return visibleImages.length > 0;
}

function calculateScore(indicators) {
    let score = 0;
    const weights = {
        hasAuthor: 25,
        isTrustedAuthor: 35,  // Increased weight for trusted authors
        hasDate: 20,
        hasReferences: 20,
        hasImages: 5
    };

    console.log('Starting score calculation with indicators:', indicators); // Debug log

    // Calculate weighted score
    for (const [indicator, value] of Object.entries(indicators)) {
        if (value) {
            score += weights[indicator];
            console.log(`Adding ${indicator} score: ${weights[indicator]}`); // Debug log
        }
    }

    console.log('Final score before cap:', score); // Debug log
    return Math.min(score, 100); // Cap at 100
}

function generateAnalysis(analysis) {
    const score = analysis.score;
    console.log('Generating analysis for score:', score); // Debug log
    
    if (score > 70) {
        return "This article is highly credible. It meets most of our credibility standards including proper sourcing, author attribution, and factual reporting.";
    } else if (score >= 30) {
        return "This article has moderate credibility. While it has some reliable elements, we recommend verifying important claims with additional sources.";
    } else {
        return "This article has low credibility. It lacks important credibility markers. We strongly recommend cross-checking the information with other sources.";
    }
} 
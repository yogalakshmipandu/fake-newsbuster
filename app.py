from flask import Flask, request, jsonify
from flask_cors import CORS
from scraper import scrape_article
from graph import get_credibility_score
import logging
from typing import Dict, Any

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_score_color(score: float) -> str:
    """
    Determine color based on credibility score.
    
    Args:
        score: Credibility score (0-100)
        
    Returns:
        Color string: 'green', 'yellow', or 'red'
    """
    if score > 70:
        return 'green'
    elif score >= 30:
        return 'yellow'
    else:
        return 'red'

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Analyze a news article for credibility.
    
    Request body (JSON):
    {
        "url": "string"  # URL of the article to analyze
    }
    
    Response (JSON):
    {
        "title": "string",      # Article title
        "domain": "string",     # Website domain
        "score": float,         # Credibility score (0-100)
        "color": "string",      # Score color (green/yellow/red)
        "error": "string"       # Error message if any
    }
    """
    try:
        # Get and validate request data
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({
                'error': 'URL is required in request body'
            }), 400

        url = data['url']
        logger.info(f"Analyzing article: {url}")

        # Scrape article data
        article_data = scrape_article(url)
        if 'error' in article_data:
            return jsonify({
                'error': f"Failed to scrape article: {article_data['error']}"
            }), 400

        # Get credibility score for the domain
        score = get_credibility_score(article_data['domain'])
        
        # Prepare response
        response = {
            'title': article_data['title'],
            'domain': article_data['domain'],
            'score': score,
            'color': get_score_color(score)
        }
        
        return jsonify(response)

    except Exception as e:
        logger.error(f"Error analyzing article: {str(e)}")
        return jsonify({
            'error': 'Internal server error'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000) 
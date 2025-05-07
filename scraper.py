from bs4 import BeautifulSoup
import requests
import logging
from typing import Dict, Any, List
from urllib.parse import urlparse
from .trusted_authors import TrustedAuthors

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ArticleScraper:
    def __init__(self):
        self.trusted_authors = TrustedAuthors()
        logger.info("ArticleScraper initialized")

    def analyze_article(self, url: str) -> Dict[str, Any]:
        """
        Analyze a news article by scraping its content and metadata.
        
        Args:
            url: The URL of the article to analyze
            
        Returns:
            Dictionary containing article content and metadata
        """
        try:
            logger.info(f"Analyzing article: {url}")
            
            # Fetch the webpage
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            # Parse the HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract article content
            author = self._extract_author(soup)
            logger.info(f"Extracted author: {author}")
            
            author_details = self.trusted_authors.get_author_details(author) if author else None
            is_trusted = self.trusted_authors.is_trusted_author(author) if author else False
            
            logger.info(f"Author details: {author_details}")
            logger.info(f"Is trusted author: {is_trusted}")
            
            article_content = {
                'title': self._extract_title(soup),
                'text': self._extract_text(soup),
                'author': author,
                'author_details': author_details,
                'is_trusted_author': is_trusted,
                'date': self._extract_date(soup),
                'source': url
            }
            
            return article_content
            
        except requests.RequestException as e:
            logger.error(f"Error fetching article: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error analyzing article: {str(e)}")
            raise

    def _extract_author(self, soup: BeautifulSoup) -> str:
        """Extract article author"""
        logger.info("Extracting author information")
        
        # Check for WHO specific patterns
        who_patterns = [
            "World Health Organization",
            "WHO",
            "World Health Organisation"
        ]
        
        # Check if any WHO pattern is in the text
        text = soup.get_text().lower()
        for pattern in who_patterns:
            if pattern.lower() in text:
                logger.info("Found WHO pattern in text")
                return "World Health Organization"
        
        # Common author selectors
        selectors = [
            '.author',
            '[itemprop="author"]',
            '.byline',
            'meta[name="author"]',
            '.article-meta__author',
            '.article-author',
            '.author-name',
            '.article__author',
            '.entry-author',
            '.post-author'
        ]
        
        for selector in selectors:
            author = soup.select_one(selector)
            if author:
                author_text = author.text.strip() if not author.name == 'meta' else author['content']
                logger.info(f"Found author using selector {selector}: {author_text}")
                return author_text
        
        logger.info("No author found")
        return ''

    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract article title"""
        title = soup.find('h1')
        return title.text.strip() if title else ''

    def _extract_text(self, soup: BeautifulSoup) -> str:
        """Extract main article text"""
        # Common article content selectors
        selectors = [
            'article p',
            '.article-content p',
            '.post-content p',
            'main p'
        ]
        
        for selector in selectors:
            paragraphs = soup.select(selector)
            if paragraphs:
                return ' '.join(p.text.strip() for p in paragraphs)
        
        return ''

    def _extract_date(self, soup: BeautifulSoup) -> str:
        """Extract article publication date"""
        # Common date selectors
        selectors = [
            'time',
            '.date',
            '[itemprop="datePublished"]',
            'meta[property="article:published_time"]'
        ]
        
        for selector in selectors:
            date = soup.select_one(selector)
            if date:
                return date.text.strip() if not date.name == 'meta' else date['content']
        
        return ''

def scrape_article(url: str) -> Dict[str, Any]:
    """
    Scrape a news article for its title, domain, and outbound links.
    
    Args:
        url: The URL of the article to scrape
        
    Returns:
        Dictionary containing:
        - title: Article title (string)
        - domain: Website domain (string)
        - links: List of outbound URLs (list of strings)
        - error: Error message if scraping fails (string, optional)
    """
    try:
        # Set timeout and headers for the request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Fetch the webpage with timeout
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse the HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract domain from URL
        domain = urlparse(url).netloc
        
        # Extract title
        title = _extract_title(soup)
        
        # Extract all links
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            # Convert relative URLs to absolute
            if href.startswith('/'):
                href = f"https://{domain}{href}"
            elif not href.startswith(('http://', 'https://')):
                continue
            links.append(href)
        
        return {
            'title': title,
            'domain': domain,
            'links': links
        }
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return {'error': f"Failed to fetch URL: {str(e)}"}
    except Exception as e:
        logger.error(f"Scraping error: {str(e)}")
        return {'error': f"Error scraping article: {str(e)}"} 
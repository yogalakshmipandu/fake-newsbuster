from typing import Dict, List, Optional
import json
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TrustedAuthors:
    def __init__(self):
        self.authors_file = os.path.join(os.path.dirname(__file__), "..", "data", "trusted_authors.json")
        self.authors: Dict[str, Dict] = self._load_authors()
        logger.info(f"Trusted authors loaded from: {self.authors_file}")

    def _load_authors(self) -> Dict[str, Dict]:
        """Load trusted authors from JSON file"""
        try:
            # Create data directory if it doesn't exist
            os.makedirs(os.path.dirname(self.authors_file), exist_ok=True)
            
            if not os.path.exists(self.authors_file):
                # Create default trusted authors if file doesn't exist
                default_authors = {
                    "who": {
                        "name": "World Health Organization",
                        "credentials": ["International Health Authority", "United Nations Specialized Agency"],
                        "publications": ["WHO Official Reports", "WHO Technical Series"],
                        "verification_status": "verified",
                        "expertise": ["Public Health", "Global Health", "Disease Prevention", "Health Policy"],
                        "social_media": {
                            "twitter": "@WHO",
                            "linkedin": "world-health-organization"
                        }
                    },
                    "bbc": {
                        "name": "BBC",
                        "credentials": ["Public Service Broadcaster", "International News Organization"],
                        "publications": ["BBC News", "BBC World Service"],
                        "verification_status": "verified",
                        "expertise": ["News", "Current Affairs", "International Reporting"],
                        "social_media": {
                            "twitter": "@BBC",
                            "linkedin": "bbc"
                        }
                    },
                    "india_today": {
                        "name": "India Today",
                        "credentials": ["Leading Indian News Organization", "Established Media House"],
                        "publications": ["India Today Magazine", "India Today Digital"],
                        "verification_status": "verified",
                        "expertise": ["Indian News", "Current Affairs", "Investigative Journalism"],
                        "social_media": {
                            "twitter": "@IndiaToday",
                            "linkedin": "india-today"
                        }
                    }
                }
                
                # Save default authors
                with open(self.authors_file, 'w', encoding='utf-8') as f:
                    json.dump(default_authors, f, indent=4)
                logger.info("Created default trusted authors file")
                return default_authors

            # Load existing authors
            with open(self.authors_file, 'r', encoding='utf-8') as f:
                authors = json.load(f)
                logger.info(f"Loaded {len(authors)} trusted authors")
                return authors
                
        except Exception as e:
            logger.error(f"Error loading trusted authors: {str(e)}")
            return {}

    def is_trusted_author(self, author_name: str) -> bool:
        """Check if an author is in the trusted list"""
        if not author_name:
            return False
            
        author_name = author_name.lower()
        for author in self.authors.values():
            if author["name"].lower() == author_name:
                logger.info(f"Found trusted author: {author_name}")
                return True
        logger.info(f"Author not found in trusted list: {author_name}")
        return False

    def get_author_details(self, author_name: str) -> Optional[Dict]:
        """Get detailed information about a trusted author"""
        if not author_name:
            return None
            
        author_name = author_name.lower()
        for author_id, author in self.authors.items():
            if author["name"].lower() == author_name:
                logger.info(f"Found author details for: {author_name}")
                return author
        logger.info(f"No author details found for: {author_name}")
        return None

    def add_trusted_author(self, author_id: str, author_data: Dict) -> None:
        """Add a new trusted author"""
        self.authors[author_id] = author_data
        self._save_authors()
        logger.info(f"Added new trusted author: {author_id}")

    def remove_trusted_author(self, author_id: str) -> None:
        """Remove a trusted author"""
        if author_id in self.authors:
            del self.authors[author_id]
            self._save_authors()
            logger.info(f"Removed trusted author: {author_id}")

    def _save_authors(self) -> None:
        """Save authors to JSON file"""
        try:
            with open(self.authors_file, 'w', encoding='utf-8') as f:
                json.dump(self.authors, f, indent=4)
            logger.info("Saved trusted authors to file")
        except Exception as e:
            logger.error(f"Error saving trusted authors: {str(e)}")

    def get_all_authors(self) -> List[Dict]:
        """Get list of all trusted authors"""
        return list(self.authors.values()) 
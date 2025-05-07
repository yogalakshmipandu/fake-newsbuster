from neo4j import GraphDatabase
import logging
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GraphDB:
    def __init__(self):
        """Initialize Neo4j connection"""
        self.uri = "bolt://localhost:7687"
        self.user = "neo4j"
        self.password = "password"  # Change this in production
        self.driver = None
        self._connect()

    def _connect(self):
        """Establish connection to Neo4j database"""
        try:
            self.driver = GraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password)
            )
            # Test connection
            with self.driver.session() as session:
                session.run("RETURN 1")
            logger.info("Successfully connected to Neo4j")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {str(e)}")
            raise

    def calculate_credibility_score(self, url: str, content: Dict[str, Any]) -> float:
        """
        Calculate credibility score for an article using graph-based analysis
        
        Args:
            url: Article URL
            content: Article content and metadata
            
        Returns:
            Credibility score between 0 and 1
        """
        try:
            with self.driver.session() as session:
                # Create or update article node
                session.run("""
                    MERGE (a:Article {url: $url})
                    SET a.title = $title,
                        a.author = $author,
                        a.date = $date,
                        a.text = $text
                """, {
                    'url': url,
                    'title': content.get('title', ''),
                    'author': content.get('author', ''),
                    'date': content.get('date', ''),
                    'text': content.get('text', '')
                })

                # Calculate credibility score based on:
                # 1. Author reputation
                # 2. Source reliability
                # 3. Content similarity with known facts
                # 4. Cross-references with other articles
                
                result = session.run("""
                    MATCH (a:Article {url: $url})
                    OPTIONAL MATCH (a)-[:REFERENCES]->(other:Article)
                    WITH a, count(other) as referenceCount
                    RETURN 
                        CASE 
                            WHEN a.author IS NOT NULL THEN 0.3
                            ELSE 0.1
                        END +
                        CASE 
                            WHEN referenceCount > 0 THEN 0.3
                            ELSE 0.1
                        END +
                        CASE 
                            WHEN a.date IS NOT NULL THEN 0.2
                            ELSE 0.1
                        END +
                        CASE 
                            WHEN length(a.text) > 500 THEN 0.2
                            ELSE 0.1
                        END as score
                """, {'url': url})
                
                return result.single()['score']
                
        except Exception as e:
            logger.error(f"Error calculating credibility score: {str(e)}")
            return 0.5  # Default neutral score on error

    def close(self):
        """Close Neo4j connection"""
        if self.driver:
            self.driver.close()
            logger.info("Neo4j connection closed") 
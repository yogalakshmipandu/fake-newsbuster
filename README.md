# Fake News Buster 🕵️‍♂️

A Chrome extension and an app that helps users identify potentially fake news by analyzing article credibility using graph-based scoring.

## Problem Statement

In today's digital age, misinformation spreads rapidly through social media and news websites. Recent examples include:
- "Rain cures COVID-19" hoax that spread across WhatsApp
- False claims about 5G causing coronavirus
- Misleading health advice during the pandemic

These fake news stories can have real-world consequences, from public health risks to social unrest.

## Our Solution

Fake News Buster is a Chrome extension that:
- Analyzes news articles in real-time
- Uses graph-based credibility scoring to identify unreliable sources
- Provides clear visual indicators (red/yellow/green) for article credibility
- Helps users make informed decisions about news sources

## Tech Stack

- **Backend**: Python 3.10, Flask 2.0
- **Database**: Neo4j (graph database)
- **Frontend**: JavaScript, Tailwind CSS
- **Web Scraping**: BeautifulSoup4

## Key Features

1. **Graph-Based Scoring**
   - Maps relationships between news sources
   - Calculates credibility based on source reputation
   - Identifies patterns of misinformation

2. **Real-Time Analysis**
   - Instant credibility assessment
   - Color-coded results (green/yellow/red)
   - Detailed analysis of article metadata

3. **User-Friendly Interface**
   - Simple URL input
   - Clear visual feedback
   - Detailed credibility breakdown

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install flask==2.0.0 beautifulsoup4 neo4j
   ```

2. **Set Up Neo4j**
   - Install Neo4j Desktop
   - Create a new database
   - Update connection details in `backend/graph.py`

3. **Start Backend**
   ```bash
   python backend/app.py
   ```

4. **Load Chrome Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension/` directory

## Demo Scenario

### Analyzing a Fake Article
```
URL: miraclecure.xyz/covid-cure
Result: 
- Score: 25/100 (Red)
- Analysis: "Exercise caution with this article. Some credibility indicators are missing or weak."
```

### Analyzing a BBC Article
```
URL: bbc.com/news/health
Result:
- Score: 85/100 (Green)
- Analysis: "This article appears to be highly credible. It has strong author attribution and proper citations."
```

## Innovation

Our solution stands out through:
- **Graph-Based Analysis**: Unlike traditional fact-checking tools that rely on keyword matching, we use Neo4j to map relationships between sources and identify patterns of misinformation.
- **Real-Time Scoring**: Provides instant credibility assessment while browsing.
- **Visual Feedback**: Clear color-coding helps users quickly assess article credibility.

*"In a world of information overload, Fake News Buster helps you separate fact from fiction."* 

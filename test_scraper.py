from scraper import scrape_article

def test_scraper():
    # Test with BBC News
    url = "https://www.bbc.com/news"
    print(f"\nTesting with URL: {url}")
    result = scrape_article(url)
    
    if 'error' in result:
        print(f"Error: {result['error']}")
    else:
        print(f"Title: {result['title']}")
        print(f"Domain: {result['domain']}")
        print(f"Number of links found: {len(result['links'])}")
        print("\nFirst 5 links:")
        for link in result['links'][:5]:
            print(f"- {link}")

if __name__ == "__main__":
    test_scraper() 
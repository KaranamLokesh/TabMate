# src/agent.py
from agents import Agent, Runner, function_tool
from typing import List, Dict, Optional
import requests
from qdrant_client import QdrantClient
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
import yaml
from typing import List
from langchain_core.prompts import ChatPromptTemplate
import asyncio
from openai import OpenAI
from typing import Dict
import requests
from requests.exceptions import RequestException
from bs4 import BeautifulSoup
from agents import function_tool
import uuid
from qdrant_client.http import models
from pydantic import BaseModel, Field  # Added for schema definition
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Union
from requests.exceptions import RequestException

load_dotenv()
client = OpenAI()


def url_content_fetcher(urls: Union[str, List[str]], max_workers: int = 4) -> List[Dict]:
    """
    Enhanced web content fetcher that handles single or multiple URLs with concurrent processing
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }

    def process_single_url(url: str) -> Dict:
        """Inner function to handle individual URL processing"""
        try:
            response = requests.get(
                url,
                headers=headers,
                timeout=10,
                allow_redirects=True
            )
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')
            title = soup.title.string if soup.title else "No Title Found"
            content = ' '.join([p.get_text() for p in soup.find_all('p')])

            prompt = f"""
                Analyze this URL and content snippet. Categorize it into one of these types:
                - Technical Documentation
                - E-commerce/Shopping
                - Video/Multimedia
                - Social Media
                - News/Articles
                - Educational Resources
                - Productivity Tools
                - Entertainment
                - Other

                URL: {url}
                Title: {title}
                Content: {content[:1000]}

                return a JSON object with the following keys: id, title, url, category.
                Respond ONLY with the JSON object, nothing else.
            """

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            # print(response.choices[0].message.content)
            return response.choices[0].message.content

        except RequestException as e:
            return {
                "status": "error",
                "message": f"Request failed: {str(e)}",
                "url": url
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Processing error: {str(e)}",
                "url": url
            }

    # Handle single URL case
    if isinstance(urls, str):
        return [process_single_url(urls)]

    # Process multiple URLs concurrently
    results = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {executor.submit(process_single_url, url): url for url in urls}
        for future in as_completed(future_to_url):
            results.append(future.result())
    return results



# @function_tool(
#     name_override="url_content_fetcher", 
# )
# def url_content_fetcher(url: str) -> Dict:
#     """Robust web content fetcher with anti-blocking features"""
#     headers = {
#         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
#         "Accept-Language": "en-US,en;q=0.9",
#     }

#     try:
#         response = requests.get(
#             url,
#             headers=headers,
#             timeout=10,
#             allow_redirects=True
#         )
#         response.raise_for_status()

#         # Extract main content using BeautifulSoup
#         soup = BeautifulSoup(response.text, 'html.parser')
        
#         title = soup.title.string if soup.title else "No Title Found"
#         content = ' '.join([p.get_text() for p in soup.find_all('p')])
#         prompt = f"""
#                 Analyze this URL and content snippet. Categorize it into one of these types:
#         - Technical Documentation
#         - E-commerce/Shopping
#         - Video/Multimedia
#         - Social Media
#         - News/Articles
#         - Educational Resources
#         - Productivity Tools
#         - Entertainment
#         - Other

#         URL: {url}
#         Title: {title}
#         Content: {content}
#             1. Get the title and some content using url content fetcher 
#             2. Go over the content that you have scraped and categorize the urls based on their contents
#             3. Give me a json structure that has the id which is string, title of the web page, the url, and the category 
#             4. For each URL, return a list of JSON objects with the following keys: id, title, url, category.
#                 Respond ONLY with the JSON array, nothing else. 
#         """

#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=[
#                 {"role": "user", "content": prompt}
#             ],
#             response_format={ "type": "json_object" }
#         )
#         return response.choices[0].message.content


#     except RequestException as e:
#         return {
#             "status": "error",
#             "message": f"Request failed: {str(e)}",
#             "url": url
#         }
#     except Exception as e:
#         return {
#             "status": "error",
#             "message": f"Processing error: {str(e)}",
#             "url": url
#         }



# @function_tool(
#     name_override="qdrant_store",

# )
# def qdrant_store_tool(content: str, metadata: MetadataModel) -> Dict:
#     embeddings = OpenAIEmbeddings(
#         model="text-embedding-3-large",
#         dimensions=1536
#     )
#     vector = embeddings.embed_query(content)
    
#     client = QdrantClient(
#         url="https://f143978d-3f60-4e78-959d-217258b83698.europe-west3-0.gcp.cloud.qdrant.io:6333",
#         api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.Y4ZeWH1Epo4RgM7ChA8TZA5CyjpeiPyfD-pYSegN5Oo"
#     )
#     if not client.collection_exists("tabmate_docs"):
#         client.create_collection(
#             collection_name="tabmate_docs",
#             vectors_config=models.VectorParams(
#                 size=1536,  # Must match embedding dimensions
#                 distance=models.Distance.COSINE
#             )
#     )
    
#     client.upsert(
#         collection_name="tabmate_docs",
#         points=[
#             {
#                 "id": str(uuid.uuid4()),
#                 "vector": vector,
#                 "payload": metadata.dict()  # Convert Pydantic model to dict
#             }
#         ]
#     )
#     return {"status": "success", "stored_items": 1}

@function_tool(
    name_override="url_categorizer",
)
def url_categorizer_tool(query: Optional[str] = None, limit: int = 50) -> Dict[str, List[str]]:
    """Dynamic URL categorizer using pure LLM analysis of vector store contents"""
    client = QdrantClient(
        url="https://f143978d-3f60-4e78-959d-217258b83698.europe-west3-0.gcp.cloud.qdrant.io:6333",
        api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.Y4ZeWH1Epo4RgM7ChA8TZA5CyjpeiPyfD-pYSegN5Oo"
    )
    
    # 1. Retrieve stored documents
    records, _ = client.scroll(
        collection_name="tabmate_docs",
        with_payload=True,
        limit=limit,
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="metadata.source",
                    match=models.MatchValue(value=query)
                ) if query else None
            ]
        ) if query else None
    )
    
    # 2. Set up LLM chain
    llm = ChatOpenAI(model="gpt-4o-mini")
    prompt = ChatPromptTemplate.from_template("""
    Analyze this URL and content snippet. Categorize it into one of these types:
    - Technical Documentation
    - E-commerce/Shopping
    - Video/Multimedia
    - Social Media
    - News/Articles
    - Educational Resources
    - Productivity Tools
    - Entertainment
    - Other

    URL: {url}
    Title: {title}
    Content: {content}
    
    Respond ONLY with the category name.
    """)
    
    chain = prompt | llm
    
    # 3. Process in parallel batches
    categorized = defaultdict(list)
    
    async def process_record(record):
        url = record.payload['source']
        content = record.payload.get('content', '')[:50]  # Truncate for tokens
        
        try:
            response = await chain.ainvoke({"url": url, "content": content})
            category = response.content.strip().title()
            categorized[category].append(url)
        except Exception as e:
            categorized["Processing Errors"].append(url)
    
    # Process with concurrency control
    asyncio.gather(*[process_record(r) for r in records])
    
    return dict(categorized)

# 3. Updated agent class
class TabMateAgent:
    def __init__(self):
        self.config = self.load_config()
        self.llm = ChatOpenAI(model=self.config['llm']['model'])
        
    def load_config(self):
        with open('src/config.yaml') as f:
            return yaml.safe_load(f)
    
#     async def process_urls(self, urls: List[str]):
#         agent = Agent(
#             name="TabMateProcessor",
#             instructions="Process URLs through MCP pipeline",
#             tools=[ url_content_fetcher],
#             model="gpt-4o-mini"
#         )
        
#         result = await Runner.run(
#             agent,
#             f"""
#             Process these URLs: {urls}
#             1. Get the title and some content using url content fetcher 
#             2. Go over the content that you have scraped and categorize the urls based on their contents
#             3. Give me a json structure that has the id which is string, title of the web page, the url, and the category 
#             4. For each URL, return a list of JSON objects with the following keys: id, title, url, category.
#                 Respond ONLY with the JSON array, nothing else.           
# ]
#             """
#         )

        return result.final_output

async def main():
    print("Running agent pipeline...")
    processor = TabMateAgent()
    urls = [
        "https://www.amazon.com/s?k=laptop+stand&crid=1TQOX6D88AYMB&sprefix=laptop+stand%2Caps%2C244&ref=nb_sb_noss_1",
        "https://open.spotify.com",
        "https://medium.com/tag/artificial-intelligence"
    ]
    
    result = url_content_fetcher(urls)
    print("Processing Result:")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())

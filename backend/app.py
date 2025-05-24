from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import asyncio
from src.agent import TabMateAgent
import re
import json

def extract_json_array(text):
    # This regex finds the first JSON array in the text
    match = re.search(r'\[\s*{.*?}\s*\]', text, re.DOTALL)
    if match:
        json_str = match.group(0)
        return json.loads(json_str)
    else:
        raise ValueError("No JSON array found in LLM output")


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

@app.route('/api/categorize', methods=['POST', 'OPTIONS'])
def categorize_urls():
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return ('', 204, headers)
    
    try:
        data = request.get_json()
        urls = data.get('urls', [])
        
        # Run async agent processing
        processor = TabMateAgent()
        result = asyncio.run(processor.process_urls(urls))
        # Transform agent output to match frontend structure
        response = extract_json_array(result)
        print(response)
        formatted_response = []
        for item in response:
            formatted_response.append({
                "id": str(uuid.uuid4()),
                "title": item.get('title', f"Title for {item['url']}"),
                "url": item['url'],
                "favicon": item.get('favicon', '📦'),
                "category": item['category']
            })
        
        return jsonify(formatted_response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)

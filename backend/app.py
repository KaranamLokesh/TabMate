from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import asyncio
from src import agent
import re
import json
from openai import OpenAI  # Or your preferred LLM client
from dotenv import load_dotenv


load_dotenv()

client = OpenAI()

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
        result =agent.url_content_fetcher(urls)
        # Transform agent output to match frontend structure
        # response = extract_json_array(result)
        print(result)
        parsed_list = [json.loads(item) for item in result]
        formatted_response = []
        # for item in result:
        #     formatted_response.append({
        #         "id": str(uuid.uuid4()),
        #         "title": item.get('title', f"Title for {item['url']}"),
        #         "url": item['url'],
        #         "category": item['category']
        #     })
        
        return jsonify(parsed_list)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/update', methods=['POST', 'OPTIONS'])
def handle_command():
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return ('', 204, headers)
    try:
        data = request.get_json()
        command = data.get('command', '')
        current_data = data.get('currentTabs', [])
        # print(command, current_data)
        
        if not command or not current_data:
            return jsonify({"error": "Missing command or data"}), 400

        # Step 1: Generate filter logic using LLM
        system_prompt = """You are a data filtering assistant. Convert user commands into JSON filters.
        Users may not enter the exact query. Be creative and try to do what user says even when they dont explicitly tell you what to do
        Available fields: id, title, url, category
        Example commands:
        - "Remove music tabs" => {"exclude": {"category": "Music"}}
        - "Show only shopping" => {"include": {"category": "Shopping"}}
        Respond ONLY with JSON, no explanations."""
        
        llm_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": command}
            ],
            temperature=0.1
        )
        
        # Step 2: Extract and validate JSON from LLM response
        filter_rules = extract_json(llm_response.choices[0].message.content)
        
        # Step 3: Apply filters
        filtered_data = apply_filters(current_data, filter_rules)
        print(filtered_data)
        return jsonify(filtered_data)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def extract_json(text: str) -> dict:
    """Safely extract JSON from LLM response"""
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if not json_match:
        raise ValueError("No JSON found in LLM response")
    
    try:
        return json.loads(json_match.group())
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON format from LLM")

def apply_filters(data: list, rules: dict) -> list:
    """Apply filter rules to dataset"""
    filtered = []
    
    for item in data:
        include = True
        
        # Handle include rules
        if 'include' in rules:
            for key, value in rules['include'].items():
                if item.get(key) != value:
                    include = False
                    break
        
        # Handle exclude rules
        if 'exclude' in rules and include:
            for key, value in rules['exclude'].items():
                if item.get(key) == value:
                    include = False
                    break
                    
        if include:
            filtered.append(item)
            
    return filtered

if __name__ == '__main__':
    app.run(port=5000)

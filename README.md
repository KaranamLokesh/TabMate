# TabMate

TabMate is a local, AI-driven browser assistant that helps users organize, declutter, and manage their open tabs in real time. It combines a React-based frontend with a Python backend for intelligent tab management.

## Features

- **AI Tab Grouping**: Uses GPT-4 to analyze tab titles/URLs and cluster them into categories like "Work", "Research", "Entertainment", etc.
- **Smart Recommendations**: Detects duplicates, distractions, or irrelevant tabs and suggests closing them
- **Local Dashboard**: Clean, accessible interface using Shadcn UI components
- **Natural Language Interface**: Type commands like "close all YouTube tabs" or "group AI research tabs"
- **Vector Database Integration**: Stores and categorizes tab content for efficient retrieval and organization

## Tech Stack

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI component library
- **State Management**: React Hooks
- **TypeScript**: For type safety

### Backend
- **Language**: Python
- **Web Framework**: Flask
- **AI Integration**: OpenAI API for content analysis
- **Vector Database**: Qdrant for storing and retrieving tab content
- **Web Scraping**: Custom tools for extracting content from tabs

## Architecture

TabMate implements an agentic system with context retrieval from active browser tabs:

1. **Data Collection Layer**: Scrapes content from active browser tabs
2. **Processing Layer**: 
   - Extracts meaningful information from tab content
   - Uses OpenAI API to categorize content
   - Stores processed data in Qdrant vector database
3. **Agent Layer**: 
   - Takes user commands in natural language
   - Determines appropriate actions for tab management
   - Executes actions via browser API

## Project Structure

```
TabMate/
├── app/              # Next.js app directory (frontend routes)
├── backend/          # Python Flask backend
│   ├── app.py        # Main Flask application
│   ├── requirements.txt
│   └── src/
│       ├── agent.py  # AI agent for tab analysis with tools
│       └── config.yaml
├── components/       # React components
│   ├── ui/           # UI components (from Shadcn)
│   └── theme-provider.tsx
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── public/           # Static files
└── styles/           # Global styles
```

## Getting Started

### Prerequisites

- Node.js (18.x or higher)
- Python 3.9+
- pnpm or npm
- OpenAI API Key
- Qdrant API Key (for vector database)

### Frontend Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/TabMate.git
   cd TabMate
   ```

2. Install dependencies
   ```
   pnpm install
   ```

3. Run the development server
   ```
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup

1. Navigate to the backend directory
   ```
   cd backend
   ```

2. Create a virtual environment (recommended)
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables
   ```
   # .env file
   OPENAI_API_KEY="your-openai-api-key"
   QDRANT_API_KEY="your-qdrant-api-key"
   ```

5. Run the Flask server
   ```
   python app.py
   ```

## How It Works

1. **Tab Data Collection**: The system fetches all open tabs from the browser
2. **Content Analysis**: Uses AI to analyze and categorize tab content
3. **Organization**: Groups tabs by category and detects relationships between them
4. **User Interface**: Displays organized tabs with recommendations
5. **Action Execution**: Implements user commands for tab management

## Browser Integration

TabMate integrates with browsers via:

1. **Chrome Extension**: For direct tab manipulation
2. **Puppeteer Integration**: Alternative method for browser control

## Development

### Adding New UI Components

The project uses Shadcn UI components. To add a new component:

```
pnpm dlx shadcn-ui@latest add [component-name]
```

### Backend API

The backend provides endpoints for processing tab data and generating organization suggestions. The main API routes are:

- `/api/tabs` - GET and POST tab data
- `/api/analyze` - Analyze tab patterns and suggest organization
- `/api/categorize` - Categorize tabs using AI

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Known Issues

- API rate limiting with OpenAI can slow down tab processing
- Chrome tabs API requires a browser extension for full functionality

## Future Improvements

- Implement local AI models to reduce API dependencies
- Add support for more browsers (Firefox, Safari)
- Improve processing speed and efficiency
- Add offline functionality

## Contributors

- [@KaranamLokesh](https://github.com/KaranamLokesh) - Lokesh Karanam
- [@KrishArora1](https://github.com/KrishArora1) - Krish Arora
- [@hellomuba](https://github.com/hellomuba) - Mubarak Ibrahim
- [@Muideen27](https://github.com/Muideen27) - Muideen Ilori

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for AI capabilities
- [Shadcn UI](https://ui.shadcn.com/) for the component library
- [Next.js](https://nextjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Qdrant](https://qdrant.tech/) for vector database functionality

# EV-GPT

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/nizarkadri/EV-GPT)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20It-blue?style=for-the-badge&logo=streamlit)](http://18.117.102.197:8501/)

An intelligent web application that provides AI-powered insights about electric vehicles using Google's Gemini 1.5 Flash model and advanced document retrieval capabilities.

## 🎯 Problem Statement

Limited access to comprehensive, up-to-date information about electric vehicles and difficulty in finding specific answers from technical documentation.

## ✨ Features

- 🤖 **AI-Powered Intelligence**: Leverages Google Gemini 1.5 Flash for expert-level automotive analysis
- 📄 **Smart Document Processing**: Handles PDF and TXT files with intelligent text chunking
- 🔍 **Advanced Search**: Vector-based semantic search using ChromaDB for precise document retrieval
- 🎨 **Modern Interface**: Clean, responsive Streamlit web interface
- 🏢 **Enterprise Ready**: AWS integration, Docker support, and production-grade security

## 🛠️ Technology Stack

- **🧠 AI & ML**: Google Gemini 1.5 Flash, LangChain RAG framework
- **🗄️ Database**: ChromaDB vector database, SQLite persistence
- **🌐 Web Framework**: Streamlit, Python 3.11+
- **☁️ Infrastructure**: AWS Secrets Manager, Docker containerization

## 🎯 Use Cases

- 🚗 **EV Enthusiasts**: Compare vehicle models, get specifications, understand technology
- 🏢 **Automotive Professionals**: Access documentation, generate comparisons, analyze specs
- 👨‍💻 **Developers**: Learn RAG implementation, vector database integration

## 💡 Example Questions

- "How does the cargo space of the Ioniq 5 compare to the Model Y?"
- "What are the charging capabilities of the latest Tesla models?"
- "Which EVs have the best range for long-distance travel?"

## 🚀 Performance Metrics

| Metric | Achievement |
|--------|-------------|
| ⚡ Response Time | < 2 seconds average |
| 📄 Document Processing | Multi-threaded for optimal speed |
| 🎯 Search Accuracy | Context-aware responses with source tracking |
| 📈 System Scalability | Efficient handling of large document sets |

## 🔧 Technical Challenges & Solutions

### 📄 Document Processing
**Challenge**: Efficiently processing and chunking large technical documents  
**Solution**: Implemented multi-threaded processing with configurable chunking parameters

### ⚡ AI Integration
**Challenge**: Maintaining context while providing accurate responses  
**Solution**: Leveraged Google's Gemini 1.5 with vector embeddings for context-aware responses

### 🏗️ System Architecture
**Challenge**: Building a scalable and maintainable system  
**Solution**: Modular design with clear separation of concerns using LangChain

## ⚙️ Configuration

### 🔧 Environment Variables
- `🔑 GOOGLE_API_KEY`: Google AI API key (required)
- `🌍 AWS_REGION`: AWS region for secrets (optional, default: us-east-2)

### ⚡ Application Settings
- 📏 Chunk Size: 1200 characters
- 🔄 Chunk Overlap: 200 characters
- 📚 Retrieval Count: 7 documents per query
- 🌡️ Model Temperature: 0.1 for consistency

## 🚀 Performance

- ⚡ Sub-second response times with context-aware analysis
- 📄 Handles thousands of pages efficiently
- 👥 Supports multiple concurrent users
- 🏭 Optimized for production deployment

## 🔮 Future Development Roadmap

- 🔗 Integration with real-time EV data sources
- 📊 Advanced analytics dashboard
- 🔌 API endpoints for third-party integration

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. ✅ Make your changes with proper testing
4. 🔄 Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by Nizar**

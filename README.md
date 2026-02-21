# JavaForge

An interactive quiz application designed to help Java developers refresh and reinforce their core Java and backend development knowledge through engaging multiple-choice questions.

## 📋 About The Project

JavaForge is a full-stack web application that offers a comprehensive quiz system covering essential topics for Java backend developers. With a clean, intuitive interface and immediate feedback, it's the perfect tool for self-assessment and knowledge reinforcement.

### ✨ Key Features

- **10 Comprehensive Categories**: Test your knowledge across fundamental Java and backend topics
- **Customizable Quiz Length**: Choose between 5, 10, 20, 50, or all available questions
- **Randomized Questions**: Each quiz attempt presents questions in a different order
- **Immediate Feedback**: Get detailed explanations for every answer
- **Score Tracking**: See your percentage score and detailed results
- **Clean, Responsive UI**: Works seamlessly on desktop and mobile devices

## 📚 Categories Covered

| Category | Description |
|----------|-------------|
| **Core Java** | Fundamental Java concepts, syntax, and language features |
| **OOP** | Object-Oriented Programming principles and implementation in Java |
| **Collections** | Java Collections Framework, data structures, and algorithms |
| **Exceptions** | Exception handling, try-catch-finally, and best practices |
| **Streams** | Java Stream API, functional programming, and lambda expressions |
| **Multithreading** | Concurrency, thread management, and synchronization |
| **SOLID Principles** | Design principles for maintainable and scalable code |
| **REST Basics** | RESTful API design, HTTP methods, and architectural styles |
| **SQL Basics** | Database queries, joins, and fundamental SQL operations |
| **Git Basics** | Version control commands, branching, and collaboration workflows |

## 🎯 How It Works

1. **Select a Category**: Choose from 10 different knowledge areas
2. **Choose Question Count**: Pick how many questions you want to answer (5-50 or all)
3. **Answer Questions**: Navigate through randomly shuffled questions
4. **Get Results**: Receive your score and detailed explanations for every answer

## 🚀 Technology Stack

### Backend
- **Node.js** with Express framework
- **RESTful API** architecture
- **JSON file-based** data storage (no database required)

### Frontend
- **HTML5** for structure
- **CSS3** for styling with responsive design
- **Vanilla JavaScript** for interactivity (no frameworks)

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/java-junior-refresher.git
   cd java-junior-refresher
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🤝 Contributing

Contributions are welcome! Whether it's adding more questions, improving the UI, or fixing bugs:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Adding More Questions

To expand the question database, edit `data/questions.json` following this structure:

```json
{
  "id": 501,
  "category": "Core Java",
  "question": "Your question here?",
  "answers": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswerIndex": 0,
  "explanation": "Detailed explanation of why this answer is correct"
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Ready to refresh your Java knowledge?** [Start the Quiz](https://javaforge.onrender.com/) after installation!

---

*Built with ❤️ for Java developers everywhere*
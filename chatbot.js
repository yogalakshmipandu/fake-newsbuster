document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbot = document.getElementById('chatbot');
    const closeChatbot = document.getElementById('closeChatbot');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendMessage = document.getElementById('sendMessage');

    // Chatbot state
    let isChatbotOpen = false;

    // Toggle chatbot visibility
    chatbotToggle.addEventListener('click', () => {
        isChatbotOpen = !isChatbotOpen;
        chatbot.classList.toggle('hidden');
    });

    closeChatbot.addEventListener('click', () => {
        isChatbotOpen = false;
        chatbot.classList.add('hidden');
    });

    // Handle message sending
    function handleSendMessage() {
        const message = userInput.value.trim();
        if (message) {
            // Add user message to chat
            addMessage(message, 'user');
            userInput.value = '';

            // Process message and get bot response
            const response = processMessage(message);
            setTimeout(() => {
                addMessage(response, 'bot');
            }, 500);
        }
    }

    // Add event listeners for sending messages
    sendMessage.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = `max-w-[80%] p-3 rounded-lg ${
            sender === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800'
        }`;
        
        messageBubble.textContent = text;
        messageDiv.appendChild(messageBubble);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Process user message and generate response
    function processMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // Common questions and responses
        const responses = {
            'hello': 'Hello! How can I help you with news credibility today?',
            'hi': 'Hi there! I can help you understand news credibility scores and more.',
            'help': 'I can help you understand:\n- How credibility scores are calculated\n- What different indicators mean\n- How to interpret analysis results\n- Tips for fact-checking news\nWhat would you like to know?',
            'score': 'Credibility scores are calculated based on several factors:\n- Author attribution (20%)\n- References & sources (20%)\n- Publication date (15%)\n- Direct quotes (15%)\n- Domain reputation (20%)\n- Article length (5%)\n- Supporting images (5%)',
            'credibility': 'A high credibility score (70-100) means the article is likely reliable. A moderate score (30-70) suggests some verification needed. A low score (0-30) indicates potential issues with reliability.',
            'fact check': 'To fact-check news:\n1. Verify the source\n2. Check publication date\n3. Look for author credentials\n4. Find supporting sources\n5. Check for bias\n6. Verify quotes and statistics',
            'thanks': 'You\'re welcome! Feel free to ask if you have more questions.',
            'thank you': 'You\'re welcome! Feel free to ask if you have more questions.', 'is this score good?' : 'if score is between 10 - 30 then it is bad if it is between 30 - 70 it is moderate and if is between 80 and above it is good'
        };

        // Check for exact matches
        if (responses[lowerMessage]) {
            return responses[lowerMessage];
        }

        // Check for partial matches
        for (const [key, value] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return value;
            }
        }

        // Default response for unrecognized messages
        return "I'm not sure I understand. Could you rephrase that? I can help you understand credibility scores, fact-checking, or news analysis.";
    }
}); 
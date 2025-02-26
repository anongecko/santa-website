# Santa Chat 🎅 - Interactive AI Santa Experience

> **Note**: This project was in active development when the client discontinued the engagement. While the core AI chat functionality and interactive landing page were completed, several advanced features (database integration, email verification, wishlist generation) were in progress but not fully implemented. Some traces of these features remain in the codebase.

## [Live Demo](#)
https://santa-website-roan.vercel.app/ 

![Santa Chat Landing Page](#)
![2025-02-26 14 18 11](https://github.com/user-attachments/assets/d1cb463d-6ca0-4970-a5ba-4c24de2d147d)


## Project Concept 🎄

Santa Chat is an interactive web application that allows parents to share an AI-powered Santa Claus chat experience with their children. The application features:

- An engaging conversation with a convincing AI Santa Claus
- Intelligent wishlist generation from natural conversation
- Price estimation for wishlist items
- Smart Amazon product recommendations (best deals/quality)

The completed portion includes a fully functional AI chat and interactive landing page, while the database implementation and advanced features were in development when the project was discontinued.

## Completed Features ✨

### Landing Page
- Highly interactive, animated UI with Framer Motion
- Dynamic snow animation effects
- Responsive design for all device sizes
- Interactive elements that preview AI capabilities
- Light/dark theme toggle with smooth transitions

![Landing Page Animation](#) <!-- Replace with a GIF of animations -->

### AI Chat Experience
- OpenAI-powered conversational Santa persona
- Context-aware responses that maintain character
- Child-friendly conversation handling
- Basic wishlist identification from conversation

![AI Chat Interface](#) <!-- Replace with screenshot or GIF -->

### Technical Achievements
- Optimized animations that run smoothly on mobile devices
- Keyboard shortcuts for accessibility
- SEO optimization
- Progressive loading states with fallbacks
- Efficient component architecture

## Features In Development (Not Completed)
- Database integration for saving chat histories
- User authentication and profiles
- Email verification system
- Automatic wishlist generation emails
- Advanced product recommendation system
- Sentiment analysis of Amazon reviews
- Price tracking and deal alerts

## Technology Stack 🛠️

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion
- **AI Integration**: OpenAI API
- **Icons**: Lucide React
- **State Management**: React Context API
- **Form Handling**: React Hook Form

## Setup Instructions 🚀

This project is configured for easy deployment on Vercel:

1. **Clone this repository**
```bash
git clone https://github.com/yourusername/santa-chat.git
cd santa-chat
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment variables**
   
   Create a `.env.local` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Local development**
```bash
npm run dev
```

5. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add the `OPENAI_API_KEY` environment variable in the Vercel dashboard
   - Deploy

## Performance Optimizations 🚄

- Next.js Image component for optimized image loading
- Code splitting and lazy loading for performance
- CSS-in-JS optimization with Tailwind
- Preloading of critical resources
- Optimized animations with Framer Motion

![Performance Metrics](#) <!-- Replace with Lighthouse or similar metrics -->

## Learning Outcomes & Technical Challenges

- Implementing natural conversational UI with OpenAI
- Building interactive animations that enhance UX without sacrificing performance
- Creating a responsive design that works across all device sizes
- Developing a character-consistent AI persona

---

**Project by:** Mark Eglseder
**Duration:** December 2024

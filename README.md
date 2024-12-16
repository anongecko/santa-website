# Santa Chat 🎅

An interactive AI-powered Santa Claus chat experience built with Next.js and
OpenAI, featuring a beautiful landing page and upcoming smart gift
recommendation system.

## Features ✨

### Current

- Interactive chat with AI Santa
- Responsive, animated landing page
- Real-time snow animation effects
- Mobile-friendly design
- Dark/light theme support
- Loading states and animations
- SEO optimized
- Prisma + Supabase database integration
- Cloudflare CDN integration
- Keyboard shortcuts and accessibility

### Coming Soon

- AI-powered gift wishlist email feature
- Amazon product recommendations at different price points
- Smart product analysis and price tracking
- Sentiment analysis of product reviews
- Quality indicators and price history
- Automated email generation with gift suggestions

## Tech Stack 🛠️

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Animations**: Framer Motion
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **AI**: OpenAI API
- **CDN**: Cloudflare
- **Icons**: Lucide
- **Analytics**: To be added

## Getting Started 🚀

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/santa-chat.git
cd santa-chat
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables** Create a `.env` file:

```env
DATABASE_URL="your-supabase-url"
OPENAI_API_KEY="your-openai-key"
```

4. **Run database migrations**

```bash
npx prisma db push
```

5. **Start development server**

```bash
npm run dev
```

6. **Build for production**

```bash
npm run build
npm start
```

## Project Structure 📁

```
├── prisma/            # Database schema and migrations
├── public/            # Static assets
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   │   ├── animations/
│   │   ├── layout/
│   │   ├── pages/
│   │   └── ui/
│   ├── lib/          # Utility functions
│   ├── hooks/        # Custom React hooks
│   └── styles/       # Global styles
```

## Performance Optimization 🚄

- Image optimization with Next.js Image
- Dynamic imports for heavy components
- CSS/JS minification
- CDN caching via Cloudflare
- Brotli compression
- HTTP/2 and HTTP/3 enabled
- Optimized fonts and icons
- Responsive loading strategies

## Deployment 🌍

The application is configured for deployment on a VPS with:

- Nginx as reverse proxy
- PM2 for process management
- Cloudflare for CDN and SSL
- Supabase for database hosting

## Credits 🙏

- Icons from Lucide
- UI components from shadcn/ui

---

Made with ❤️ and 🎄 magic

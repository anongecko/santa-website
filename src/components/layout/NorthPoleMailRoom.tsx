'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Gift,
  Mail,
  Star,
  Tag,
  Link as LinkIcon,
  DollarSign,
  Heart,
  ShoppingBag,
  Presentation,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Snow } from '@/components/animations/Snow';

// Create a simple SectionTitle component since it's not available from shared
function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-3xl md:text-4xl lg:text-5xl font-bold mb-4', className)}>{children}</h2>
  );
}

const sampleWishlist = {
  childName: 'Emily',
  dateCreated: 'December 11, 2024',
  conversationHighlights: [
    'Loves art and creativity',
    'Interested in space and science',
    'Enjoys reading adventure books',
  ],
  gifts: [
    {
      name: 'Art Supply Set',
      priority: 'high',
      details: 'Mentioned multiple times, very excited about painting',
      suggestedLinks: ['ArtStore/KidsSet', 'CreativeCorner/Supplies'],
      priceRange: '$25-40',
    },
    {
      name: 'Telescope for Kids',
      priority: 'medium',
      details: 'Would like to look at stars, educational interest',
      suggestedLinks: ['ScienceKits/Telescopes', 'KidsScience/Space'],
      priceRange: '$50-80',
    },
    {
      name: 'Adventure Book Series',
      priority: 'medium',
      details: "Specifically mentioned 'Magic Treehouse' series",
      suggestedLinks: ['Books/Series', 'ChildrenBooks/Adventure'],
      priceRange: '$30-45',
    },
  ],
};

interface GiftCardProps {
  gift: (typeof sampleWishlist.gifts)[0];
  index: number;
}

function GiftCard({ gift, index }: GiftCardProps) {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const priorityColors = {
    high: 'santa-red',
    medium: 'winter-blue',
    low: 'holly-green',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300">
        <CardHeader className="relative">
          {/* Priority Tag */}
          <div
            className={cn(
              'absolute top-2 right-2 px-3 py-1 rounded-full text-xs',
              `bg-${priorityColors[gift.priority as keyof typeof priorityColors]}/10`,
              `text-${priorityColors[gift.priority as keyof typeof priorityColors]}`
            )}
          >
            {gift.priority.charAt(0).toUpperCase() + gift.priority.slice(1)} Priority
          </div>

          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-3 rounded-xl bg-christmas-gold/10"
            >
              <Gift className="w-6 h-6 text-christmas-gold" />
            </motion.div>
            <div>
              <CardTitle className="text-xl mb-2">{gift.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{gift.details}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Price Range */}
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-holly-green" />
              <span className="text-muted-foreground">Estimated: {gift.priceRange}</span>
            </div>

            {/* Shopping Links */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Suggested Shopping:</div>
              {gift.suggestedLinks.map((link, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <LinkIcon className="w-4 h-4 text-winter-blue" />
                  <span>{link}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>

        {/* Decorative Corner */}
        <div
          className="absolute bottom-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-10 
                     transition-opacity duration-500 bg-gradient-to-tl from-christmas-gold to-transparent"
        />
      </Card>
    </motion.div>
  );
}

// Only showing the changes needed - the interfaces and card components remain the same
export function NorthPoleMailRoom() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background via-background/50 to-background"
      data-section="north-pole-mail"
    >
      {/* Decorative Elements */}
      <Snow className="opacity-30" />
      <div className="absolute inset-0 bg-[url('/patterns/mail.svg')] opacity-5" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="text-center space-y-3 mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-santa-red">
            North Pole Mail Room{' '}
            <motion.span
              animate={{
                rotate: [-10, 10, -10],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="inline-block"
            >
              ✉️
            </motion.span>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Every chat with Santa creates a magical, organized wishlist delivered straight to
            parents' inboxes with helpful shopping insights.
          </motion.p>
        </motion.div>

        {/* Email Preview */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="relative overflow-visible bg-background shadow-xl pt-12 md:pt-14">
            {/* Mail Icon Container */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-0
                           bg-background rounded-full p-3 shadow-lg"
            >
              <motion.div
                animate={{
                  y: [-2, 2, -2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Mail className="w-8 h-8 md:w-10 md:h-10 text-santa-red" />
              </motion.div>
            </div>

            <CardHeader>
              <div className="space-y-2 text-center">
                <div className="text-sm text-muted-foreground">{sampleWishlist.dateCreated}</div>
                <CardTitle className="text-xl md:text-2xl text-santa-red">
                  {sampleWishlist.childName}'s Christmas Wishlist
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Child's Interests */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-santa-red">
                  <Heart className="w-5 h-5" />
                  Conversation Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sampleWishlist.conversationHighlights.map((highlight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-background/50 
                               border border-border/50 hover:shadow-md transition-shadow duration-300"
                    >
                      <Star className="w-4 h-4 text-christmas-gold" />
                      <span className="text-sm">{highlight}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Gift List */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-santa-red">
                  <Gift className="w-5 h-5" />
                  Wishlist Items
                </h3>
                {sampleWishlist.gifts.map((gift, index) => (
                  <GiftCard key={index} gift={gift} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: Presentation,
              title: 'Smart Organization',
              description: 'Gifts automatically categorized and prioritized',
            },
            {
              icon: ShoppingBag,
              title: 'Shopping Helper',
              description: 'Curated shopping suggestions and price estimates',
            },
            {
              icon: Tag,
              title: 'Gift Insights',
              description: 'Detailed context from each conversation',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.6 + i * 0.2 }}
              className="text-center p-6 rounded-xl bg-background/50 backdrop-blur-sm
                       border border-border/50 hover:shadow-lg transition-all duration-300"
            >
              <motion.div
                animate={{
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
                className="w-12 h-12 mx-auto mb-4 p-2 rounded-xl bg-santa-red/10"
              >
                <feature.icon className="w-full h-full text-santa-red" />
              </motion.div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';

const REACTION_TYPES = [
  { id: 'like', label: 'Like', emoji: '👍' },
  { id: 'funny', label: 'Funny', emoji: '😆' },
  { id: 'nice', label: 'Nice', emoji: '😍' },
  { id: 'sad', label: 'Sad', emoji: '😭' },
  { id: 'angry', label: 'Angry', emoji: '😡' }
];

export default function ReactionWidget({ slug, initialReactions }) {
  const [reactions, setReactions] = useState({
    like: 0, funny: 0, nice: 0, sad: 0, angry: 0,
    ...initialReactions
  });
  const [userReaction, setUserReaction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user's previous reaction from localStorage
  useEffect(() => {
    try {
      const storedReactions = JSON.parse(localStorage.getItem('manga_reactions') || '{}');
      if (storedReactions[slug]) {
        setUserReaction(storedReactions[slug]);
      }
    } catch (e) {
      console.error('Failed to parse reactions from localStorage:', e);
    }
  }, [slug]);

  const handleReact = async (type) => {
    if (isSubmitting) return;

    const action = userReaction === type ? 'remove' : 'add';
    const oldReaction = userReaction;

    // Optimistic update
    setReactions(prev => {
      const newReactions = { ...prev };
      if (action === 'remove') {
        newReactions[type] = Math.max(0, newReactions[type] - 1);
      } else {
        newReactions[type] = newReactions[type] + 1;
        if (oldReaction) {
          newReactions[oldReaction] = Math.max(0, newReactions[oldReaction] - 1);
        }
      }
      return newReactions;
    });

    const newUserReaction = action === 'remove' ? null : type;
    setUserReaction(newUserReaction);

    try {
      // Save locally
      const storedReactions = JSON.parse(localStorage.getItem('manga_reactions') || '{}');
      if (newUserReaction) {
        storedReactions[slug] = newUserReaction;
      } else {
        delete storedReactions[slug];
      }
      localStorage.setItem('manga_reactions', JSON.stringify(storedReactions));

      // First, remove old reaction if switching
      if (oldReaction && action === 'add') {
        await fetch(`/api/manga/${slug}/react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: oldReaction, action: 'remove' })
        });
      }

      // Add or remove current reaction
      setIsSubmitting(true);
      const res = await fetch(`/api/manga/${slug}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, action })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setReactions({
          like: 0, funny: 0, nice: 0, sad: 0, angry: 0,
          ...json.data
        });
      }
    } catch (err) {
      console.error('Error submitting reaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalResponses = Object.values(reactions).reduce((a, b) => a + (Number(b) || 0), 0);

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8 flex flex-col items-center shadow-sm">
      <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1">Your Reaction?</h3>
      <p className="text-xs sm:text-sm text-text-muted mb-4 sm:mb-6">{totalResponses} Responses</p>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
        {REACTION_TYPES.map((reaction) => {
          const count = reactions[reaction.id] || 0;
          const isActive = userReaction === reaction.id;

          return (
            <button
              key={reaction.id}
              onClick={() => handleReact(reaction.id)}
              disabled={isSubmitting}
              className="flex flex-col items-center gap-1.5 sm:gap-2 group transition-transform hover:-translate-y-1"
            >
              {/* Image / Emoji container */}
              <div 
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-accent-red/20 border-2 border-accent-red scale-110 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                    : 'bg-bg-elevated border-2 border-transparent group-hover:bg-bg-primary group-hover:border-border'
                }`}
              >
                {/* Fallback using text emoji. User can wrap an <img> tag here later */}
                {reaction.emoji}
              </div>
              
              <div className="text-center">
                <span className={`block font-bold text-sm sm:text-lg leading-tight transition-colors ${isActive ? 'text-accent-red' : 'text-text-primary group-hover:text-text-primary'}`}>
                  {count}
                </span>
                <span className="block text-[9px] sm:text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                  {reaction.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

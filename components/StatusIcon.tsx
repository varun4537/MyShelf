import React from 'react';
import { Book, BookOpen, CheckCircle, Gift, Star, LucideIcon } from 'lucide-react';
import { ReadingStatus } from '../types';

/**
 * Single source of truth for reading-status iconography.
 * Replaces the OS-dependent emoji badges (📚📖✅🎁) with consistent
 * stroke icons that match the rest of the UI.
 */
export const STATUS_META: Record<ReadingStatus, { label: string; Icon: LucideIcon; color: string }> = {
  unread: { label: 'Unread', Icon: Book, color: '#38bdf8' },        // sky-400
  reading: { label: 'Reading', Icon: BookOpen, color: '#fbbf24' },  // amber-400
  read: { label: 'Read', Icon: CheckCircle, color: '#34d399' },     // emerald-400
  wishlist: { label: 'Wishlist', Icon: Gift, color: '#c084fc' },    // purple-400
};

export const StatusIcon: React.FC<{ status: ReadingStatus; className?: string }> = ({
  status,
  className = 'w-4 h-4',
}) => {
  const { Icon, color } = STATUS_META[status];
  return <Icon className={className} style={{ color }} strokeWidth={2.25} />;
};

const STAR_COLOR = '#fbbf24'; // amber-400

export const RatingStars: React.FC<{ rating: number; max?: number; className?: string }> = ({
  rating,
  max = 5,
  className = 'w-3.5 h-3.5',
}) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }, (_, i) => (
      <Star
        key={i}
        className={className}
        fill={i < rating ? STAR_COLOR : 'none'}
        style={{ color: i < rating ? STAR_COLOR : 'var(--color-text-muted)' }}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

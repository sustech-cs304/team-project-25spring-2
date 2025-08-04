"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';

export default function RatingPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [closeCount, setCloseCount] = useState(0);

  useEffect(() => {
    // Show popup every 30 seconds
    const interval = setInterval(() => {
      if (closeCount >= 3) {
        clearInterval(interval);
        return;
      } else {
        setCloseCount(closeCount + 1);
        setIsOpen(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [closeCount]);

  const handleRatingClick = (selectedRating: number) => {
    // Broken rating system - only allows rating of 1 or 5, other ratings don't work
    if (selectedRating === 1 || selectedRating === 5) {
      setRating(selectedRating);
    } else {
      // Simulate broken functionality - rating doesn't change
      toast.error('Rating system temporarily unavailable');
    }
  };

  const handleSubmit = () => {
    // Broken submission - always fails
    toast.error('Unable to submit rating. Please try again later.');
    setIsOpen(false);
    setRating(0);
    setFeedback('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setRating(0);
    setFeedback('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Rate Your Experience
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            How would you rate your experience with PeachIDE?
          </p>
          
          {/* Broken rating stars - only 1 and 5 work */}
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={`p-1 transition-colors ${
                    (hoveredRating >= star || rating >= star) 
                      ? 'text-yellow-500' 
                      : 'text-gray-300'
                  }`}
                  disabled={star !== 1 && star !== 5} // Only 1 and 5 are enabled
                  title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                <Star 
                  size={24} 
                  fill={star !== 1 && star !== 5 ? 'none' : undefined}
                  className={star !== 1 && star !== 5 ? 'opacity-50' : ''}
                />
              </button>
            ))}
          </div>
          
          {rating > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              You selected {rating} star{rating !== 1 ? 's' : ''}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Feedback (Optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full p-2 border rounded-md text-sm resize-none"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0}>
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
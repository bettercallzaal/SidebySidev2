import React, { useState, useEffect } from 'react';
import { Comment } from '../lib/supabase';

interface CommentsProps {
  comments: Comment[];
  currentTime: number;
  onTimeClick: (time: number) => void;
  onAddComment: (timestamp: number, text: string) => Promise<void>;
  isAuthenticated: boolean;
}

export const Comments: React.FC<CommentsProps> = ({
  comments,
  currentTime,
  onTimeClick,
  onAddComment,
  isAuthenticated,
}) => {
  const [visibleComments, setVisibleComments] = useState<Comment[]>([]);
  const [displayAll, setDisplayAll] = useState(false);

  // Filter comments to show those around the current time or all if displayAll is true
  useEffect(() => {
    if (displayAll) {
      setVisibleComments(comments);
    } else {
      // Show comments within 15 seconds of current time
      const nearbyComments = comments.filter(
        comment => Math.abs(comment.timestamp - currentTime) <= 15
      );
      setVisibleComments(nearbyComments);
    }
  }, [comments, currentTime, displayAll]);

  // Format time as mm:ss
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 bg-black bg-opacity-90 text-white rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Comments</h3>
        <button
          onClick={() => setDisplayAll(!displayAll)}
          className="text-sm bg-white bg-opacity-10 hover:bg-opacity-20 px-3 py-1 rounded-md transition-colors"
        >
          {displayAll ? 'Show Nearby' : 'Show All'}
        </button>
      </div>

      {visibleComments.length > 0 ? (
        <div className="space-y-3">
          {visibleComments.map((comment) => (
            <div 
              key={comment.id} 
              className="bg-white bg-opacity-5 rounded-md p-3 transition-all hover:bg-opacity-10"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm text-gray-300">@{comment.user_id}</span>
                <button
                  onClick={() => onTimeClick(comment.timestamp)}
                  className="text-xs bg-[#9147FF] bg-opacity-20 hover:bg-opacity-40 px-2 py-0.5 rounded text-[#9147FF] transition-colors"
                >
                  {formatTime(comment.timestamp)}
                </button>
              </div>
              <p className="text-sm">{comment.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-6">
          {comments.length > 0
            ? 'No comments near this timestamp.'
            : 'Be the first to comment on this track!'}
        </div>
      )}
    </div>
  );
};

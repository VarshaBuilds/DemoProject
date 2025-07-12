import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Check, Clock } from 'lucide-react';
import { Answer } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useQuestions } from '../hooks/useQuestions';

interface AnswerCardProps {
  answer: Answer;
  onVote: (type: 'up' | 'down') => void;
  onAccept?: () => void;
  canAccept?: boolean;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  answer,
  onVote,
  onAccept,
  canAccept = false,
}) => {
  const { user } = useAuth();
  const { getUserVote } = useQuestions();
  const [userVote, setUserVote] = useState<'up' | 'down' | undefined>();

  useEffect(() => {
    if (user) {
      getUserVote(answer.id, user.id).then(setUserVote);
    }
  }, [answer.id, user, getUserVote]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      alert('Please sign in to vote on answers.');
      return;
    }
    try {
      await onVote(type);
      if (user) {
        const newVote = await getUserVote(answer.id, user.id);
        setUserVote(newVote);
      }
    } catch (error: any) {
      alert(error.message || 'Error voting on answer');
    }
  };

  return (
    <div className={`bg-white border rounded-lg p-6 ${answer.isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex gap-4">
        {/* Voting */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => handleVote('up')}
            disabled={!user}
            className={`p-2 rounded-full transition-colors ${
              userVote === 'up'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <ChevronUp size={20} />
          </button>
          
          <span className={`font-semibold ${
            answer.votes > 0 ? 'text-green-600' : 
            answer.votes < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {answer.votes}
          </span>
          
          <button
            onClick={() => handleVote('down')}
            disabled={!user}
            className={`p-2 rounded-full transition-colors ${
              userVote === 'down'
                ? 'bg-red-100 text-red-600'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <ChevronDown size={20} />
          </button>

          {canAccept && !answer.isAccepted && (
            <button
              onClick={onAccept}
              className="p-2 rounded-full text-gray-400 hover:bg-green-100 hover:text-green-600 transition-colors"
              title="Accept this answer"
            >
              <Check size={20} />
            </button>
          )}

          {answer.isAccepted && (
            <div className="p-2 rounded-full bg-green-100 text-green-600" title="Accepted answer">
              <Check size={20} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div 
            className="prose prose-sm max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: answer.content }}
          />

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>Answered {formatDate(answer.createdAt)}</span>
            </div>
            <span className="font-medium">by {answer.author}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
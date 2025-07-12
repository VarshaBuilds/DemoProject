import React, { useState } from 'react';
import { ArrowLeft, Send, Users, Clock, Eye } from 'lucide-react';
import { Question } from '../types';
import { RichTextEditor } from '../components/RichTextEditor';
import { AnswerCard } from '../components/AnswerCard';
import { QuestionCard } from '../components/QuestionCard';
import { useQuestions } from '../hooks/useQuestions';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

interface QuestionDetailProps {
  question: Question;
  onBack: () => void;
}

export const QuestionDetail: React.FC<QuestionDetailProps> = ({ question, onBack }) => {
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { createAnswer, vote, acceptAnswer, getQuestionAnswers, incrementViews, getRelatedQuestions, getUserAnswerCount } = useQuestions();
  const { addNotification } = useNotifications();
  
  const answers = getQuestionAnswers(question.id);
  const isQuestionOwner = user?.id === question.authorId;
  const relatedQuestions = getRelatedQuestions(question);

  // Increment views when component mounts
  React.useEffect(() => {
    incrementViews(question.id);
  }, [question.id, incrementViews]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !answerContent.trim()) return;

    setIsSubmitting(true);
    try {
      const newAnswer = await createAnswer({
        questionId: question.id,
        content: answerContent.trim(),
        authorId: user.id,
      });

      // Send notification to question owner
      if (question.authorId !== user.id) {
        await addNotification({
          userId: question.authorId,
          type: 'answer',
          message: `${user.username} answered your question: "${question.title}"`,
          questionId: question.id,
          answerId: newAnswer.id,
          isRead: false,
        });
      }

      setAnswerContent('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (answerId: string, type: 'up' | 'down') => {
    if (!user) {
      alert('Please sign in to vote on answers.');
      return;
    }
    try {
      await vote(answerId, type, user.id);
    } catch (error: any) {
      alert(error.message || 'Error voting on answer');
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !isQuestionOwner) return;
    try {
      await acceptAnswer(answerId, question.id);
    } catch (error) {
      console.error('Error accepting answer:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Question Details</h1>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h2>
        
        <div 
          className="prose prose-lg max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: question.description }}
        />

        <div className="flex flex-wrap gap-2 mb-6">
          {question.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{answers.length} answers</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{question.views} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>Asked {formatDate(question.createdAt)}</span>
            </div>
          </div>
          <span className="font-medium">by {question.author}</span>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h3>
        
        {answers.map((answer) => (
          <AnswerCard
            key={answer.id}
            answer={answer}
            onVote={(type) => handleVote(answer.id, type)}
            onAccept={() => handleAcceptAnswer(answer.id)}
            canAccept={isQuestionOwner && !answer.isAccepted && !question.acceptedAnswerId}
          />
        ))}
      </div>

      {/* Answer Form */}
      {user ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
          
          <form onSubmit={handleSubmitAnswer}>
            <RichTextEditor
              value={answerContent}
              onChange={setAnswerContent}
              placeholder="Write your answer here..."
              className="mb-4"
            />
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !answerContent.trim()}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Post Answer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-4">You must be signed in to post an answer.</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </div>
      )}

      {/* Related Questions */}
      {relatedQuestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Questions</h3>
          <div className="space-y-3">
            {relatedQuestions.map((relatedQuestion) => (
              <div key={relatedQuestion.id} className="border-l-4 border-blue-200 pl-4">
                <h4 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                  {relatedQuestion.title}
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span>{relatedQuestion.answerCount} answers</span>
                  <span>{relatedQuestion.views} views</span>
                  <div className="flex gap-1">
                    {relatedQuestion.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
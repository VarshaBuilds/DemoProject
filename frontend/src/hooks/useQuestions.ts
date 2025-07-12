import { useState, useEffect } from 'react';
import { Question, Answer } from '../types';
import { questionService, answerService, voteService } from '../services/api';

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async (searchQuery?: string, tag?: string, sortBy?: string) => {
    try {
      setLoading(true);
      const questionsData = await questionService.getQuestions(searchQuery, tag, sortBy);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'answerCount' | 'votes' | 'views' | 'author'>) => {
    try {
      const newQuestion = await questionService.createQuestion(questionData);
      setQuestions(prev => [newQuestion, ...prev]);
      return newQuestion;
    } catch (error) {
      throw error;
    }
  };

  const createAnswer = async (answerData: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'isAccepted' | 'author'>) => {
    try {
      const newAnswer = await answerService.createAnswer(answerData);
      
      // Update question answer count
      setQuestions(prev => prev.map(q => 
        q.id === answerData.questionId 
          ? { ...q, answerCount: q.answerCount + 1 }
          : q
      ));
      
      return newAnswer;
    } catch (error) {
      throw error;
    }
  };

  const incrementViews = async (questionId: string) => {
    try {
      await questionService.incrementViews(questionId);
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, views: q.views + 1 }
          : q
      ));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const vote = async (answerId: string, voteType: 'up' | 'down') => {
    try {
      await voteService.vote(answerId, voteType);
    } catch (error) {
      throw error;
    }
  };

  const acceptAnswer = async (answerId: string, questionId: string) => {
    try {
      await answerService.acceptAnswer(answerId);
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, acceptedAnswerId: answerId }
          : q
      ));
    } catch (error) {
      throw error;
    }
  };

  const getQuestionAnswers = (questionId: string): Answer[] => {
    // This will be handled by the QuestionDetail component
    return [];
  };

  const getUserVote = async (answerId: string, userId: string): Promise<'up' | 'down' | undefined> => {
    try {
      return await voteService.getUserVote(answerId);
    } catch (error) {
      console.error('Error getting user vote:', error);
      return undefined;
    }
  };

  const getRelatedQuestions = async (currentQuestion: Question, limit: number = 5): Promise<Question[]> => {
    try {
      return await questionService.getRelatedQuestions(currentQuestion.id);
    } catch (error) {
      console.error('Error getting related questions:', error);
      return [];
    }
  };

  const getUserAnswerCount = async (userId: string): Promise<number> => {
    // This would need to be implemented in the backend
    return 0;
  };

  return {
    questions,
    loading,
    loadQuestions,
    createQuestion,
    createAnswer,
    vote,
    acceptAnswer,
    getQuestionAnswers,
    getUserVote,
    incrementViews,
    getUserAnswerCount,
    getRelatedQuestions,
  };
};
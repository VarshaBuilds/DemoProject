import { useState, useEffect } from 'react';
import { Question, Answer } from '../types';

// Mock data for development
const INITIAL_QUESTIONS: Question[] = [
  {
    id: '1',
    title: 'How to implement authentication in React?',
    description: '<p>I\'m building a React application and need to implement user authentication. What are the best practices for handling login, logout, and protecting routes?</p><p>I\'ve heard about JWT tokens but I\'m not sure how to implement them properly.</p>',
    tags: ['react', 'authentication', 'jwt', 'security'],
    authorId: '1',
    author: 'john_doe',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    answerCount: 2,
    votes: 5,
  },
  {
    id: '2',
    title: 'Best practices for state management in large React apps?',
    description: '<p>I\'m working on a large React application with complex state requirements. Should I use Redux, Zustand, or stick with React Context?</p><ul><li>The app has multiple user roles</li><li>Real-time data updates</li><li>Complex form handling</li></ul>',
    tags: ['react', 'state-management', 'redux', 'context'],
    authorId: '2',
    author: 'jane_smith',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    answerCount: 1,
    votes: 3,
  },
  {
    id: '3',
    title: 'How to optimize React app performance?',
    description: '<p>My React application is getting slower as it grows. What are the key strategies for optimizing performance?</p><p>I\'ve heard about:</p><ul><li>Code splitting</li><li>Lazy loading</li><li>Memoization</li></ul><p>But I\'m not sure where to start.</p>',
    tags: ['react', 'performance', 'optimization'],
    authorId: '1',
    author: 'john_doe',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    answerCount: 0,
    votes: 2,
  }
];

const INITIAL_ANSWERS: Answer[] = [
  {
    id: '1',
    questionId: '1',
    content: '<p>For React authentication, I recommend using a combination of JWT tokens and React Context. Here\'s a basic approach:</p><ol><li><strong>Set up an Auth Context</strong> to manage user state</li><li><strong>Store JWT tokens</strong> in httpOnly cookies for security</li><li><strong>Create protected routes</strong> using a higher-order component</li></ol><p>Here\'s a simple example of an Auth Context:</p><pre><code>const AuthContext = createContext();\n\nfunction AuthProvider({ children }) {\n  const [user, setUser] = useState(null);\n  // ... auth logic\n  return (\n    &lt;AuthContext.Provider value={{ user, login, logout }}&gt;\n      {children}\n    &lt;/AuthContext.Provider&gt;\n  );\n}</code></pre>',
    authorId: '2',
    author: 'jane_smith',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 8,
    isAccepted: true,
  },
  {
    id: '2',
    questionId: '1',
    content: '<p>Another approach is to use a library like <strong>Auth0</strong> or <strong>Firebase Auth</strong> which handles most of the complexity for you.</p><p>Benefits:</p><ul><li>Built-in security best practices</li><li>Social login integration</li><li>Multi-factor authentication</li><li>User management dashboard</li></ul><p>This can save you a lot of development time and reduces security risks.</p>',
    authorId: '1',
    author: 'john_doe',
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    votes: 3,
    isAccepted: false,
  },
  {
    id: '3',
    questionId: '2',
    content: '<p>For large React applications, I\'d recommend <strong>Redux Toolkit</strong> with RTK Query for the following reasons:</p><ol><li><strong>Predictable state updates</strong> - All state changes go through reducers</li><li><strong>Time-travel debugging</strong> - Redux DevTools are incredibly powerful</li><li><strong>Middleware support</strong> - Easy to add logging, persistence, etc.</li><li><strong>RTK Query</strong> - Handles caching, background updates, and optimistic updates</li></ol><p>However, if your state is mostly local to components, React Context + useReducer might be sufficient.</p>',
    authorId: '1',
    author: 'john_doe',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    votes: 5,
    isAccepted: false,
  }
];

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage or use initial data
    const savedQuestions = localStorage.getItem('stackit_questions');
    const savedAnswers = localStorage.getItem('stackit_answers');

    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    } else {
      setQuestions(INITIAL_QUESTIONS);
      localStorage.setItem('stackit_questions', JSON.stringify(INITIAL_QUESTIONS));
    }

    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    } else {
      setAnswers(INITIAL_ANSWERS);
      localStorage.setItem('stackit_answers', JSON.stringify(INITIAL_ANSWERS));
    }

    setLoading(false);
  }, []);

  const saveQuestions = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    localStorage.setItem('stackit_questions', JSON.stringify(newQuestions));
  };

  const saveAnswers = (newAnswers: Answer[]) => {
    setAnswers(newAnswers);
    localStorage.setItem('stackit_answers', JSON.stringify(newAnswers));
  };

  const createQuestion = async (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'answerCount' | 'votes' | 'author'>) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the current user to use their username
    const currentUser = JSON.parse(localStorage.getItem('stackit_user') || 'null');
    if (!currentUser) {
      throw new Error('User not found');
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      ...questionData,
      author: currentUser.username, // Use actual username
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answerCount: 0,
      votes: 0,
    };

    const updatedQuestions = [newQuestion, ...questions];
    saveQuestions(updatedQuestions);
    return newQuestion;
  };

  const createAnswer = async (answerData: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'isAccepted' | 'author'>) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the current user to use their username
    const currentUser = JSON.parse(localStorage.getItem('stackit_user') || 'null');
    if (!currentUser) {
      throw new Error('User not found');
    }

    const newAnswer: Answer = {
      id: Date.now().toString(),
      ...answerData,
      author: currentUser.username, // Use actual username
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      votes: 0,
      isAccepted: false,
    };

    const updatedAnswers = [...answers, newAnswer];
    saveAnswers(updatedAnswers);

    // Update question answer count
    const updatedQuestions = questions.map(q => 
      q.id === answerData.questionId 
        ? { ...q, answerCount: q.answerCount + 1 }
        : q
    );
    saveQuestions(updatedQuestions);

    return newAnswer;
  };

  const vote = async (answerId: string, voteType: 'up' | 'down', userId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get existing votes from localStorage
    const votes = JSON.parse(localStorage.getItem('stackit_votes') || '{}');
    const voteKey = `${userId}-${answerId}`;
    const existingVote = votes[voteKey];

    let voteChange = 0;
    if (existingVote === voteType) {
      // Remove vote
      delete votes[voteKey];
      voteChange = voteType === 'up' ? -1 : 1;
    } else if (existingVote) {
      // Change vote
      votes[voteKey] = voteType;
      voteChange = voteType === 'up' ? 2 : -2;
    } else {
      // New vote
      votes[voteKey] = voteType;
      voteChange = voteType === 'up' ? 1 : -1;
    }

    localStorage.setItem('stackit_votes', JSON.stringify(votes));

    // Update answer votes
    const updatedAnswers = answers.map(a => 
      a.id === answerId 
        ? { ...a, votes: a.votes + voteChange }
        : a
    );
    saveAnswers(updatedAnswers);
  };

  const acceptAnswer = async (answerId: string, questionId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update answers
    const updatedAnswers = answers.map(a => ({
      ...a,
      isAccepted: a.id === answerId ? true : a.questionId === questionId ? false : a.isAccepted
    }));
    saveAnswers(updatedAnswers);

    // Update question
    const updatedQuestions = questions.map(q => 
      q.id === questionId 
        ? { ...q, acceptedAnswerId: answerId }
        : q
    );
    saveQuestions(updatedQuestions);
  };

  const getQuestionAnswers = (questionId: string) => {
    return answers
      .filter(a => a.questionId === questionId)
      .sort((a, b) => {
        if (a.isAccepted && !b.isAccepted) return -1;
        if (!a.isAccepted && b.isAccepted) return 1;
        return b.votes - a.votes;
      });
  };

  const getUserVote = async (answerId: string, userId: string): Promise<'up' | 'down' | undefined> => {
    const votes = JSON.parse(localStorage.getItem('stackit_votes') || '{}');
    return votes[`${userId}-${answerId}`];
  };

  return {
    questions,
    answers,
    loading,
    createQuestion,
    createAnswer,
    vote,
    acceptAnswer,
    getQuestionAnswers,
    getUserVote,
  };
};
import { User, Question, Answer, Notification } from '../types';
import { 
  authService, 
  questionService, 
  answerService, 
  voteService, 
  notificationService 
} from './mongodb';

// Export the MongoDB services directly
export { 
  authService, 
  questionService, 
  answerService, 
  voteService, 
  notificationService 
};
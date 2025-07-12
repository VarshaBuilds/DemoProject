import express from 'express';
import Vote from '../models/Vote.js';
import Answer from '../models/Answer.js';
import User from '../models/User.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Vote on answer
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { answerId, voteType } = req.body;
    
    // Check if user has answered enough questions
    const user = await User.findById(req.user._id);
    if (!user || user.answerCount < 2) {
      return res.status(403).json({ 
        message: 'You must answer at least 2 questions before voting' 
      });
    }
    
    // Check existing vote
    const existingVote = await Vote.findOne({ 
      userId: req.user._id, 
      answerId 
    });
    
    if (existingVote) {
      if (existingVote.type === voteType) {
        // Remove vote
        await Vote.deleteOne({ _id: existingVote._id });
        await Answer.findByIdAndUpdate(answerId, { 
          $inc: { votes: voteType === 'up' ? -1 : 1 } 
        });
      } else {
        // Change vote
        existingVote.type = voteType;
        await existingVote.save();
        await Answer.findByIdAndUpdate(answerId, { 
          $inc: { votes: voteType === 'up' ? 2 : -2 } 
        });
      }
    } else {
      // New vote
      await Vote.create({ 
        userId: req.user._id, 
        answerId, 
        type: voteType 
      });
      await Answer.findByIdAndUpdate(answerId, { 
        $inc: { votes: voteType === 'up' ? 1 : -1 } 
      });
    }
    
    res.json({ message: 'Vote recorded' });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user vote for answer
router.get('/:answerId/user', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const vote = await Vote.findOne({ 
      userId: req.user._id, 
      answerId: req.params.answerId 
    });
    
    res.json({ voteType: vote?.type || null });
  } catch (error) {
    console.error('Error fetching user vote:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get all projects for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    }).populate('owner members');
    
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner members tasks');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check access
    const hasAccess = project.owner._id.toString() === req.userId ||
                     project.members.some(m => m._id.toString() === req.userId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }
    
    const project = new Project({
      name,
      description,
      owner: req.userId,
      members: []
    });
    
    await project.save();
    
    // Add project to user's projects
    await User.findByIdAndUpdate(req.userId, {
      $push: { projects: project._id }
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only owner can update
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can update project' });
    }
    
    const { name, description } = req.body;
    
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only owner can delete
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }
    
    await Project.findByIdAndDelete(req.params.id);
    
    // Remove project from all users
    await User.updateMany(
      { projects: req.params.id },
      { $pull: { projects: req.params.id } }
    );
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to project
router.post('/:id/members', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only owner can add members
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can add members' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already member
    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }
    
    project.members.push(user._id);
    await project.save();
    
    // Add project to user's projects
    user.projects.push(project._id);
    await user.save();
    
    res.json({ message: 'Member added successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

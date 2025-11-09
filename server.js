const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

// MongoDB Connection - Direct URL (No .env)
mongoose.connect('mongodb://localhost:27017/project-mgmt-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'my-super-secret-session-key-12345',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// View routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('register', { error: null });
});

app.get('/dashboard', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  try {
    const User = require('./models/User');
    const Project = require('./models/Project');
    
    const user = await User.findById(req.session.userId);
    const projects = await Project.find({
      $or: [
        { owner: req.session.userId },
        { members: req.session.userId }
      ]
    }).populate('owner members');
    
    res.render('dashboard', { user, projects });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.get('/project/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  try {
    const User = require('./models/User');
    const Project = require('./models/Project');
    const Task = require('./models/Task');
    
    const user = await User.findById(req.session.userId);
    const project = await Project.findById(req.params.id)
      .populate('owner members');
    
    if (!project) {
      return res.status(404).send('Project not found');
    }
    
    const hasAccess = project.owner._id.toString() === req.session.userId ||
                     project.members.some(m => m._id.toString() === req.session.userId);
    
    if (!hasAccess) {
      return res.status(403).send('Access denied');
    }
    
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo createdBy comments.author');
    
    res.render('project', { user, project, tasks });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

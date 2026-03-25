const bcrypt = require('bcryptjs');

// In-memory store
const users = new Map();
const simulations = [];
const chatMessages = [];

// Seed demo user
const seedDemo = async () => {
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const demoUser = {
    _id: 'demo-user-id-001',
    name: 'Alex Johnson',
    email: 'demo@lifetwin.ai',
    password: hashedPassword,
    twinProfile: {
      communicationStyle: 'analytical',
      tone: 'professional',
      preferences: ['innovation', 'efficiency', 'growth', 'learning'],
      habits: ['morning routines', 'strategic planning', 'continuous learning', 'journaling'],
      completionScore: 72
    },
    simulationsCount: 3,
    chatSessionsCount: 7,
    createdAt: new Date('2024-01-15')
  };
  users.set('demo@lifetwin.ai', demoUser);

  // Seed some simulations
  simulations.push({
    _id: 'sim-001',
    userId: 'demo-user-id-001',
    decision: 'Should I quit my job to start a startup?',
    scenarios: [
      {
        title: 'Leap of Faith – Go All In',
        shortTerm: 'Immediate income drop, high focus on startup. Tight finances for 6-12 months.',
        longTerm: 'Potential for 5-10x income growth if successful within 3 years.',
        risks: ['Financial instability', 'Market uncertainty', 'Emotional stress'],
        opportunities: ['Full ownership', 'Equity', 'Faster iteration'],
        score: 74
      },
      {
        title: 'Parallel Path – Side Hustle First',
        shortTerm: 'Keep current job, build MVP on evenings and weekends.',
        longTerm: 'Validate market fit before full commitment. Transition when revenue hits 50% of salary.',
        risks: ['Burnout risk', 'Slower growth', 'Divided attention'],
        opportunities: ['Financial safety net', 'Real market testing', 'Lower pressure'],
        score: 88
      },
      {
        title: 'Strategic Pivot – New Role First',
        shortTerm: 'Move to a startup to gain industry knowledge and connections.',
        longTerm: 'Build skills and network over 18 months, then launch informed venture.',
        risks: ['Delayed start', 'Comfort trap', 'Others may launch first'],
        opportunities: ['Domain expertise', 'Industry connections', 'Funded learning'],
        score: 65
      }
    ],
    createdAt: new Date('2024-02-10')
  });

  simulations.push({
    _id: 'sim-002',
    userId: 'demo-user-id-001',
    decision: 'Should I relocate to San Francisco for a tech opportunity?',
    scenarios: [
      {
        title: 'Bold Move – Relocate Now',
        shortTerm: 'Accept costs and disruption. Build new social circle from scratch.',
        longTerm: 'New environment unlocks career opportunities and industry connections.',
        risks: ['Social isolation initially', 'High cost of living', 'Homesickness'],
        opportunities: ['Career advancement', 'Tech ecosystem access', 'Network expansion'],
        score: 79
      },
      {
        title: 'Test Drive – Extended Visit',
        shortTerm: 'Spend 2-3 months there before committing. Remote work if possible.',
        longTerm: 'Make informed decision with real experience. Lower regret risk.',
        risks: ['Limbo feeling', 'Delayed career moves', 'Relationship strain'],
        opportunities: ['Informed choice', 'Network building', 'Reduced risk'],
        score: 85
      }
    ],
    createdAt: new Date('2024-03-05')
  });

  console.log('✅ Demo user seeded: demo@lifetwin.ai / demo123');
};

seedDemo();

const getInMemoryUser = (email) => users.get(email);

const getUserById = (id) => {
  for (const user of users.values()) {
    if (user._id === id) return user;
  }
  return null;
};

const createUser = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    _id: `user-${Date.now()}`,
    name,
    email,
    password: hashedPassword,
    twinProfile: {
      communicationStyle: '',
      tone: '',
      preferences: [],
      habits: [],
      completionScore: 0
    },
    simulationsCount: 0,
    chatSessionsCount: 0,
    createdAt: new Date()
  };
  users.set(email, user);
  return user;
};

module.exports = { users, simulations, chatMessages, getInMemoryUser, getUserById, createUser };

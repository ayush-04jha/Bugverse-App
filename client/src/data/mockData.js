export const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@bugverse.com',
    role: 'admin'
  },
  {
    id: '2',
    name: 'John Developer',
    email: 'john@bugverse.com',
    role: 'developer'
  },
  {
    id: '3',
    name: 'Jane Tester',
    email: 'jane@bugverse.com',
    role: 'tester'
  },
  {
    id: '4',
    name: 'Mike Developer',
    email: 'mike@bugverse.com',
    role: 'developer'
  },
  {
    id: '5',
    name: 'Sarah Tester',
    email: 'sarah@bugverse.com',
    role: 'tester'
  }
];

export const mockBugs = [
  {
    id: '1',
    title: 'Login button not responding on mobile',
    description: 'When users try to login on mobile devices, the login button becomes unresponsive after clicking. This happens consistently on iOS Safari and Chrome mobile browsers.',
    priority: 'high',
    status: 'open',
    reportedBy: '3',
    assignedTo: '2',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    tags: ['mobile', 'ui', 'authentication'],
    comments: [
      {
        id: '1',
        userId: '2',
        userName: 'John Developer',
        content: 'I can reproduce this issue. Looking into the CSS media queries.',
        createdAt: '2024-01-15T11:00:00Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Dashboard loading performance issue',
    description: 'The main dashboard takes over 5 seconds to load when there are more than 100 bugs in the system. Users are experiencing timeout errors.',
    priority: 'critical',
    status: 'in-progress',
    reportedBy: '5',
    assignedTo: '2',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    tags: ['performance', 'dashboard', 'backend'],
    comments: [
      {
        id: '2',
        userId: '2',
        userName: 'John Developer',
        content: 'Working on optimizing the database queries. Should have a fix ready by tomorrow.',
        createdAt: '2024-01-15T09:15:00Z'
      }
    ]
  },
  {
    id: '3',
    title: 'Email notifications not being sent',
    description: 'Users are not receiving email notifications when bugs are assigned to them or when there are status updates.',
    priority: 'medium',
    status: 'testing',
    reportedBy: '3',
    assignedTo: '4',
    createdAt: '2024-01-13T16:45:00Z',
    updatedAt: '2024-01-15T08:30:00Z',
    tags: ['email', 'notifications', 'backend'],
    comments: [
      {
        id: '3',
        userId: '4',
        userName: 'Mike Developer',
        content: 'Fixed the SMTP configuration. Ready for testing.',
        createdAt: '2024-01-15T08:30:00Z'
      }
    ]
  },
  {
    id: '4',
    title: 'Search functionality returns incorrect results',
    description: 'When searching for bugs using keywords, the search returns bugs that don\'t contain the searched terms.',
    priority: 'medium',
    status: 'resolved',
    reportedBy: '5',
    assignedTo: '2',
    createdAt: '2024-01-12T11:20:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
    tags: ['search', 'frontend', 'bug'],
    comments: [
      {
        id: '4',
        userId: '2',
        userName: 'John Developer',
        content: 'Updated the search algorithm to use fuzzy matching. Issue resolved.',
        createdAt: '2024-01-14T15:45:00Z'
      }
    ]
  },
  {
    id: '5',
    title: 'File upload fails for large attachments',
    description: 'Users cannot upload files larger than 5MB when reporting bugs. The upload progress bar gets stuck at 50%.',
    priority: 'low',
    status: 'open',
    reportedBy: '3',
    assignedTo: null,
    createdAt: '2024-01-16T09:10:00Z',
    updatedAt: '2024-01-16T09:10:00Z',
    tags: ['upload', 'files', 'backend'],
    comments: []
  }
];
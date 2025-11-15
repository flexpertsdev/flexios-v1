
import type { Feature, Page, DatabaseTable, Documentation, ChangelogEntry, RoadmapPhase } from './types';

export const features: Feature[] = [
    { id: 1, name: 'User Authentication', status: 'complete', priority: 'High', complexity: 'High', description: 'Comprehensive auth system for secure user login and registration.', requirements: ['Email/password login', 'OAuth 2.0 with Google', 'Forgot password flow'], dependencies: ['Database'] },
    { id: 2, name: 'Patient Management', status: 'in-progress', priority: 'High', complexity: 'High', description: 'Centralized system for managing patient records and medical history.', requirements: ['Patient registration form', 'View/edit patient details', 'Upload medical documents'], dependencies: ['User Authentication'] },
    { id: 3, name: 'Appointment Booking', status: 'pending', priority: 'Medium', complexity: 'Medium', description: 'Interactive scheduling system for patients and doctors.', requirements: ['Calendar view for availability', 'Book/cancel appointments', 'Automated email reminders'], dependencies: ['Patient Management'] },
];

export const pages: Page[] = [
    { id: 1, name: 'Dashboard', features: [1, 2], database: [1, 2], type: "Analytics Dashboard" },
    { id: 2, name: 'Patient List', features: [1, 2], database: [2], type: "Data Table Page" },
    { id: 3, name: 'Appointments', features: [2, 3], database: [2, 3], type: "Calendar Page" },
];

export const database: DatabaseTable[] = [
    { id: 1, name: 'users', fields: '8' },
    { id: 2, name: 'patients', fields: '12' },
    { id: 3, name: 'appointments', fields: '6' },
];

export const documentation: Documentation[] = [
    { id: 1, title: 'Getting Started', description: 'Quick start guide for developers', content: '<h2>Welcome!</h2><p>This is the getting started guide for the Hospital Management System. It provides all the necessary information to set up your development environment and begin contributing.</p>' },
    { id: 2, title: 'Architecture Overview', description: 'System design and patterns', content: '<h2>Architecture</h2><p>We use a micro-frontend architecture built on React with a Node.js backend. This allows for modular development and independent deployments of different features.</p>' },
    { id: 3, title: 'API Reference', description: 'Complete API documentation', content: '<h2>API</h2><p>Our API is built following RESTful principles. All endpoints are documented here with examples for requests and responses.</p>' },
    { id: 4, title: 'Deployment Guide', description: 'How to deploy the application', content: '<h2>Deployment</h2><p>Follow these steps to deploy the application to a production environment using Docker and Kubernetes.</p>' },
    { id: 5, title: 'Security Guide', description: 'Best practices and compliance', content: '<h2>Security</h2><p>Our app is HIPAA-compliant. This document outlines the security measures in place, including data encryption, access controls, and audit logs.</p>' }
];

export const changelog: ChangelogEntry[] = [
    {
        date: '2024-07-15', time: '14:30',
        changes: [
            { id: 1, type: 'feature', title: 'Added OAuth 2.0 Support', description: 'User Authentication feature now supports social login', details: ['Google OAuth integration', 'Facebook login support'] },
            { id: 2, type: 'update', title: 'Updated Dashboard Page', description: 'Redesigned analytics section with new charts', details: ['Added revenue chart', 'Improved loading performance'] }
        ]
    },
    {
        date: '2024-07-14', time: '10:15',
        changes: [
            { id: 3, type: 'feature', title: 'Created Patient Management Feature', description: 'New comprehensive patient record system', details: ['Patient registration', 'Medical history tracking'] },
            { id: 4, type: 'database', title: 'Added Patients Table', description: 'Database schema for patient records' }
        ]
    },
    {
        date: '2024-07-13', time: '16:45',
        changes: [
            { id: 5, type: 'vision', title: 'Updated Vision Statement', description: 'Refined project goals and objectives' },
            { id: 6, type: 'feature', title: 'Initial User Authentication Setup', description: 'Created core authentication system', details: ['Email/password login', 'JWT token management'] }
        ]
    }
];

export const roadmap: RoadmapPhase[] = [
    { id: 1, name: 'Phase 1: Core Infrastructure', timeline: 'Completed - Q2 2024', status: 'Completed', progress: 100, items: ['User authentication system', 'Database schema design', 'API foundation', 'Design system setup'] },
    { id: 2, name: 'Phase 2: Patient Management', timeline: 'In Progress - Q3 2024', status: 'In Progress', progress: 65, items: ['Patient registration', 'Medical records', 'Document management', 'Search and filtering'] },
    { id: 3, name: 'Phase 3: Appointments & Scheduling', timeline: 'Planned - Q4 2024', status: 'Planned', progress: 0, items: ['Calendar integration', 'Appointment booking', 'Automated reminders', 'Conflict detection'] },
];

export const vision = {
    statement: "Build a comprehensive Hospital Management System that streamlines patient care, reduces administrative burden, and improves healthcare outcomes through intelligent automation and data-driven insights.",
    targetUsers: [
        { emoji: '👨‍⚕️', title: 'Healthcare Providers', desc: 'Doctors, nurses, specialists' },
        { emoji: '🏥', title: 'Administrative Staff', desc: 'Receptionists, billing, HR' },
        { emoji: '🤒', title: 'Patients', desc: 'Portal access and bookings' },
    ]
};

export const architecture = {
    techStack: [
        { emoji: '⚛️', title: 'React 18', desc: 'Frontend' },
        { emoji: '🤖', title: 'Gemini API', desc: 'AI Brain' },
        { emoji: '📦', title: 'TypeScript', desc: 'Language' },
        { emoji: '🎨', title: 'Tailwind', desc: 'Styling' },
    ],
    layers: [
        { title: 'Presentation Layer', desc: 'React components, hooks for state management', color: 'primary' },
        { title: 'Service Layer', desc: 'Gemini API integration, data fetching', color: 'blue' },
        { title: 'Data Layer', desc: 'Dexie for local persistence', color: 'purple' },
    ]
};

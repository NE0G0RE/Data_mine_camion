// Test file to verify module resolution
import { roles, users, userRoles } from '../shared/dist/index.js';
import type { Role } from '../shared/dist/index.js';

console.log('Imported roles:', roles);
console.log('Imported users:', users);
console.log('Imported userRoles:', userRoles);

// Test type import
const testRole: Role = {
  id: 'test',
  name: 'Test Role',
  description: 'Test',
  isActive: true,
  isSystem: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

console.log('Test role:', testRole);

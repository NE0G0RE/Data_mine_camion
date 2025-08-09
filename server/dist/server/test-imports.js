// Test file to verify module resolution
import { roles, users, userRoles } from '../shared/dist/index.js';
console.log('Imported roles:', roles);
console.log('Imported users:', users);
console.log('Imported userRoles:', userRoles);
// Test type import
const testRole = {
    id: 'test',
    name: 'Test Role',
    description: 'Test',
    isActive: true,
    isSystem: false,
    createdAt: new Date(),
    updatedAt: new Date()
};
console.log('Test role:', testRole);
//# sourceMappingURL=test-imports.js.map
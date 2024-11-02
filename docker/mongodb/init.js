// MongoDB initialization script
db = db.getSiblingDB('backend_template');

// Create application user
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'backend_template'
    }
  ]
});

// Create test database
db = db.getSiblingDB('backend_template_test');

db.createUser({
  user: 'test_user',
  pwd: 'test_password',
  roles: [
    {
      role: 'readWrite',
      db: 'backend_template_test'
    }
  ]
});

print('MongoDB initialization completed');

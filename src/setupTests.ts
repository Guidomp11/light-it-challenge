// Mock multer config
jest.mock('./config/multer', () => ({
  uploadDocumentPhoto: jest.fn((req, res, callback) => {
    callback(null);
  }),
}));

// Mock bull
jest.mock('bull', () => {
  return jest.fn(() => ({
    add: jest.fn(),
    process: jest.fn(),
    on: jest.fn(),
  }));
});

// Mock TypeORM
jest.mock('typeorm', () => ({
  DataSource: jest.fn(() => ({
    initialize: jest.fn(),
    getRepository: jest.fn(() => ({
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    })),
  })),
  Entity: () => (target: any) => target,
  PrimaryGeneratedColumn: () => (target: any, key: any) => {},
  Column: () => (target: any, key: any) => {},
  CreateDateColumn: () => (target: any, key: any) => {},
  UpdateDateColumn: () => (target: any, key: any) => {},
}));

// Delete console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

import { Repository } from 'typeorm';

export type MockRepository<T = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

export const repositoryMockFactory = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  save: jest.fn((entity) => entity),
  create: jest.fn((entity) => entity),
  preload: jest.fn(),
  findAndCount: jest.fn().mockResolvedValue([[], 0]),
  find: jest.fn().mockResolvedValue([]),
  findBy: jest.fn().mockResolvedValue([]),
  remove: jest.fn(),
  softRemove: jest.fn(),
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '../audit.service';

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditService],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('Should log an audit entry with action, userId and details', () => {
      expect(() =>
        service.log('USER_CREATED', 'userId-123', { email: 'test@test.com' }),
      ).not.toThrow();
    });

    it('Should log an audit entry without details', () => {
      expect(() => service.log('LOGIN_SUCCESS', 'userId-456')).not.toThrow();
    });
  });
});

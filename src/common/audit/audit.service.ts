import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuditService {
  private readonly logger = new Logger('AUDIT');

  log(action: string, userId: string, details?: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        action,
        userId,
        ...details,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}

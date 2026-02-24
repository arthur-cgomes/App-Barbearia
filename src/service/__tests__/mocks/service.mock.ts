import { ServiceType } from '../../../common/enum/service-type.enum';
import { Service } from '../../entity/service.entity';

export const mockService = {
  id: 'serviceId',
  name: 'name',
  type: ServiceType.HAIR,
  price: 50,
  durationMinutes: 60,
} as Service;

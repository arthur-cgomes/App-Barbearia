import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCnpj', async: false })
export class IsCnpjConstraint implements ValidatorConstraintInterface {
  validate(cnpj: string): boolean {
    if (!cnpj) return false;
    const cleaned = cnpj.replace(/[^\d]+/g, '');
    if (cleaned.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false;

    const calcDigit = (str: string, weights: number[]): number => {
      let sum = 0;
      for (let i = 0; i < weights.length; i++)
        sum += parseInt(str[i]) * weights[i];
      const rem = sum % 11;
      return rem < 2 ? 0 : 11 - rem;
    };

    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    if (calcDigit(cleaned, w1) !== parseInt(cleaned[12])) return false;
    return calcDigit(cleaned, w2) === parseInt(cleaned[13]);
  }

  defaultMessage(): string {
    return 'CNPJ inválido';
  }
}

export function IsCnpj(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCnpjConstraint,
    });
  };
}

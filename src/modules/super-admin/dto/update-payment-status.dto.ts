import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdatePaymentStatusDto {
  @IsIn(['approved', 'rejected'])
  @IsNotEmpty()
  status: 'approved' | 'rejected';
}

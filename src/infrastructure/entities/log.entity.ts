import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { ErrorEntity } from './error.entity';
import { ProcessStepEnum } from '../../core/enums/processStep.enum';

@Entity()
export class LogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: boolean;

  @Column({
    type: 'enum',
    enum: ProcessStepEnum,
    default: ProcessStepEnum.GETORDERINFO,
  })
  process: ProcessStepEnum;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @ManyToOne(() => OrderEntity, (order) => order.logs)
  order: OrderEntity;

  @ManyToOne(() => ErrorEntity, (error) => error.logs, { nullable: true })
  error: ErrorEntity;
}

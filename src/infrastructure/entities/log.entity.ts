import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { ErrorEntity } from './error.entity';

@Entity()
export class LogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: boolean;

  @Column()
  process: string;

  @Column({ type: 'timestamptz' })
  timeStamp: Date;

  @ManyToOne(() => OrderEntity, (order) => order.logs)
  order: OrderEntity;

  @ManyToOne(() => ErrorEntity, (error) => error.logs, { nullable: true })
  error: ErrorEntity;
}

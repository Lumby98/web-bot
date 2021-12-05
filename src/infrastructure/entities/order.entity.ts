import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LogEntity } from './log.entity';

@Entity()
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNr: string;

  @Column()
  completed: boolean;

  @OneToMany(() => LogEntity, (log) => log.order)
  logs: LogEntity[];
}

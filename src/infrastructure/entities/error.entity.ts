import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LogEntity } from './log.entity';

@Entity()
export class ErrorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  errorMessage: string;

  @Column({ type: 'text', nullable: true })
  displayErrorMessage?: string;

  @OneToMany(() => LogEntity, (log) => log.error)
  logs: LogEntity[];
}

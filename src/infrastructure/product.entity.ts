import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Status } from '../enums/status.enum';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public brand: string;

  @Column()
  public articleName: string;

  @Column()
  public articleNo: string;

  @Column({ type: 'enum', enum: Status, default: Status.NEW })
  public status: Status;
}

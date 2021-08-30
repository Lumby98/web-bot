import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  // true = active = 1 | false = inactive = 0
  @Column({ type: 'bit' })
  public active: number;
}

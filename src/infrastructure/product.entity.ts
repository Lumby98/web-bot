import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public brand: string;

  @Column()
  public articleName: string;

  @Column()
  public articleNo: string;

  @Column()
  public status: string;
}

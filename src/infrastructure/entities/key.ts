import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Key {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public password: string;
}

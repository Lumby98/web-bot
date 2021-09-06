import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Size } from './size.entity';

@Entity()
export class HultaforsProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  articleNumber: string;

  @Column()
  articleName: string;

  @OneToMany(() => Size, (size) => size.product)
  sizes: Size[];
}

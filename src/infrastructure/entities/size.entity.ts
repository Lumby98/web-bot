import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { HultaforsProduct } from './hultafors.product.entity';

@Entity()
export class Size {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  size: number;

  @Column({ type: 'bit' })
  status: number;

  @Column({ nullable: true })
  date: string;

  @ManyToOne(
    () => HultaforsProduct,
    (hultaforsProduct) => hultaforsProduct.sizes,
  )
  product: HultaforsProduct;
}

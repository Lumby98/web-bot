import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public username: string;

  @Column()
  public password: string;

  // true = admin = 1 | false = non admin = 0
  @Column({ type: 'bit' })
  public admin: number;
}

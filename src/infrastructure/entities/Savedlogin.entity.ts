import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SavedLogin {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public username: string;

  @Column()
  public password: string;

  @Column()
  public loginType: string;

  @Column()
  public salt: string;

  @Column()
  public iv: string;
}

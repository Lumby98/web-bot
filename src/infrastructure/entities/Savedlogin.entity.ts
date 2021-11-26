import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LoginTypeEnum } from '../../core/enums/loginType.enum';

@Entity()
export class SavedLogin {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public username: string;

  @Column()
  public password: string;

  @Column({
    type: 'enum',
    enum: LoginTypeEnum,
    default: LoginTypeEnum.ORTOWEAR,
    unique: true,
  })
  public loginType: LoginTypeEnum;

  @Column()
  public salt: string;

  @Column()
  public iv: string;
}

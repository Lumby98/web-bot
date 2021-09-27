import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Site {
  @PrimaryColumn()
  name: string;

  @Column()
  lastScraped: string;
}

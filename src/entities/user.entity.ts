import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Application } from './application.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Base64 encoded

  @Column()
  name: string;

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];
}

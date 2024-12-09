import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Application } from './application.entity';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column()
  location: string;

  @Column()
  career: string;

  @Column()
  education: string;

  @Column()
  salary: string;

  @Column()
  sectors: string; // Stored as comma-separated string for simplicity

  @Column()
  link: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  techStack: string; // Stored as comma-separated string for simplicity

  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];
}

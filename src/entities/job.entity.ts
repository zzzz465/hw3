import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Application } from './application.entity';
import { Company } from './company.entity';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => Company, (company) => company.jobs, { eager: true })
  company: Company;

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

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Job } from './job.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  industry?: string;

  @Column({ nullable: true })
  size?: string;

  @Column({ nullable: true })
  foundedYear?: number;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  location?: string;

  @OneToMany(() => Job, (job) => job.company)
  jobs: Job[];

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 

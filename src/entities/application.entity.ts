import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Job } from './job.entity';

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.applications)
  user: User;

  @ManyToOne(() => Job, (job) => job.applications)
  job: Job;

  @Column()
  status: string; // 'PENDING', 'ACCEPTED', 'REJECTED'
}

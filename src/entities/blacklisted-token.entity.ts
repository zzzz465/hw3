import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
export class BlacklistedToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  token: string;

  @Column()
  type: 'access' | 'refresh';

  @Column()
  expiresAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
} 

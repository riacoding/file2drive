import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, } from "typeorm";
import {File} from "./File"

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jobName: string;
    
  @Column()
  complete: boolean;

  @Column()
  canceled: boolean;
  
  @OneToMany(()=> File, file=> file.job)
  files: File[]
        
  @CreateDateColumn()
  dateCreated: number;

  @UpdateDateColumn()
  dateUpdated: number;

  
}

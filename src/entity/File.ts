import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import {Job} from "./Job"

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  srcFilename: string;

  @Column()
  destFilename: string;

  @Column()
  srcDirectory: string;

  @Column()
  fileType: string;

  @Column()
  checkedSignature: boolean;

  @Column()
  complete: boolean;

  @ManyToOne(()=> Job, job => job.files)
  job: Job

  @CreateDateColumn()
  dateCreated: number;

  @UpdateDateColumn()
  dateUpdated: number;

  
}

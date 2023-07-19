import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Ams2Results {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  RacePosition: number;

  @Column()
  participantid: number;

  @Column()
  Time: number;

  @Column()
  FastestLapTime: number;

  @Column()
  Lap: number;

  @Column()
  State: number;

  @Column()
  TotalTime: number;

  @Column()
  id_session: number;
}

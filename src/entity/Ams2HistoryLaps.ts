import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Ams2HistoryLaps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  time: number;

  @Column()
  lap: number;

  @Column()
  LapTime: number;

  @Column()
  RacePosition: number;

  @Column()
  Sector1Time: number;

  @Column()
  Sector2Time: number;

  @Column()
  Sector3Time: number;

  @Column()
  CountThisLapTimes: number;

  @Column()
  id_session: number;
}

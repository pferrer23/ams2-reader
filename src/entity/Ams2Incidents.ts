import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Ams2Incidents {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  participantid: number;

  @Column()
  time: number;

  @Column()
  lap: number;

  @Column()
  LapTime: number;

  @Column()
  RacePosition: number;

  @Column()
  event_name: string;

  @Column()
  CollisionMagnitude: number;

  @Column()
  PenaltyThreshold: number;

  @Column()
  PenaltyValue: number;

  @Column()
  refid: number;

  @Column()
  ElapsedTime: number;

  @Column()
  OtherParticipantId: number;

  @Column()
  id_session: number;
}

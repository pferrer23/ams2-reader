import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Ams2Drivers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  participantid: number;

  @Column()
  SteamID: string;

  @Column()
  VehicleId: number;

  @Column()
  join_time: number;

  @Column()
  leave_time: number;

  @Column()
  name: string;

  @Column()
  refid: number;

  @Column()
  id_session: number;
}

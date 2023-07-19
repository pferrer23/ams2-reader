import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Ams2Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  start_time: number;

  @Column()
  end_time: number;

  @Column()
  type: string;

  @Column()
  track_id: string;

  @Column()
  VehicleClassId: string;

  @Column()
  VehicleModelId: string;

  @Column()
  event_id: string;

  @Column()
  server_name: string;

  events?: any | null;

  results?: any | null;
}

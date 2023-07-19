import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { Ams2Session } from '../entity/Ams2Session';
import { Ams2Drivers } from '../entity/Ams2Drivers';
import { Ams2HistoryLaps } from '../entity/Ams2HistoryLaps';
import { Ams2Incidents } from '../entity/Ams2Incidents';
import { Ams2Results } from '../entity/Ams2Results';
dotenv.config();

export const handleReadData = async () => {
  try {
    console.log('Reading file...');
    const data = fs.readFileSync(process.env.FILE_TO_READ, 'utf8');

    let ams2FullDataString = data
      .replace(
        "// Persistent data for addon 'sms_stats', addon version 2.0",
        ''
      )
      .replace('// Automatically maintained by the addon, do not edit!', '')
      .replace('// EOF //', '');

    const fullHistoryObject = JSON.parse(ams2FullDataString);

    const eventIdsArray = await getSavedEventsFromDb();
    const firstPendingHistory = getFirstPendingEvent(
      fullHistoryObject,
      eventIdsArray
    );

    if (firstPendingHistory) {
      const eventProperties = {
        event_id: `${firstPendingHistory.start_time}_${firstPendingHistory.end_time}_${firstPendingHistory.setup.TrackId}`,
        server_name: fullHistoryObject.stats.server.name,
        track_id: firstPendingHistory.setup.TrackId,
        VehicleClassId: firstPendingHistory.setup.VehicleClassId,
        VehicleModelId: firstPendingHistory.setup.VehicleModelId,
      };

      const sessions: Ams2Session[] = Object.keys(
        firstPendingHistory.stages
      ).map((sessionKey) => {
        return {
          ...eventProperties,
          ...firstPendingHistory.stages[sessionKey],
          type: sessionKey,
        };
      });

      console.log(`Saving ${sessions.length} sessions..`);
      await AppDataSource.getRepository(Ams2Session)
        .createQueryBuilder()
        .insert()
        .into(Ams2Session)
        .values(sessions)
        .execute();
      console.log('Formatting sessions data...');
      const { sessionDrivers, sessionLaps, sessionIncidents, sessionResults } =
        formatSessionData(sessions, firstPendingHistory);

      console.log('Saving sessions data (Drivers, Laps and Incidents)...');
      await AppDataSource.getRepository(Ams2Drivers)
        .createQueryBuilder()
        .insert()
        .into(Ams2Drivers)
        .values(sessionDrivers)
        .execute();

      await AppDataSource.getRepository(Ams2HistoryLaps)
        .createQueryBuilder()
        .insert()
        .into(Ams2HistoryLaps)
        .values(sessionLaps)
        .execute();

      await AppDataSource.getRepository(Ams2Incidents)
        .createQueryBuilder()
        .insert()
        .into(Ams2Incidents)
        .values(sessionIncidents)
        .execute();

      await AppDataSource.getRepository(Ams2Results)
        .createQueryBuilder()
        .insert()
        .into(Ams2Results)
        .values(sessionResults)
        .execute();

      console.log('Event data saved succesfully...');
    } else {
      console.log('No pending envents to save...');
    }
  } catch (e) {
    console.log('Error saving sessions data (Drivers, Laps and Incidents)...');
  }
};

const getSavedEventsFromDb = async () => {
  console.log('Getting saved events from DB...');
  const dbCreatedEvents = await AppDataSource.getRepository(Ams2Session)
    .createQueryBuilder('ams2_session')
    .select('ams2_session.event_id')
    .getMany();

  return dbCreatedEvents.map((evt) => evt.event_id);
};

const getFirstPendingEvent = (fullHistoryObject, eventIdsArray) => {
  const pending_history = fullHistoryObject.stats.history.filter((history) => {
    const haveStages = Object.keys(history.stages).length > 0;
    // const haveEndedStages = Object.keys(history.stages).filter(
    //     (st) => st.start_time && st.end_time
    // );
    const isNewHistory = !eventIdsArray.includes(
      `${history.start_time}_${history.end_time}_${history.setup.TrackId}`
    );
    const isFinished = history.end_time > 0;
    return haveStages && isNewHistory && isFinished;
  });

  return pending_history.length > 0 ? pending_history[0] : null;
};

const formatSessionData = (sessions, firstPendingHistory) => {
  let sessionDrivers: Ams2Drivers[] = [];
  let sessionLaps: Ams2HistoryLaps[] = [];
  let sessionIncidents: Ams2Incidents[] = [];
  let sessionResults: Ams2Results[] = [];
  sessions.forEach((session: Ams2Session) => {
    console.log(session.id);
    const insertedSessionId = session.id;

    sessionDrivers = sessionDrivers.concat(
      Object.keys(firstPendingHistory.participants).map((participantid) => {
        return {
          ...firstPendingHistory.participants[participantid],
          member:
            firstPendingHistory.members[
              firstPendingHistory.participants[participantid]?.RefId
            ],
          participantid,
          id_session: insertedSessionId,
          SteamID:
            firstPendingHistory.participants[participantid].SteamID ||
            firstPendingHistory.members[
              firstPendingHistory.participants[participantid]?.RefId
            ]?.SteamId,
          name: firstPendingHistory.participants[participantid].Name,
          refid: firstPendingHistory.participants[participantid].RefId,
        };
      })
    );

    const laps =
      session.events && Array.isArray(session.events)
        ? session.events
            .filter((event) => event.event_name === 'Lap')
            .map((lap) => {
              return {
                ...lap,
                id_session: insertedSessionId,
                lap: lap.attributes.Lap,
                LapTime: lap.attributes.LapTime,
                RacePosition: lap.attributes.RacePosition,
                Sector1Time: lap.attributes.Sector1Time,
                Sector2Time: lap.attributes.Sector2Time,
                Sector3Time: lap.attributes.Sector3Time,
                CountThisLapTimes: lap.attributes.CountThisLapTimes,
              };
            })
        : [];

    sessionLaps = sessionLaps.concat(laps);

    const incidents =
      session.events && Array.isArray(session.events)
        ? session.events
            .filter(
              (event) =>
                event.event_name === 'CutTrackStart' ||
                event.event_name === 'Impact'
            )
            .map((incident) => {
              return {
                ...incident,
                id_session: insertedSessionId,
                lap: incident.attributes.Lap,
                LapTime: incident.attributes.LapTime,
                RacePosition: incident.attributes.RacePosition,
                CollisionMagnitude: incident.attributes.CollisionMagnitude,
                ElapsedTime: incident.attributes.ElapsedTime,
                OtherParticipantId: incident.attributes.OtherParticipantId,
              };
            })
        : [];
    sessionIncidents = sessionIncidents.concat(incidents);

    const results =
      session.results && Array.isArray(session.results)
        ? session.results.map((result) => {
            return {
              ...result,
              id_session: insertedSessionId,
              Time: result.Time,
              FastestLapTime: result.attributes.FastestLapTime,
              Lap: result.attributes.Lap,
              State: result.attributes.State,
              TotalTime: result.attributes.TotalTime,
            };
          })
        : [];
    sessionResults = sessionResults.concat(results);
  });

  return {
    sessionDrivers,
    sessionLaps,
    sessionIncidents,
    sessionResults,
  };
};

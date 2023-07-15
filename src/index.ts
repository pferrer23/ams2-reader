import { AppDataSource } from './data-source';
import { handleReadData } from './services/sessionService';

let isSaving = false;
AppDataSource.initialize()
  .then(async () => {
    setInterval(async () => {
      if (!isSaving) {
        isSaving = true;
        await handleReadData();
        isSaving = false;
      }
    }, 10000);
  })
  .catch((error) => console.log(error));

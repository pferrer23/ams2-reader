# Reader service to copy the AMS2 session information to MySql Database

This project reads the sessions file every 30 seconds and validate if there are new sessions to save in the database.

Steps to run this project:

1. Run `npm i` command
2. Create a file named `.env` in the project root folder with the following structure:

```
DATABASE_TYPE=mysql
DATABASE_PORT={port}
DATABASE_HOST={host}
DATABASE_NAME={database name}
DATABASE_USER={database user name}
DATABASE_PASSWORD={password}
FILE_TO_READ="path/to/file.json"
```

3. Run `npm start` command

## Run in parallel for several servers

1. Remove the `FILE_TO_READ` variable from the `.env` file.
2. Run the server with the FILE environment variable in the console: `FILE_TO_READ="path/to/file.json" npm start`

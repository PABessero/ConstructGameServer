export module DataBase {
  const sqlite3 = require("sqlite3").verbose();
  const db = new sqlite3.Database("db.sqlite3", (err) => {
    if (err) {
      return console.log(err.message.red);
    } else {
      console.log("Connected to the Database".green);
    }
  });
  export function initDB() {
    db.serialize(() => {
      db.run(
        `create table main.world (id integer not null constraint world_pk primary key autoincrement, world_name text default id constraint world_unique_name unique )`,
        (err) => {
          if (err) {
            console.log(err.message.red);
          } else console.log("Created table WORLD".green);
        }
      );
      db.run(
        `create table main.user
                (
                    id        integer not null
                        constraint user_pk
                            primary key autoincrement,
                    username  text default id
                        constraint user_unique_name
                            unique,
                    currentID   text,
                    posX   float,
                    posY   float,
                    posZ   float,
                    rotation    float,
                    world_id   integer
                        constraint player_world
                            references world (id)
                );`,
        (err) => {
          if (err) {
            console.log(err.message.red);
          } else console.log("Created table USER".green);
        }
      );
    });
  }

  export function getUser(username) {
    db.serialize(() => {
      db.all(
        `SELECT * FROM user WHERE username = '${username}'`,
        (err, rows) => {
          if (err) {
            console.log(err.message.red);
          } else {
          }
        }
      );
    });
  }
}

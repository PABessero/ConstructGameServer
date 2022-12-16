import { Player } from "../interfaces/Player";
import { Database, sqlite3 } from "sqlite3";

export module DataBase {
  const sqlite3: sqlite3 = require("sqlite3").verbose();
  const db: Database = new sqlite3.Database("db.sqlite3", (err) => {
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
      db.run(
        `create table main.rarity (
                id integer not null 
                    constraint rarity_pk
                        primary key autoincrement ,
                slug text default id,
                display_name text default slug
                
           )`,
        (err) => {
          if (err) {
            console.log(err.message.red);
          } else console.log("Created table RARITY".green);
        }
      );
      db.run(
        `create table main.item
            (
                id integer not null
                    constraint item_pk
                        primary key autoincrement,
                slug text default id,
                display_name text default slug,
                rarity integer 
                    constraint item_rarity
                        references rarity (id)
            )`,
        (err) => {
          if (err) {
            console.log(err.message.red);
          } else {
            console.log("Created table ITEM".green);
          }
        }
      );
    });
  }

  export function getUser(username) {
    return new Promise((resolve, reject) => {
      let res: Player;
      db.serialize(() => {
        db.all(
          `SELECT * FROM user WHERE username = '${username}'`,
          (err, rows) => {
            console.log("Querying DB");
            if (err) {
              console.log(err.message.red);
              reject(err.message);
            } else if (rows.length > 0) {
              resolve({
                name: rows[0].username,
                x: rows[0].posX,
                y: rows[0].posY,
                z: rows[0].posZ,
                rotation: rows[0].rotation,
              });
            } else {
              console.log("No user found in DB");
              reject("No user found");
            }
          }
        );
      });
      return res;
    });
  }

  export function updateUser(user: Player) {
    db.serialize(() => {
      const sql = `UPDATE user SET currentID='${user.id}', posX=${user.x}, posY=${user.y}, rotation=${user.rotation} WHERE username = '${user.name}'`;
      db.run(sql, (err) => {
        if (err) {
          console.log(err.message.red);
        } else {
        }
      });
    });
  }

  export function createUser(user: Player) {
    db.serialize(() => {
      const sql = `INSERT INTO user (username, currentID, posX, posY, posZ, rotation) VALUES ('${user.name}', '${user.id}', ${user.x}, ${user.y}, ${user.z}, ${user.rotation})`;
      db.run(sql, (err) => {
        if (err) {
          console.log(err.message.red);
        } else {
          console.log("Created Player".green);
        }
      });
    });
  }

  export function setUserOnline(user: Player) {
    db.serialize(() => {
      const sql = `UPDATE user SET`;
    });
  }
}

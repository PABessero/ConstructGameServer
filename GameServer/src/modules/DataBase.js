"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBase = void 0;
var DataBase;
(function (DataBase) {
    const sqlite3 = require("sqlite3").verbose();
    function initDB() {
        const db = new sqlite3.Database("db.sqlite3", (err) => {
            if (err) {
                return console.log(err.message.red);
            }
            else {
                console.log("Connected to the Database".green);
            }
        });
        db.serialize(() => {
            db.run(`create table main.world (id integer not null constraint world_pk primary key autoincrement, world_name text default id constraint world_unique_name unique )`, (err) => {
                if (err) {
                    console.log(err.message.red);
                }
                else
                    console.log("Created table WORLD".green);
            });
            db.run(`create table main.user
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
                );`, (err) => {
                if (err) {
                    console.log(err.message.red);
                }
                else
                    console.log("Created table USER".green);
            });
        });
    }
    DataBase.initDB = initDB;
})(DataBase = exports.DataBase || (exports.DataBase = {}));
//# sourceMappingURL=DataBase.js.map
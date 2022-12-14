"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBase = void 0;
var DataBase;
(function (DataBase) {
    const sqlite3 = require("sqlite3").verbose();
    const db = new sqlite3.Database("db.sqlite3", (err) => {
        if (err) {
            return console.log(err.message.red);
        }
        else {
            console.log("Connected to the Database".green);
        }
    });
    function initDB() {
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
    function getUser(username) {
        return new Promise((resolve, reject) => {
            let res;
            db.serialize(() => {
                db.all(`SELECT * FROM user WHERE username = '${username}'`, (err, rows) => {
                    console.log("Querying DB");
                    if (err) {
                        console.log(err.message.red);
                        reject(err.message);
                    }
                    else if (rows.length > 0) {
                        resolve({
                            name: rows[0].username,
                            x: rows[0].posX,
                            y: rows[0].posY,
                            z: rows[0].posZ,
                            rotation: rows[0].rotation,
                        });
                    }
                    else {
                        console.log("No user found in DB");
                        reject("No user found");
                    }
                });
            });
            return res;
        });
    }
    DataBase.getUser = getUser;
    function updateUser(user) {
        db.serialize(() => {
            const sql = `UPDATE user SET currentID='${user.id}', posX=${user.x}, posY=${user.y}, rotation=${user.rotation} WHERE username = '${user.name}'`;
            db.run(sql, (err) => {
                if (err) {
                    console.log(err.message.red);
                }
                else {
                }
            });
        });
    }
    DataBase.updateUser = updateUser;
    function createUser(user) {
        db.serialize(() => {
            const sql = `INSERT INTO user (username, currentID, posX, posY, posZ, rotation) VALUES ('${user.name}', '${user.id}', ${user.x}, ${user.y}, ${user.z}, ${user.rotation})`;
            db.run(sql, (err) => {
                if (err) {
                    console.log(err.message.red);
                }
                else {
                    console.log("Created Player".green);
                }
            });
        });
    }
    DataBase.createUser = createUser;
    function setUserOnline(user) {
        db.serialize(() => {
            const sql = `UPDATE user SET`;
        });
    }
    DataBase.setUserOnline = setUserOnline;
})(DataBase = exports.DataBase || (exports.DataBase = {}));
//# sourceMappingURL=DataBase.js.map
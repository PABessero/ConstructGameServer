import * as fs from "fs";
import * as httpServer from "http";
import * as httpsServer from "https";
import { WebSocketServer } from "ws";
import "colors";

function d(a) {
  let b = 0;
  for (let f = 0, g = a.j.length; f < g; ++f) a.j[f].F && ++b;
  return b;
}

function k(a) {
  return a.j.length >= a.C;
}

function n(a, b, f, g) {
  const c = a.j.indexOf(b);
  -1 < c && a.j.splice(c, 1);
  a.H.delete(b.id);
  b.g = null;
  console.log(
    "Client '" +
      b.i +
      "' (" +
      b.id +
      ") left '" +
      a.h.l.name +
      "/" +
      a.h.name +
      "/" +
      a.name +
      "', " +
      (a.j.length + " peers").green
  );
  a.host === b
    ? (console.log(
        "Client was host; closing room (kicking " + a.j.length + " peers)"
      ),
      a.remove())
    : (a.host &&
        f &&
        ((f = a.host),
        f.A &&
          f.g &&
          f.g.host === f &&
          f.send({
            message: "peer-quit",
            id: b.id,
            reason: g || "unknown",
          })),
      a.S() && a.remove());
}

class u {
  constructor(a, b, f) {
    this.h = a;
    this.name = b;
    this.O = !1;
    this.R = f;
    this.host = null;
    this.j = [];
    this.H = new Map();
    this.C = globalThis.h.max_clients;
    this.h.v.push(this);
    this.h.M.set(this.name, this);
  }

  remove() {
    this.host && (this.host.g = null);
    this.host = null;
    for (let b = 0, f = this.j.length; b < f; ++b) v(this.j[b], "host-left");
    this.j.length = 0;
    this.H.clear();
    const a = this.h.v.indexOf(this);
    -1 < a && this.h.v.splice(a, 1);
    this.h.M.delete(this.name);
    this.h.S() && this.h.remove();
  }

  S() {
    return !this.j.length;
  }
}

class ha {
  constructor(a, b) {
    this.l = a;
    this.name = b;
    this.v = [];
    this.M = new Map();
    this.l.u.push(this);
    this.l.Y.set(this.name, this);
  }

  W() {
    let a = 0;
    for (let b = 0, f = this.v.length; b < f; ++b) a += this.v[b].j.length;
    return a;
  }

  S() {
    return !this.v.length;
  }

  remove() {
    for (; this.v.length; ) this.v[0].remove();
    const a = this.l.u.indexOf(this);
    -1 < a && this.l.u.splice(a, 1);
    this.l.Y.delete(this.name);
    this.l.S() && this.l.remove();
  }
}
const w = [],
  x = new Map();

function B(a, b) {
  return x.has(a) ? x.get(a) : b ? new ia(a) : null;
}

function C(a, b, f) {
  return a.Y.has(b) ? a.Y.get(b) : f ? new ha(a, b) : null;
}

class ia {
  constructor(a) {
    this.name = a;
    this.u = [];
    this.Y = new Map();
    w.push(this);
    x.set(this.name, this);
  }

  S() {
    return !this.u.length;
  }

  W() {
    let a = 0;
    for (let b = 0, f = this.u.length; b < f; ++b) a += this.u[b].W();
    return a;
  }

  remove() {
    for (; this.u.length; ) this.u[0].remove();
    const a = w.indexOf(this);
    -1 < a && w.splice(a, 1);
    x.delete(this.name);
  }
}
const G = [],
  H = new Map();
let I = 0,
  J = 0;

function K(a) {
  a = a.toLowerCase();
  for (let b = 0, f = G.length; b < f; ++b) {
    const g = G[b];
    if (g.A && g.i.toLowerCase() === a) return g;
  }
  return null;
}

function v(a, b) {
  a.g = null;
  a.F = !1;
  a.K = !1;
  a.G = Date.now();
  a.send({ message: "kicked", reason: b });
}

function L(a) {
  if (!a.T)
    try {
      return (a.B = 0), a.h.ping("ping"), (a.ta = Date.now()), (a.R = !0);
    } catch (b) {
      return (
        console.log(
          (
            "Removed client '" +
            a.i +
            "' (" +
            a.id +
            "), error pinging websocket"
          ).yellow
        ),
        !1
      );
    }
}

function ja(a) {
  const b = globalThis.h;
  a.send({
    message: "welcome",
    protocolrev: b.wa,
    version: b.serverVersion,
    name: b.server_name,
    operator: b.server_operator,
    motd: b.server_motd,
    clientid: a.id,
    ice_servers: b.ice_servers,
  });
}

function sendError(a, errorMessage, reqId) {
  a.send({ message: "error", details: errorMessage, reqid: reqId });
}

/**
 *
 * @param {*} a
 * @param {string} b
 * @param {*} f
 */
function joinRoom(a, b, f) {
  var g = globalThis.h;
  a.G = Date.now();
  a.o = Date.now();
  const c = b.reqid;
  if (a.A)
    if (a.g) sendError(a, "already in a room", c);
    else if (b.game && b.instance) {
      b.game.length > g.m && (b.game = b.game.substr(0, g.m));
      b.instance.length > g.m && (b.instance = b.instance.substr(0, g.m));
      b.room.length > g.m && (b.room = b.room.substr(0, g.m));
      var e = !1,
        l = !0;
      a.l = B(b.game, !0);
      if (0 < g.$ && a.l.W() >= g.$) (a.l = null), sendError(a, "game full", c);
      else {
        a.la = C(a.l, b.instance, !0);
        if (b.room) {
          if (f) {
            e = a.la;
            l = b.room;
            f = b.lock_when_full;
            g = 1;
            var m;
            for (m = null; !m; )
              if (((m = l), 1 < g && (m += g.toString()), ++g, e.M.has(m))) {
                if (((m = e.M.get(m)), k(m) || m.O)) m = null;
              } else m = new u(e, m, f);
            a.g = m;
          } else if (
            ((e = a.la),
            (l = b.room),
            (e = e.M.has(l) ? e.M.get(l) : new u(e, l, !1)),
            (a.g = e),
            k(a.g))
          ) {
            a.g = null;
            sendError(a, "room full", c);
            return;
          }
          a: if (((e = a.g), e.O || k(e) || -1 < e.j.indexOf(a))) l = !1;
          else {
            if (e.host) {
              if (
                (e.host.send({
                  message: "peer-joined",
                  peerid: a.id,
                  peeralias: a.i,
                }),
                !e.host)
              ) {
                console.log(
                  (
                    "Client '" +
                    a.i +
                    "' failed to join room; host error sending peer join notification"
                  ).yellow
                );
                l = !1;
                break a;
              }
            } else e.host = a;
            e.j.push(a);
            e.H.set(a.id, a);
            console.log(
              "Client '" +
                a.i +
                "' (" +
                a.id +
                ") joined '" +
                e.h.l.name +
                "/" +
                e.h.name +
                "/" +
                e.name +
                "' (" +
                (e.host === a ? "host" : "peer") +
                "), " +
                (e.j.length + " peers").green
            );
            l = !0;
          }
          if (l) {
            if (
              ((a.F = !1),
              (a.K = !0),
              (a.sa = Date.now()),
              (e = a.g.host === a))
            )
              (a.F = !0),
                (a.K = !1),
                b.max_clients &&
                  ((f = b.max_clients),
                  0 !== f && (2 > f && (f = 2), (a.g.C = f)));
          } else {
            a.g = null;
            sendError(a, "cannot join room", c);
            return;
          }
        }
        l
          ? a.g
            ? e
              ? ((a.ja = 0),
                (a.X = 0),
                a.send({
                  message: "join-ok",
                  game: b.game,
                  instance: b.instance,
                  room: a.g.name,
                  host: !0,
                  reqid: c,
                }))
              : a.send({
                  message: "join-ok",
                  game: b.game,
                  instance: b.instance,
                  room: a.g.name,
                  host: !1,
                  hostid: a.g.host.id,
                  hostalias: a.g.host.i,
                  reqid: c,
                })
            : a.send({
                message: "join-ok",
                game: b.game,
                instance: b.instance,
                reqid: c,
              })
          : sendError(a, "cannot join room", c);
      }
    } else sendError(a, "invalid game/instance", c);
  else sendError(a, "not logged in", c);
}

function ka(a, b) {
  const f = globalThis.h;
  if (!a.g && b - a.G >= f.inactive_timeout)
    return (
      console.log(
        (
          "Client ID '" +
          a.i +
          "' connection idle for " +
          Math.floor((b - a.G) / 6e4) +
          " mins, disconnecting"
        ).yellow
      ),
      !1
    );
  let g, c;
  if (a.g && !a.F && b >= a.sa + f.confirm_timeout)
    if (
      ((c = (g = a.g.host) && a.ua === g.id),
      (a.ua = g ? g.id : ""),
      a.xa++,
      c
        ? console.log(
            (
              "Confirm timeout expired for '" +
              a.i +
              "', kicking (counting as retry)"
            ).yellow
          )
        : (J++,
          console.log(
            ("Confirm timeout expired for '" + a.i + "', kicking").yellow
          )),
      n(a.g, a, !0, "timeout"),
      v(a, "timeout"),
      g)
    ) {
      const e = g.g;
      c || g.X++;
      if (
        0 === g.ja &&
        g.X >= f.host_max_unconfirmed &&
        (console.log(
          (
            "Host '" +
            g.i +
            "' unable to confirm " +
            g.X +
            " peers; kicking as likely unhostable connection"
          ).yellow
        ),
        sendError(g, "unable to confirm peers, likely unhostable connection"),
        v(g, "unhostable"),
        e && n(e, g, !1),
        a.ra++,
        a.ra >= a.Ba && 0 === a.qa)
      )
        return (
          console.log(
            ("Too many unhostable kicks for '" + a.i + "', disconnecting").red
          ),
          !1
        );
    } else if (a.xa >= f.Aa && 0 === a.va)
      return (
        console.log(
          ("Too many confirm timeouts for '" + a.i + "', disconnecting").red
        ),
        !1
      );
  if (b - a.o < f.ping_frequency) return !0;
  if (a.R) {
    if (b - a.o >= f.client_timeout)
      return (
        console.log(
          (
            "Client '" +
            a.i +
            "' (" +
            a.id +
            ") timed out: not responded for " +
            Math.round((b - a.o) / 100) / 10 +
            "s"
          ).yellow
        ),
        !1
      );
    if (b - a.ta >= f.ping_frequency && !L(a)) return !1;
  } else if (!L(a)) return !1;
  return !0;
}

class la {
  constructor(a) {
    this.h = a;
    this.h.c2_client = this;
    this.oa = this.pa = "";
    this.A = !1;
    this.i = "";
    do {
      a = "";
      const b = globalThis.h,
        f = b.za;
      for (let g = 0, c = b.client_id_digits; g < c; ++g)
        a += f.charAt(Math.floor(Math.random() * f.length));
    } while (H.has(a));
    this.id = a;
    this.g = this.la = this.l = null;
    this.sa = 0;
    this.T = this.F = this.K = false;
    this.ua = "";
    this.X = this.qa = this.ja = this.ra = this.xa = this.va = this.B = 0;
    this.G = Date.now();
    this.o = Date.now();
    this.ta = Date.now();
    this.R = false;
    G.push(this);
    H.set(this.id, this);
  }

  remove(reason) {
    if (!this.T) {
      this.T = !0;
      if (this.h) {
        reason && (this.oa = reason);
        try {
          this.h.close(1002, reason || "");
        } catch (b) {}
        this.h = null;
      }
      this.g && (n(this.g, this, this.K, reason), (this.g = null));
      reason = G.indexOf(this);
      -1 < reason && G.splice(reason, 1);
      H.delete(this.id);
    }
  }

  send(a) {
    if (!this.T) {
      a = JSON.stringify(a);
      try {
        this.h.send(a);
      } catch (b) {
        console.log(
          (
            "Removed client '" +
            this.i +
            "' (" +
            this.id +
            "), error sending to websocket"
          ).yellow
        ),
          this.remove("websocket send error");
      }
    }
  }
}
const ma = Date.now();
let R = 0,
  S = 0,
  T = 0,
  U = 0;
const V = new Map(),
  W = new Map(),
  defaultSettings = {
    wa: 1,
    serverVersion: "1.5",
    server_host: "localhost",
    server_port: 443,
    server_name: "My Multiplayer Signalling Server",
    server_operator: "MyCompany",
    server_motd: "Welcome to the MyCompany Multiplayer Signalling server!",
    ice_servers: ["stun:stun.l.google.com:19302"],
    max_clients: 1e5,
    ping_frequency: 1e4,
    flood_limit: 200,
    flood_ban_period: 6e5,
    flood_ban_limit: 10,
    flood_ban_duration: 36e5,
    client_timeout: 25e3,
    inactive_timeout: 12e5,
    confirm_timeout: 2e4,
    host_max_unconfirmed: 5,
    za: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    client_id_digits: 4,
    Z: 30,
    m: 100,
    $: 0,
    Aa: 5,
    Ba: 5,
    ssl: !0,
    ssl_key: "ssl.key",
    ssl_cert: "ssl.pem",
    ssl_ca_bundle: "",
  };
globalThis.h = defaultSettings;
console.log("*****************************************************".green);
console.log(
  ("Construct multiplayer signalling server v" + defaultSettings.serverVersion)
    .green
);
console.log("*****************************************************".green);

function na(a, b) {
  const f = a.req.connection.remoteAddress;
  W.has(f)
    ? (console.log(
        (
          "Rejected connection from banned address " +
          f +
          " (" +
          Math.floor(
            (W.get(f) + defaultSettings.flood_ban_duration - Date.now()) / 1e3
          ) +
          "s ban remaining)"
        ).yellow
      ),
      b(!1, 401, "Unauthorized"))
    : G.length <= defaultSettings.max_clients
    ? ((a = a.req.headers["sec-websocket-protocol"]),
      b(a && -1 < a.indexOf("c2multiplayer")))
    : (console.log(
        ("Warning: rejected client; server full (got " + G.length + " clients)")
          .yellow
      ),
      b(!1, 503, "Service Unavailable"));
}

function Y(a, b) {
  if (a.url.startsWith("/.well-known/pki-validation/"))
    (a = "pki-validation/" + a.url.substr(28)),
      fs.existsSync(a)
        ? (b.writeHead(200, { "Content-Type": "text/plain" }),
          b.end(fs.readFileSync(a, "utf8")))
        : (b.writeHead(404, { "Content-Type": "text/plain" }),
          b.end("File not found"));
  else {
    b.writeHead(200, { "Content-Type": "text/html" });
    a = Math.floor((Date.now() - ma) / 1e3);
    const f = Math.floor(a / 86400);
    a -= 86400 * f;
    const g = Math.floor(a / 3600);
    a -= 3600 * g;
    const c = Math.floor(a / 60),
      e = I,
      l = e + J;
    b.end(`<title>${defaultSettings.server_name}</title>
<h1>${defaultSettings.server_name}</h1>
<p>${defaultSettings.server_motd}</p>
<h2>Statistics</h2>
<p>
<strong>Uptime:</strong> ${f} days, ${g} hours, ${c} minutes, ${
      a - 60 * c
    } seconds<br/>
<strong>Current connected clients:</strong> ${G.length}<br/>
<strong>Most ever connected clients:</strong> ${R}<br/>
<strong>Total client connections handled:</strong> ${S}<br/>
<strong>Peer connection success rate (approx):</strong> ${
      Math.round((1e3 * e) / l) / 10
    }% (of ${l} total peer connections)<br/>
<strong>Total kicks:</strong> ${T}<br/>
<strong>Total bans:</strong> ${U}<br/>
</p>`);
  }
}

const Z = [];

function oa() {
  const a = Date.now();
  Z.length = G.length;
  for (let b = 0, f = G.length; b < f; b++) Z[b] = G[b];
  for (let b = 0, f = Z.length; b < f; ++b) {
    const g = Z[b];
    ka(g, a) || g.remove("timeout");
  }
  Z.length = 0;
}

function on_connection(ws) {
  S++;
  ws.on("message", function (message) {
    const client = ws.c2_client;
    if (!client.T)
      if ((client.B++, client.B >= defaultSettings.flood_limit)) {
        var parsedMessage = client.pa;
        V.set(parsedMessage, (V.get(parsedMessage) || 0) + 1);
        var l = V.get(parsedMessage);
        console.log(
          (
            "Flood limit exceeded for '" +
            client.i +
            "' (" +
            client.id +
            "), kicked (strike " +
            l +
            " of " +
            defaultSettings.flood_ban_limit +
            ")"
          ).red
        );
        var m = "flood limit exceeded";
        l >= defaultSettings.flood_ban_limit &&
        0 < defaultSettings.flood_ban_limit &&
        "[unknown]" !== parsedMessage
          ? (console.log(
              (
                "BAN for address " +
                parsedMessage +
                " for " +
                Math.floor(defaultSettings.flood_ban_duration / 1e3) +
                "s due to repeated flood limit kicks"
              ).red
            ),
            V.delete(parsedMessage),
            W.set(parsedMessage, Date.now()),
            (m = "flood limit repeatedly exceeded, banned"),
            U++)
          : T++;
        sendError(client, m);
        client.remove(m);
      } else
        try {
          // console.log(JSON.parse(message));
          switch (
            ((parsedMessage = JSON.parse(message)), parsedMessage.message)
          ) {
            case "login":
              const y = globalThis.h;
              client.G = Date.now();
              client.o = Date.now();
              const reqId = parsedMessage.reqid;
              if (client.A) sendError(client, "already logged in", reqId);
              else if (
                1 > parsedMessage.protocolrev ||
                parsedMessage.protocolrev > y.wa
              )
                sendError(client, "protocol revision not supported", reqId),
                  client.remove();
              else if (parsedMessage.alias) {
                parsedMessage.alias.length > y.Z &&
                  (parsedMessage.alias = parsedMessage.alias.substr(0, y.Z));
                var M = parsedMessage.alias;
                if (K(M)) {
                  parsedMessage = 2;
                  do {
                    var aa = M + parsedMessage;
                    ++parsedMessage;
                  } while (K(aa));
                  var z = aa;
                } else z = M;
                client.i = z;
                client.A = !0;
                client.send({
                  message: "login-ok",
                  alias: client.i,
                  reqid: reqId,
                });
                console.log(
                  "Client ID '" +
                    client.id +
                    "' logged in with alias '" +
                    client.i +
                    "'"
                );
              } else sendError(client, "invalid alias", reqId);
              break;
            case "join":
              joinRoom(client, parsedMessage, !1);
              break;
            case "auto-join":
              joinRoom(client, parsedMessage, !0);
              break;
            case "leave":
              client.G = Date.now();
              client.o = Date.now();
              const N = parsedMessage.reqid;
              client.A
                ? client.g
                  ? (n(client.g, client, !1),
                    (client.g = null),
                    (client.F = !1),
                    (client.K = !1),
                    client.send({
                      message: "leave-ok",
                      reqid: N,
                    }))
                  : sendError(client, "not in a room", N)
                : sendError(client, "not logged in", N);
              break;
            case "icecandidate":
              client.o = Date.now();
              if (client.A)
                if (client.g) {
                  var ba = client.g.H.get(parsedMessage.toclientid) || null;
                  ba
                    ? (client.g.host === client && 0 < client.B && client.B--,
                      ba.send({
                        message: "icecandidate",
                        from: client.id,
                        icecandidate: parsedMessage.icecandidate,
                      }))
                    : sendError(client, "specified client ID not in same room");
                } else sendError(client, "not in a room");
              else sendError(client, "not logged in");
              break;
            case "offer":
              client.o = Date.now();
              if (client.A)
                if (client.g)
                  if (client.g.host !== client)
                    sendError(client, "only room host can send offers");
                  else {
                    var ca = client.g.H.get(parsedMessage.toclientid) || null;
                    ca
                      ? (0 < client.B && client.B--,
                        ca.send({
                          message: "offer",
                          from: client.id,
                          offer: parsedMessage.offer,
                        }))
                      : sendError(
                          client,
                          "specified client ID not in same room"
                        );
                  }
                else sendError(client, "not in a room");
              else sendError(client, "not logged in");
              break;
            case "answer":
              client.o = Date.now();
              if (client.A)
                if (client.g)
                  if (client.g.host === client)
                    sendError(client, "room host cannot send answers");
                  else {
                    var da = client.g.H.get(parsedMessage.toclientid) || null;
                    da
                      ? da.send({
                          message: "answer",
                          from: client.id,
                          answer: parsedMessage.answer,
                        })
                      : sendError(
                          client,
                          "specified client ID not in same room"
                        );
                  }
                else sendError(client, "not in a room");
              else sendError(client, "not logged in");
              break;
            case "confirm-peer":
              client.o = Date.now();
              if (client.A)
                if (client.g)
                  if (client.g.host !== client)
                    sendError(client, "must be host to confirm peers");
                  else {
                    0 < client.B && client.B--;
                    var E = client.g.H.get(parsedMessage.id) || null;
                    if (E) {
                      E.F = !0;
                      E.K = !1;
                      E.va++;
                      client.ja++;
                      client.qa++;
                      I++;
                      var r = client.g;
                      if (!r.O && r.R && d(r) >= r.C) {
                        r.O = !0;
                        parsedMessage = [];
                        for (let p = 0, q = r.j.length; p < q; ++p) {
                          const t = r.j[p];
                          t.F || parsedMessage.push(t);
                        }
                        for (let p = 0, q = parsedMessage.length; p < q; ++p)
                          n(r, parsedMessage[p], !0, "room full");
                      }
                    }
                  }
                else sendError(client, "not in a room");
              else sendError(client, "not logged in");
              break;
            case "list-instances":
              const ea = globalThis.h;
              client.G = Date.now();
              client.o = Date.now();
              const qa = parsedMessage.reqid;
              parsedMessage.game.length > ea.m &&
                (parsedMessage.game = parsedMessage.game.substr(0, ea.m));
              l = [];
              const O = B(parsedMessage.game, !1);
              if (O)
                for (let p = 0, q = O.u.length; p < q; ++p) {
                  const t = O.u[p];
                  l.push({ name: t.name, peercount: t.W() });
                }
              client.send({ message: "instance-list", list: l, reqid: qa });
              break;
            case "list-rooms":
              const F = globalThis.h;
              client.G = Date.now();
              client.o = Date.now();
              l = parsedMessage.reqid;
              parsedMessage.game.length > F.m &&
                (parsedMessage.game = parsedMessage.game.substr(0, F.m));
              parsedMessage.instance.length > F.m &&
                (parsedMessage.instance = parsedMessage.instance.substr(
                  0,
                  F.m
                ));
              m = parsedMessage.which;
              z = [];
              const fa = B(parsedMessage.game, !1);
              if (fa) {
                const p = C(fa, parsedMessage.instance, !1);
                if (p)
                  for (let q = 0, t = p.v.length; q < t; ++q) {
                    const A = p.v[q];
                    parsedMessage = "available";
                    if (A.O) {
                      if (
                        ((parsedMessage = "locked"),
                        "unlocked" === m || "available" === m)
                      )
                        continue;
                    } else if (
                      k(A) &&
                      ((parsedMessage = "full"), "available" === m)
                    )
                      continue;
                    z.push({
                      name: A.name,
                      peercount: d(A),
                      maxpeercount: A.C,
                      state: parsedMessage,
                    });
                  }
              }
              client.send({ message: "room-list", list: z, reqid: l });
              break;
            default:
              sendError(client, "protocol error"),
                client.remove("protocol error");
          }
        } catch (y) {
          console.log(
            (
              "Removing client '" +
              client.i +
              "' due to protocol error (" +
              y +
              ")"
            ).red
          ),
            client.remove("protocol error");
        }
  });
  ws.on("close", function (g, c) {
    g = ws.c2_client;
    g.remove();
    let e = "";
    c ? (e = c) : g.oa && (e = g.oa);
    console.log(
      "Client '" +
        g.i +
        "' (" +
        g.id +
        ") from " +
        (g.pa || "[unknown]").magenta +
        " disconnected" +
        (e ? " ('" + e + "')" : "") +
        "; " +
        (G.length + " clients total").cyan
    );
  });
  ws.on("pong", function () {
    var g = ws.c2_client;
    g.o = Date.now();
    g.R = !1;
  });
  let b = "";
  ws._socket && ws._socket.remoteAddress && (b = "" + ws._socket.remoteAddress);
  const f = new la(ws);
  ws.on("error", function (g) {
    console.log(
      (
        "Removing client '" +
        f.i +
        "' (" +
        f.id +
        ") due to websocket error (" +
        g +
        ")"
      ).red
    );
    f.remove("websocket error");
  });
  b ? (f.pa = b) : (b = "[unknown]");
  ja(f);
  G.length > R && (R = G.length);
  console.log(
    "Client ID '" +
      f.id +
      "' connected from " +
      b.magenta +
      "; " +
      (G.length + " clients total").cyan
  );
}

function ra() {
  V.clear();
  const a = Date.now();
  for (const [b, f] of W.entries())
    f + defaultSettings.flood_ban_duration < a &&
      (console.log(
        (
          "Unbanned address " +
          b +
          " after serving " +
          Math.floor(defaultSettings.flood_ban_duration / 1e3) +
          "s ban"
        ).yellow
      ),
      W.delete(b));
}

(async () => {
  if (fs.existsSync("config.js"))
    try {
      const settingsImporter = await import("./config.js");
      if (settingsImporter.default) {
        var settings = settingsImporter.default;
        defaultSettings.server_host =
          settings.server_host || defaultSettings.server_host;
        defaultSettings.ssl = settings.hasOwnProperty("ssl")
          ? settings.ssl
          : defaultSettings.ssl;
        defaultSettings.ssl_key = settings.ssl_key || defaultSettings.ssl_key;
        defaultSettings.ssl_cert =
          settings.ssl_cert || defaultSettings.ssl_cert;
        defaultSettings.ssl_ca_bundle =
          settings.ssl_ca_bundle || defaultSettings.ssl_ca_bundle;
        settings.hasOwnProperty("server_port")
          ? (defaultSettings.server_port = settings.server_port)
          : (defaultSettings.server_port = defaultSettings.ssl ? 443 : 80);
        defaultSettings.server_name =
          settings.server_name || defaultSettings.server_name;
        defaultSettings.server_operator =
          settings.server_operator || defaultSettings.server_operator;
        defaultSettings.server_motd =
          settings.server_motd || defaultSettings.server_motd;
        defaultSettings.ice_servers =
          settings.ice_servers || defaultSettings.ice_servers;
        defaultSettings.max_clients = settings.hasOwnProperty("max_clients")
          ? settings.max_clients
          : defaultSettings.max_clients;
        defaultSettings.ping_frequency = settings.hasOwnProperty(
          "ping_frequency"
        )
          ? settings.ping_frequency
          : defaultSettings.ping_frequency;
        defaultSettings.client_timeout = settings.hasOwnProperty(
          "client_timeout"
        )
          ? settings.client_timeout
          : defaultSettings.client_timeout;
        defaultSettings.inactive_timeout = settings.hasOwnProperty(
          "inactive_timeout"
        )
          ? settings.inactive_timeout
          : defaultSettings.inactive_timeout;
        defaultSettings.confirm_timeout = settings.hasOwnProperty(
          "confirm_timeout"
        )
          ? settings.confirm_timeout
          : defaultSettings.confirm_timeout;
        defaultSettings.host_max_unconfirmed = settings.hasOwnProperty(
          "host_max_unconfirmed"
        )
          ? settings.host_max_unconfirmed
          : defaultSettings.host_max_unconfirmed;
        defaultSettings.flood_limit = settings.hasOwnProperty("flood_limit")
          ? settings.flood_limit
          : defaultSettings.flood_limit;
        defaultSettings.flood_ban_period = settings.hasOwnProperty(
          "flood_ban_period"
        )
          ? settings.flood_ban_period
          : defaultSettings.flood_ban_period;
        defaultSettings.flood_ban_limit = settings.hasOwnProperty(
          "flood_ban_limit"
        )
          ? settings.flood_ban_limit
          : defaultSettings.flood_ban_limit;
        defaultSettings.flood_ban_duration = settings.hasOwnProperty(
          "flood_ban_duration"
        )
          ? settings.flood_ban_duration
          : defaultSettings.flood_ban_duration;
        defaultSettings.client_id_digits = settings.hasOwnProperty(
          "client_id_digits"
        )
          ? settings.client_id_digits
          : defaultSettings.client_id_digits;
        defaultSettings.Z = settings.hasOwnProperty("max_alias_length")
          ? settings.max_alias_length
          : defaultSettings.Z;
        defaultSettings.m = settings.hasOwnProperty("max_name_length")
          ? settings.max_name_length
          : defaultSettings.m;
        defaultSettings.$ = settings.hasOwnProperty("max_game_peers")
          ? settings.max_game_peers
          : defaultSettings.$;
        console.log("Loaded settings from config.js");
      } else
        console.log(
          "No content found in config.js. Reverting to server default settings."
            .yellow
        );
    } catch (b) {
      console.log(
        "Error loading config.js. Reverting to server default settings.".yellow
      );
    }
  else
    console.log(
      "Unable to locate config.js. Reverting to server default settings.".yellow
    );
  defaultSettings.ssl &&
    (fs.existsSync(defaultSettings.ssl_key)
      ? fs.existsSync(defaultSettings.ssl_cert)
        ? defaultSettings.ssl_ca_bundle &&
          !fs.existsSync(defaultSettings.ssl_ca_bundle) &&
          (console.log(
            (
              "Unable to find SSL bundle file '" +
              defaultSettings.ssl_ca_bundle +
              "'. Reverting to insecure server."
            ).yellow
          ),
          (defaultSettings.ssl = !1),
          443 === defaultSettings.server_port &&
            (defaultSettings.server_port = 80))
        : (console.log(
            (
              "Unable to find SSL certificate file '" +
              defaultSettings.ssl_cert +
              "'. Reverting to insecure server."
            ).yellow
          ),
          (defaultSettings.ssl = !1),
          443 === defaultSettings.server_port &&
            (defaultSettings.server_port = 80))
      : (console.log(
          (
            "Unable to find SSL key file '" +
            defaultSettings.ssl_key +
            "'. Reverting to insecure server."
          ).yellow
        ),
        (defaultSettings.ssl = !1),
        443 === defaultSettings.server_port &&
          (defaultSettings.server_port = 80)));
  settings = process.argv.splice(2);
  1 <= settings.length && (defaultSettings.server_host = settings[0]);
  2 <= settings.length &&
    (defaultSettings.server_port = parseInt(settings[1], 10));
  console.log("Server name: " + defaultSettings.server_name);
  console.log("Operated by: " + defaultSettings.server_operator);
  console.log(
    "Starting signalling server on " +
      (defaultSettings.ssl ? "wss://" : "ws://") +
      defaultSettings.server_host +
      ":" +
      defaultSettings.server_port +
      "..."
  );
  defaultSettings.ssl
    ? (console.log("Starting secure server".cyan),
      (settings = {
        key: fs.readFileSync(defaultSettings.ssl_key),
        cert: fs.readFileSync(defaultSettings.ssl_cert),
      }),
      defaultSettings.ssl_ca_bundle &&
        (settings.ca = fs.readFileSync(defaultSettings.ssl_ca_bundle)),
      (settings = httpsServer
        .createServer(settings, Y)
        .listen(defaultSettings.server_port, defaultSettings.server_host)),
      80 !== defaultSettings.server_port &&
        httpServer.createServer(Y).listen(80, defaultSettings.server_host))
    : (settings = httpServer
        .createServer(Y)
        .listen(defaultSettings.server_port, defaultSettings.server_host));
  new WebSocketServer({ server: settings, verifyClient: na }).on(
    "connection",
    on_connection
  );
  console.log("Server running");
  setInterval(oa, 1e3);
  setInterval(ra, defaultSettings.flood_ban_period);
})();

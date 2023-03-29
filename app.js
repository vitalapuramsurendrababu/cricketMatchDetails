const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeAndStartServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`dbError:${e.message}`);
    process.exit(1);
  }
};

initializeAndStartServer();

//allplayers

app.get("/players/", async (request, response) => {
  const playerdetails = `SELECT * FROM player_details;`;
  const dbResponse = await db.all(playerdetails);
  camelCase = [];
  for (let each of dbResponse) {
    camelCase.push({ playerId: each.player_id, playerName: each.player_name });
  }
  response.send(camelCase);
});

//specific player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const player = `SELECT * FROM player_details WHERE player_id=${playerId};`;
  const dbResponse = await db.get(player);
  response.send({
    playerId: dbResponse.player_id,
    playerName: dbResponse.player_name,
  });
});

//update  specific player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updateplayer = `UPDATE player_details SET player_name='${playerName}' WHERE player_id=${playerId};`;
  const dbResponse = await db.run(updateplayer);
  response.send("Player Details Updated");
});

//specific match details
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchdetails = `SELECT * FROM match_details WHERE match_id=${matchId};`;
  const dbResponse = await db.get(matchdetails);
  response.send({
    matchId: dbResponse.match_id,
    match: dbResponse.match,
    year: dbResponse.year,
  });
});

//specific player all matches

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const playerMatchDetails = `SELECT * FROM match_details INNER JOIN player_match_score ON match_details.match_id=player_match_score.match_id WHERE player_match_score.player_id=${playerId};`;
  const dbResponse = await db.all(playerMatchDetails);
  camelCase = [];
  for (let each of dbResponse) {
    camelCase.push({
      matchId: each.match_id,
      match: each.match,
      year: each.year,
    });
  }
  response.send(camelCase);
});

//specific match players
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const matchplayers = `SELECT * FROM player_details INNER JOIN player_match_score ON player_details.player_id=player_match_score.player_id WHERE player_match_score.match_id=${matchId};`;
  const dbResponse = await db.all(matchplayers);
  camelCase = [];
  for (let each of dbResponse) {
    camelCase.push({ playerId: each.player_id, playerName: each.player_name });
  }
  response.send(camelCase);
});

//player scores

const playerscores = app.get(
  "/players/:playerId/playerScores/",
  async (request, response) => {
    const { playerId } = request.params;
    const playerscores = `SELECT player_details.player_id AS playerId,player_details.player_name AS playerName,SUM(player_match_score.score)AS totalScore,SUM(player_match_score.fours)AS totalFours,SUM(player_match_score.sixes)AS totalSixes FROM player_details INNER JOIN player_match_score ON player_details.player_id=player_match_score.player_id WHERE player_details.player_id=${playerId};`;
    const dbResponse = await db.get(playerscores);
    response.send(dbResponse);
  }
);
module.exports = playerscores;

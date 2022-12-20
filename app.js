const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dpPath = path.join(__dirname, "moviesData.db");
let data = null;
const connectionDatabase = async () => {
  try {
    data = await open({
      filename: dpPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
connectionDatabase();
app.get("/movies/", async (request, response) => {
  const dataMovie = `SELECT
      movie_name
    FROM 
       movie;`;
  const responseData = await data.all(dataMovie);
  let objectMovie = [];
  for (let ObjectValue of responseData) {
    objectMovie.push({
      movieName: ObjectValue.movie_name,
    });
  }
  response.send(objectMovie);
});

app.post("/movies/", async (request, response) => {
  const bodyPost = request.body;
  const { directorId, movieName, leadActor } = bodyPost;
  const createPostTeam = `
    INSERT INTO
      movie(director_id,movie_name,lead_actor)
    VALUES
      (
        '${directorId}',
        '${movieName}',
        '${leadActor}'
       
      );`;
  const objectResponse = await data.run(createPostTeam);
  const movieId = objectResponse.lastID;
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const dataBase = `
    SELECT
      *
    FROM
     movie
    WHERE movie_id=${movieId};`;
  const responseValue = await data.get(dataBase);
  const responseObject = {
    movieId: responseValue.movie_id,
    directorId: responseValue.director_id,
    movieName: responseValue.movie_name,
    leadActor: responseValue.lead_actor,
  };
  response.send(responseObject);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const bodyPost = request.body;
  const { directorId, movieName, leadActor } = bodyPost;
  const dataBase = `UPDATE
       movie 
    SET 
    director_id='${directorId}',
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE movie_id= ${movieId};`;
  const responseData = await data.run(dataBase);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const dataBase = `DELETE FROM movie
   WHERE
    movie_id = ${movieId};
   `;
  const responseData = await data.run(dataBase);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const dataDirector = `SELECT
      *
    FROM 
       director;`;
  const responseData = await data.all(dataDirector);
  let objectDirector = [];
  for (let ObjectValue of responseData) {
    objectDirector.push({
      directorId: ObjectValue.director_id,
      directorName: ObjectValue.director_name,
    });
  }
  response.send(objectDirector);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorBase = `
    SELECT 
     movie_name
    FROM 
      movie
    WHERE 
    director_id= ${directorId};
      `;
  const responseValue = await data.all(directorBase);
  let objectMovie = [];
  for (let ObjectValue of responseValue) {
    objectMovie.push({
      movieName: ObjectValue.movie_name,
    });
  }
  response.send(objectMovie);
});
module.exports = app;

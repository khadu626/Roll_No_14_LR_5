const express = require('express');
const mySql = require('mysql2');
const cors = require('cors');
const app = express();
app.use(cors());
const path = require("path");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
const db = mySql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "movie_info"
});
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/movie", (req, res) => {
 const query   = "select movie_id, movie_name, genre, year, imdb_rating, director.director_name from movie join director on movie.director_id = director.director_id order by director.director_name;";
 db.query(query, (err, result) => {
    if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error retrieving data from the database.');
        return;
    }
    res.json(result);
 });
});
app.post("/addmovie", (req, res) => {
    const { movie_name, genre, year, imdb_rating, director_id } = req.body;
    
    // প্রথমে ডাটাবেজ থেকে সর্বোচ্চ Movie_ID কত আছে তা বের করা হচ্ছে
    const getMaxIdQuery = "SELECT MAX(Movie_ID) AS maxId FROM movie";
    
    db.query(getMaxIdQuery, (err, result) => {
        if (err) {
            console.error('Error fetching max ID:', err);
            return res.status(500).send('Error adding movie to the database.');
        }
        
       
        const newId = (result[0].maxId || 0) + 1;
        
        const insertQuery = "INSERT INTO movie (Movie_ID, Movie_Name, Genre, Year, IMDB_Rating, Director_ID) VALUES (?, ?, ?, ?, ?, ?)";
        
        db.query(insertQuery, [newId, movie_name, genre, year, imdb_rating, director_id], (err, insertResult) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).send('Error adding movie to the database.');
            }
            res.status(201).send('Movie added successfully.');
        });
    });
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
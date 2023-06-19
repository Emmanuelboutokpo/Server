const fs = require('fs');
const connection = require('../config/dbConn');
const processEnv=process.env
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your account credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.getAllMusic = async (req, res) => {
    const catName = req.query.category;
    const limit = parseInt(req.query.limit) || 4;
    const page = parseInt(req.query.page) || 0; 
    
    if (catName) {
      const cmpte = `SELECT COUNT(*) AS length FROM  song JOIN gender ON gender.idgender = song.gender_idgender WHERE gender.category = '${catName}'`;
      connection.query(cmpte, (err, data) => {
   if (err) return res.status(500).send(err);
        const totalRows = data[0].length
        const totalPage = Math.ceil(totalRows/limit);
        const startingLimit = (page)*limit;   
        const q = `SELECT song.idsong, song.title, song.songImg, song.officialDate, song.songItem, song.description, gender.category FROM song JOIN gender ON gender.idgender = song.gender_idgender WHERE gender.category = '${catName}'  LIMIT ${startingLimit}, ${limit}`;
        connection.query(q, (err, data) => {
         if (err) return res.status(500).send(err);
         return res.status(200).json({
          result : data,
          page: page,
          limit: limit, 
          totalRows: totalRows,
          totalPage: totalPage  
         }) ; 
  
       }); 
  
      })
  
    }else{
    const cmpte = "SELECT COUNT(*) AS length FROM song";
   connection.query(cmpte, (err, data) => {
         if (err) return res.status(500).send(err); 
       const totalRows = data[0].length
          
         const totalPage = Math.ceil(totalRows/limit);
         const startingLimit = (page)*limit;
        const q = `SELECT song.idsong, song.title, song.songImg, song.officialDate, song.songItem, song.description, gender.category FROM song JOIN gender ON gender.idgender = song.gender_idgender LIMIT ${startingLimit}, ${limit}`;
         
        connection.query(q, (err, data) => {
            if (err) return res.status(500).send(err);
             return res.status(200).json({
              result : data,
              page: page,
              limit: limit, 
              totalRows: totalRows,
              totalPage: totalPage  
          }) ; 
         });   
         });
  
      } 
  }
 
  exports.getMusic = async (req, res) => {
    const { id } = req.params
    const q = "SELECT  song.idsong,song.title,song.songImg,song.officialDate,song.songItem,song.description, users.firstName, users.lastName,users.birthday, users.primaryActivity,users.secondActivity, users.musicGender,users.label, users.history,users.laureat, users.photo, gender.category, gender.idgender FROM song JOIN gender  ON gender.idgender = song.gender_idgender JOIN users ON users.user_iduser = users.iduser WHERE idsong = ?";
  connection.query(q, [id],(err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length ==0) return res.status(404).json('Post not found!')
    return res.status(200).json({result: data[0]});
  });
}


// Handle music upload
exports.uploadMusic = async (req, res) => {

    const { title, officialDate, description, gender_idgender, user_iduser } = req.body;
    
    const files = req.files;

    // Check if any of the required fields are empty
    if (!files || !files['songItem'] || !files['songImg'] || !title || !officialDate || !description) {
        return res.status(400).json({ error: 'Missing required fields or files' });
    }

    const file = files['songItem'][0];
    const coverImage = files['songImg'][0];

    const filets = files['songItem'][0].filename;
    const coverImages = files['songImg'][0].filename;

    let musicFileResult;
    let coverImageResult;

     // Upload cover image to Cloudinary
    coverImageResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(coverImage.path, {
            timeout: 60000,
            folder: 'Cover images',
        }, (error, result) => {
            if (error) {
                // Handle the error and reject the promise
                reject(new Error('Failed to upload cover image'));
            } else {
                // The upload was successful, resolve the promise with the result
                resolve(result);
            }
        });
    });

    // Upload music file to Cloudinary
    musicFileResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file.path, {
            timeout: 60000,
            folder: 'Musics',
            resource_type: 'video',
        }, (error, result) => {
            if (error) {
                // Handle the error and reject the promise
                reject(new Error('Failed to upload music file'));
            } else {
                // The upload was successful, resolve the promise with the result
                resolve(result);
            }
        });
    }) ;

    const q = "INSERT INTO song(`title`, `songImg`, `officialDate`, `songItem`,`description`,`gender_idgender`, `user_iduser`) VALUES (?)";
    const values = [title, coverImages, officialDate, filets, description, gender_idgender, user_iduser];
    connection.query(q, [values], (err, data) => {
        if (err) return res.status(500).json({ error: err });
        if(data)  return res.status(201).json({ message: 'Music uploaded successfully' });
    });
};

exports.updateMusic = async (req, res) => {
    const { id } = req.params
    const { title, officialDate, description, gender_idgender, user_iduser } = req.body;
    const files = req.files;

    // Check if any of the required fields are empty
    if (!files || !files['songItem'] || !files['songImg'] || !title || !officialDate || !description) {
        return res.status(400).json({ error: 'Missing required fields or files' });
    }

    let musicFileResult;
    let coverImageResult;
 
    if (files) {
        const file = req.files['songItem'] ? req.files['songItem'][0] : null;
        const coverImage = req.files['songImg'] ? req.files['songImg'][0] : null;

        if (coverImage) {
            // Upload cover image to Cloudinary
              coverImageResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(coverImage.path, {
                    timeout: 60000,
                    folder: 'Cover images',
                }, (error, result) => {
                    if (error) {
                        // Handle the error and reject the promise
                        reject(new Error('Failed to upload cover image'));
                    } else {
                        // The upload was successful, resolve the promise with the result
                        resolve(result);
                    }
                });
            });

            await cloudinary.uploader.destroy(coverImage.path);
        }
        if (file) {
            // Upload music file to Cloudinary
            musicFileResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(file.path, {
                    timeout: 60000,
                    folder: 'Musics',
                    resource_type: 'video',
                }, (error, result) => {
                    if (error) {
                        // Handle the error and reject the promise
                        reject(new Error('Failed to upload music file'));
                    } else {
                        // The upload was successful, resolve the promise with the result
                        resolve(result);
                    }
                });
            });

            await cloudinary.uploader.destroy(file.path);

        }


        const q = "UPDATE song SET `title`=?, `songImg`=?, `officialDate`=?,`songItem`=?,`description`=?,`gender_idgender`=?, `user_iduser`=? WHERE `idsong` = ? ";


        const values = [title, coverImage.filename, officialDate, file.filename, description, gender_idgender, user_iduser];

        connection.query(q, [...values, id], (err, data) => {
            if (err) return res.status(500).json(err);
            if (data.length == 0) return res.status(404).json('Song not found!')
            return res.json("Song has been updated.");
        });

    }
}
 
// Delete a music track by ID
exports.deleteMusic = async (req, res) => {
    const { id } = req.params

    const q = "DELETE FROM song WHERE `idsong` = ?";

    connection.query(q, [id], (err, data) => {
      if (err) return res.status(403).json("You can delete only your song!");
      if (data.length===0) return res.status(404).json('Song not found!')
      return res.json("Song has been deleted!");
    });
};



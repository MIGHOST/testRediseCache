const express = require("express");
const axios = require("axios");
const redis = require("redis");

const app = express();
const port = 3000;
const baseUrl = `https://jsonplaceholder.typicode.com/posts`;
const client = redis.createClient(6379);
client.on("error", (error) => {
  console.error(error);
});


app.get("/:id", (req, res) => {
  try {
    const id = req.params.id;
    client.get(id, async (err, post) => {
      if (post) {
        return res.status(200).send({   
          message: `Post for ${id} from the cache`,
          data: JSON.parse(post),
        });
      } else {       
        const post = await axios.get(`${baseUrl}/${id}`);
        client.setex(id, 60, JSON.stringify(post.data));
        return res.status(200).send({
          data: post.data.results,
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// app.get("/posts", (req, res) => {
//   console.log(baseUrl);
//   console.log(req.params);
//   try {
//     let allPosts = req.params;
//     console.log(allPosts);
//     client.get(allPosts, async (err, posts) => {
//       if (posts) {
//         return res.status(200).send({   
//           message: `Posts from the cache`,
//           data: JSON.parse(posts),
//         });
//       } else {       
//         posts = await axios.get(`${baseUrl}/${posts}`);
//         client.setex(allPosts, 60, JSON.stringify(posts.data));
//         return res.status(200).send({
//           data: posts.data.results,
//         });
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;

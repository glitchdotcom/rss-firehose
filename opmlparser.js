// Adapted from https://github.com/danmactough/node-opmlparser/blob/master/examples/simple.js

const OpmlParser = require("opmlparser");
const request = require("request");

exports.getFeedsFromOPML = () =>
  new Promise((resolve, reject) => {
    const opmlparser = new OpmlParser()
    let counter = 0;
    let feedUrls = [];

    var opmlRequest = request(`https://${process.env.PROJECT_DOMAIN}.glitch.me/subscriptions.opml`);
    
    opmlRequest.on("error", function(error) {
      // Reject the Promise by returning an error, with the origin
      // of the error set to the request.
      reject({ error: error });
    });
  
    opmlRequest.on("response", function (response) {
      // If we didn't get a 200 OK, emit an error.
      if (response.statusCode != 200) reject(new Error("Bad status code"));
      // Otherwise, pipe the request into feedparser.
      this.pipe(opmlparser);
    })

    opmlparser.on("error", function(error) {
      // Reject the Promise by returning an error, with the origin
      // of the error set to the request.
      reject({ error: error });
    });
  
    opmlparser.on("readable", function () {
      let outline;

      while (outline = this.read()) {
        if (outline['#type'] === "feed") {
          counter++;
          feedUrls.push(outline.xmlurl);
        }
      }
    });
    opmlparser.on("end", function () {
      resolve(feedUrls);
    });
  });
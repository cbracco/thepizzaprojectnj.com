const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function() {
    try {
        let url = "https://www.eventbriteapi.com/v3/organizations/1905653968833/events/?token=ZQJEXIDK2TX35TK3D5ZM";

        let json = EleventyFetch(url, {
            duration: "1d",
            type: "json",
            verbose: true,
        });

        return json;
    } catch(error) {
        return error;
    }
};

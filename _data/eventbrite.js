const EleventyFetch = require("@11ty/eleventy-fetch");

// @TODO cache this on the server: https://www.11ty.dev/docs/quicktips/cache-api-requests/
module.exports = async function() {
    try {
        // @TODO encrypt API key
        let url = "https://www.eventbriteapi.com/v3/organizations/1905653968833/events/?token=ZQJEXIDK2TX35TK3D5ZM&expand=ticket_classes";

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

const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function() {
    try {
        let url = `https://www.eventbriteapi.com/v3/organizations/1905653968833/events/?token=${process.env.EVENTBRITE_API_KEY}&expand=ticket_classes`;

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

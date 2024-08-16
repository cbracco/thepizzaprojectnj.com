const miscEvents = require('./miscEvents');
const EleventyFetch = require('@11ty/eleventy-fetch');

// Eventbrite events
async function getEventbriteData(url) {
    try {
        let apiURL = url;

        let json = await EleventyFetch(apiURL, {
            duration: '1d',
            type: 'json',
            verbose: true,
        });

        return json;
    } catch (error) {
        return error;
    }
}

// Merged events
module.exports = async function () {
    try {
        const eventbriteData = await getEventbriteData(
            `https://www.eventbriteapi.com/v3/organizations/1905653968833/events/?token=${process.env.EVENTBRITE_API_KEY}&expand=ticket_classes`,
        );

        // Merge the data sets together, and sort by ISO date
        const events = [...eventbriteData.events, ...miscEvents].sort((a, b) =>
            a.start.local < b.start.local ? -1 : a.start.local > b.start.local ? 1 : 0,
        );

        return events;
    } catch (error) {
        return error;
    }
};

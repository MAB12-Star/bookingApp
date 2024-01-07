const express = require('express');
const app = express();
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');
const bodyParser = require('body-parser');
const userCalendarId = 'primary'; // Set your calendar ID here
const oAuth2Client = new OAuth2Client(
  '233177828725-feeieui0oojuelvcilsa9p9o5beradrf.apps.googleusercontent.com',
  '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'
);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('Public'));


oAuth2Client.setCredentials({
  refresh_token: '1//04gZJtehGKgE4CgYIARAAGAQSNwF-L9IrKzm6UIRC6sILoP63N4D_-oFdbAJbk8uEnLhpNV3o11XpRXpxACJIKklwqtlpDtQGKgE',
});




app.get('/', (req, res) => {
  res.render('home');
});
app.get('/getAvailableTimes', async (req, res) => {
  try {
    const date = req.query.date;

    // Check if the access token is expired
    const isAccessTokenExpired = oAuth2Client.isTokenExpiring();
    if (isAccessTokenExpired) {
      const newAccessToken = await refreshAccessToken();
      oAuth2Client.setCredentials({ access_token: newAccessToken });
    }

    const availableTimes = await getAvailableTimes(date);
    res.json(availableTimes);
  } catch (error) {
    console.error('Error fetching available times:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to refresh the access token
async function refreshAccessToken() {
  try {
    const { token } = await oAuth2Client.getAccessToken();
    return token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

async function getAvailableTimes(date) {
  try {
    // Refresh the access token before making the API request
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    // Set timezone explicitly to 'America/Mexico_City' (Central Time Zone)
    const timezone = 'America/Mexico_City';

  const timeMin = new Date(`${date}T05:00:00-06:00`); // Adjusted for UTC+6
  const timeMax = new Date(`${date}T20:59:59-06:00`); // Adjusted for UTC+6


    const response = await calendar.freebusy.query({
      resource: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: timezone,
        items: [{ id: userCalendarId }],
      },
    });

    const busyTimes = response.data.calendars[userCalendarId].busy;

    const allTimes = [];
    let currentTime = new Date(timeMin);

    while (currentTime <= timeMax) {
      // Exclude Sundays, Mondays, and the time range of 11 am to 8 pm
      if (
        currentTime.getDay() !== 0 && // Exclude Sundays
        currentTime.getDay() !== 1 && // Exclude Mondays
        currentTime.getHours() >= 11 && // Include hours from 11 am onwards
        currentTime.getHours() < 20 // Exclude hours after 8 pm
      ) {
        const endTime = new Date(currentTime.getTime() + 60 * 60 * 1000);

        // Check for existing appointments
        const isAvailable = !busyTimes.some(busyTime => (
          new Date(busyTime.start).toLocaleString("en-US", { timeZone: timezone }) < endTime.toISOString() &&
          new Date(busyTime.end).toLocaleString("en-US", { timeZone: timezone }) > currentTime.toISOString()
        ));

        if (isAvailable) {
          const formattedStartTime = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')}T${currentTime
            .getHours()
            .toString()
            .padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime
            .getSeconds()
            .toString()
            .padStart(2, '0')}`;
          const formattedEndTime = `${endTime.getFullYear()}-${(endTime.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${endTime.getDate().toString().padStart(2, '0')}T${endTime
            .getHours()
            .toString()
            .padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}:${endTime
            .getSeconds()
            .toString()
            .padStart(2, '0')}`;

          const timeSlot = { start: formattedStartTime, end: formattedEndTime };
          allTimes.push(timeSlot);
        }
      }

      currentTime.setHours(currentTime.getHours() + 1);
    }

    return allTimes;
  } catch (error) {
    console.error('Error fetching available times:', error);
    throw error;
  }
}

app.post('/register', async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const date = req.body.date;
    const startTime = req.body.time;
    const { DateTime } = require('luxon');
    // Combine name and phone for the 'summary' field
    const summary = `${name} - ${phone}`;

    // Combine date and startTime for 'start' dateTime
    // Combine date and startTime for 'start' dateTime
    const rawStartDateTime = `${startTime.replace(/\.\d+Z/, '')}-00:00`;
    console.log('Raw Start DateTime:', rawStartDateTime);

    // Parse rawStartDateTime to create a valid Date object
    const startDateTime = new Date(rawStartDateTime);
    if (isNaN(startDateTime.getTime())) {
      console.error('Error parsing startDateTime. Invalid date format.');
      // Handle the error or return a response to the client
    }

    // Calculate endDateTime by adding 1 hour to startDateTime
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    console.log('Formatted End Time:', endDateTime.toISOString());

    // Make sure both start and end times are formatted as dateTime
    const event = {
      'summary': summary,
      'location': 'Mexico City',
      'description': email,
      'start': {
        'dateTime': startDateTime.toISOString(),
        'timeZone': 'America/Mexico_City',
      },
      'end': {
        'dateTime': endDateTime.toISOString(),
        'timeZone': 'America/Mexico_City',
      },
      'reminders': {
        'useDefault': false,
        'overrides': [
          { 'method': 'email', 'minutes': 24 * 60 },
          { 'method': 'popup', 'minutes': 10 },
        ],
      },
    };

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    // Create the calendar object
    calendar.events.insert({
      auth: oAuth2Client,
      calendarId: 'primary',
      resource: event,
    }, function (err, event) {
      if (err) {
        console.error('There was an error contacting the Calendar service:', err);

        // Check if err has response property before logging
        if (err.response && err.response.request) {
          console.error('Request:', err.response.request);  // Log the request
          console.error('Response:', err.response.data);    // Log the response
        }

        res.status(500).json({ error: 'Error contacting Calendar service' });
        return;
      }

      console.log('Event created: %s', event.htmlLink);

      // Redirect to the confirmation page after successful booking
      res.redirect(`/confirmation?name=${name}&startTime=${startDateTime.toLocaleTimeString('en-US', { timeStyle: 'short' })}`);
    });
  } catch (error) {
    console.error('Error processing request:', error);

    if (error.response && error.response.request) {
      // If it's a GaxiosError with response property
      console.error('Request:', error.response.request);  // Log the request
      console.error('Response:', error.response.data);    // Log the response
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/confirmation', (req, res) => {
  const name = req.query.name;
  const startTime = req.query.startTime;
  res.render('confirmation', { name, startTime });
});

// Usage example: call refreshAccessToken() whenever you need to ensure a valid access token
// const accessToken = await refreshAccessToken();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error middleware:', err);
  res.status(err.statusCode).render('error', { err });
});

app.use((err, req, res, next) => {
  if (err.statusCode !== 404) {
    err.statusCode = 500;
    err.message = 'Oh No, Something Went Wrong!';
  }
  console.error('Error middleware:', err);
  res.status(err.statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('App is listening on port 3000');
});

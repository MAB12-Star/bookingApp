
const express = require('express');
const app = express();
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs').promises;
const path = require('path');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const userCalendarId = 'primary'; // Set your calendar ID here
const bodyParser = require('body-parser');
const oAuth2Client = new OAuth2Client(
  '233177828725-cb8btoaoth90q1va17kb8a6i26lpqkik.apps.googleusercontent.com',
  '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'
);
oAuth2Client.setCredentials({
  refresh_token: '1//041cgSPkATvbICgYIARAAGAQSNwF-L9IrjqPkFJzMJJYOIeq0uxOEU1yD50KrrErNLbIYfdwJKJgfawz_0R7-txLfl9lpQJn4Xfc',
});




app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Assuming your views are in a 'views' directory
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/getAvailableTimes', async (req, res) => {
  try {
    const date = req.query.date;
    const availableTimes = await getAvailableTimes(date);
    res.json(availableTimes);
  } catch (error) {
    console.error('Error fetching available times:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Your route for handling form submissions
// app.post('/register', async (req, res) => {
//   try {
//     const date = req.body.date;

//     // Fetch available times
//     const availableTimes = await getAvailableTimes(date);

//     // Render a page or send a JSON response with available times
//     res.render('availableTimes', { availableTimes });
//   } catch (error) {
//     console.error('Error processing request:', error);
//     res.status(500).send('Error processing request');
//   }
// });
// Your route for handling form submissions


// Function to get available times for a given date
async function getAvailableTimes(date) {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    // Set timezone explicitly to 'America/Mexico_City' (Central Time Zone)
    const timezone = 'America/Mexico_City';

    const timeMin = new Date(`${date}T00:00:00-06:00`); // Assuming -06:00 is the UTC offset for Mexico City
    const timeMax = new Date(`${date}T23:59:59-06:00`);

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
          new Date(busyTime.start) < endTime && new Date(busyTime.end) > currentTime
        ));

        if (isAvailable) {
          const timeSlot = { start: currentTime.toISOString(), end: endTime.toISOString() };
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error middleware:', err); // Log the error for debugging
  res.status(err.statusCode).render('error', { err });
});

app.use((err, req, res, next) => {
  if (err.statusCode !== 404) {
    err.statusCode = 500;
    err.message = 'Oh No, Something Went Wrong!';
  }
  console.error('Error middleware:', err); // Log the error for debugging
  res.status(err.statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('App is listening on port 3000');
});



https://bookingapp-n29n.onrender.com

README.md for Calendar Booking App

Overview
This repository contains the source code for a Calendar Booking Application built with Express.js and the Google Calendar API. The application allows users to view available time slots, register for appointments, and receive confirmations. It simplifies the process of booking appointments and integrates seamlessly with Google Calendar.

Features
Google Calendar Integration: Utilizes the Google Calendar API to retrieve available times and schedule appointments.
Real-time Availability: Displays real-time available time slots for booking based on Google Calendar data.
User Registration: Allows users to register for appointments by providing their name, email, phone, date, and preferred time.
Confirmation Page: After successful booking, redirects users to a confirmation page displaying their details and appointment time.
How to Use
Clone the repository: git clone https://github.com/your-username/calendar-booking-app.git
Install dependencies: npm install
Set up Google API credentials: Follow the instructions in the Google Calendar API documentation to obtain credentials.json and save it in the project directory.
Set up environment variables: Create a .env file with your OAuth2 client ID, client secret, refresh token, and port information.
Start the application: node app.js
Open your web browser and navigate to http://localhost:3000 to explore the Calendar Booking Application.
Dependencies
Express: The application is built using the Express framework for handling HTTP requests and routing.
Google APIs: Utilizes the Google API Node.js client library to interact with the Google Calendar API.
Body Parser: Parses incoming request bodies in a middleware, making it easier to handle form submissions.
Google Calendar API Setup
Obtain API Credentials: Follow the instructions in the Google Calendar API documentation to create OAuth2 credentials.
Save Credentials: Save the obtained credentials.json file in the project directory.
Contributing
Contributions to the project are welcome! Feel free to create issues, suggest improvements, or submit pull requests. Your feedback and contributions are highly valued.

Credits
Google Calendar API: The project leverages the Google Calendar API for managing calendar events and availability.
License
This project is licensed under the MIT License.

Simplify your appointment booking process with the Calendar Booking Application! 📅✨

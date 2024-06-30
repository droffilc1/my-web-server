// *TODO:1 Set up a basic web server in your preferred stack
// GET <example.com>/api/hello?visitor_name="Mark"
//
// RESPONSE
//   {
//      "client_ip": "127.0.0.1", // The IP address of the requester
//      "location": "New York" // The city of the requester
//      "greeting": "Hello, Mark!, the temperature is 11 degrees Celcius in New York"
//  }

/**************************************************************************** */


const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Visitor';

  try {
    // Fetch the client's IP address
    const ipResponse = await axios.get('https://icanhazip.com');
    const clientIp = ipResponse.data.trim();

    console.log(`Received request from IP: ${clientIp} with visitor name: ${visitorName}`);

    // Fetch location data
    const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
    if (locationResponse.data.status !== 'success') {
      console.error('Failed to get location data:', locationResponse.data);
      return res.status(500).send('Error retrieving location data');
    }

    const location = locationResponse.data.city || 'Unknown Location';
    const { lat, lon } = locationResponse.data;

    // Fetch weather data
    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    if (!weatherResponse.data || !weatherResponse.data.current_weather) {
      console.error('Failed to get weather data:', weatherResponse.data);
      return res.status(500).send('Error retrieving weather data');
    }

    const temperature = weatherResponse.data.current_weather.temperature;

    // Send response
    res.json({
      client_ip: clientIp,
      location: location,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`
    });
  } catch (error) {
    console.error('Error processing request:', error.message);
    res.status(500).send('Error processing request');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

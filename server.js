const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

const WEATHERAPI_KEY = 'bcc436f472c54a5397f120300231307';

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Visitor';

  // Get the real client IP address
  let clientIp = req.headers['x-forwarded-for'] ?
    req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;

  // Fallback to using icanhazip.com if needed (typically this should not be required)
  if (!clientIp || clientIp === '::1' || clientIp.startsWith('127.0.0.1')) {
    try {
      const ipResponse = await axios.get('https://icanhazip.com');
      clientIp = ipResponse.data.trim();
    } catch (error) {
      console.error('Failed to get client IP address:', error.message);
      return res.status(500).send('Error retrieving client IP address');
    }
  }

  console.log(`Received request from IP: ${clientIp} with visitor name: ${visitorName}`);

  try {
    // Fetch location data
    const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
    if (locationResponse.data.status !== 'success') {
      console.error('Failed to get location data:', locationResponse.data);
      return res.status(500).send('Error retrieving location data');
    }

    const location = locationResponse.data.city || 'Unknown Location';
    const { lat, lon } = locationResponse.data;

    // Fetch weather data
    const weatherResponse = await axios
      .get(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${lat},${lon}&days=1&aqi=no&alerts=no`);
    if (!weatherResponse.data || weatherResponse.data.error) {
      console.error('Failed to get weather data:', weatherResponse.data);
      return res.status(500).send('Error retrieving weather data');
    }

    const temperature = weatherResponse.data.current.temp_c;


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

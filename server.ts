import express from 'express';
import { Request, 
         Response, 
         NextFunction 
       } from 'express';
import axios from 'axios';

const app = express();
const port = 3000;
const weatherAPIKey = process.env.OPENWEATHERMAP_API_KEY;


declare global {
  namespace Express {
    interface Request {
      clientIp?: string;
    }
  }
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const forwardedIps = (req.headers['x-forwarded-for'] as string).split(',');
  req.clientIp = forwardedIps[0].trim(); 
  next();
});


// Function to get location by IP
async function getLocationByIP(ip: string): Promise<{city: string, lat: number, lon: number}> {
  try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      if (response.data.error) {
          console.error("ipapi error:", response.data.error);
          return {city: "Unknown", lat: 0, lon: 0};
      }
      return {city: response.data.city, lat: response.data.latitude, lon: response.data.longitude};
  } catch (error) {
      console.error("Error fetching location:", error);
      return {city: "Unknown", lat: 0, lon: 0};
  }
}

app.get('/api/hello', async (req: Request, res: Response) => {
  console.log(req.query);
  const visitorName = req.query.visitor_name as string || 'Guest';
  const clientIp = req.clientIp || "unknown"; 

  let lat = 0; // Default latitude
  let long = 0; // Default longitude
  let location = "Unknown"; // Default location
  try {
      const locationData = await getLocationByIP(clientIp);
      location = locationData.city;
      lat = locationData.lat;
      long = locationData.lon;
  } catch (error) {
      console.error("Failed to get location:", error);
  }

  let temperature = "Unknown";
  try {
      const weatherResponse = await axios.get(`http://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&appid=${weatherAPIKey}&units=metric`);
      temperature = weatherResponse.data.current.temp;
      } catch (weatherError) {
    console.error("Failed to get weather:", weatherError);
  }
  const greeting = `Hello, ${visitorName}. The temperature is ${temperature} degrees Celsius in ${location}.`;

  res.json({
    client_Ip: clientIp,
    location: location,
    greeting: greeting
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

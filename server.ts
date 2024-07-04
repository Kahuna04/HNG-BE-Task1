import express from 'express';
import { Request, 
         Response, 
         NextFunction 
       } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config()


const app = express();
const port = 3000;
const weatherAPIKey = process.env.WEATHERAPI_KEY;


declare global {
  namespace Express {
    interface Request {
      clientIp?: string;
    }
  }
}

app.use((req: Request, res: Response, next: NextFunction) => {
  let forwardedIps;
  if (req.headers['x-forwarded-for']) {
    forwardedIps = (req.headers['x-forwarded-for'] as string).split(',');
  } else {
    // Fallback to a default IP or handle the case where x-forwarded-for is not available
    forwardedIps = ['unknown'];
  }
  req.clientIp = forwardedIps[0].trim(); 
  next();
});


// Function to get location by IP
async function getLocationByIP(ip: string): Promise<{city: string}> {
  try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      if (response.data.error) {
          console.error("ipapi error:", response.data.error);
          return {city: "Unknown"};
      }
      return {city: response.data.city};
  } catch (error) {
      console.error("Error fetching location:", error);
      return {city: "Unknown"};
  }
}

app.get('/api/hello', async (req: Request, res: Response) => {
  console.log(req.query);
  const visitorName = req.query.visitor_name as string || 'Guest';
  const clientIp = req.clientIp || "unknown"; 

  let location = "Unknown"; // Default location
  try {
      const locationData = await getLocationByIP(clientIp);
      location = locationData.city;
  } catch (error) {
      console.error("Failed to get location:", error);
  }

  let temperature = 'Unknown';
  try {
    const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json`, {
      params: {
        key: weatherAPIKey,
        q: location,
      },
    });
    temperature = weatherResponse.data.current.temp_c;
  } catch (weatherError) {
    console.error('Failed to get weather:', weatherError);
  }
  const greeting = `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}.`;

  res.json({
    client_Ip: clientIp,
    location: location,
    greeting: greeting
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

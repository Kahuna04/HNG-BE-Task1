import express from 'express';
import { Request, 
         Response, 
         NextFunction 
       } from 'express';
import axios from 'axios';

const app = express();
const port = 3000;
const GEOAPIFY_API_KEY = "a34cac8d5fa846fc9e5636ee4d83afb1";

declare global {
  namespace Express {
    interface Request {
      clientIp?: string;
    }
  }
}

app.use((req: Request, res: Response, next: NextFunction) => {
  req.clientIp = (req.headers['x-forwarded-for'] as string) || req.ip;
  next();
});

// Function to get location by IP
async function getLocationByIP(ip: string): Promise<string> {
  try {
      const response = await axios.get(`https://api.geoapify.com/v1/geocode/ipInfo?apiKey=${GEOAPIFY_API_KEY}&ip=${ip}`);
      return response.data.city; 
  } catch (error) {
      console.error("Error fetching location:", error);
      return "Unknown";
  }
}

app.get('/api/hello', async (req: Request, res: Response) => {
  const visitorName = req.query.visitor_name as string || 'Guest';
  const clientIp = req.clientIp || 'unknown';
  let location = "Lagos"; // Default location
  try {
      location = await getLocationByIP(clientIp);
  } catch (error) {
      console.error("Failed to get location:", error);
  }
  const temperature = 23; // Fixed temperature value
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
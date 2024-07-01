import express from 'express';
import { Request, 
         Response, 
         NextFunction 
       } from 'express';
import axios from 'axios';

const app = express();
const port = 3000;

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
async function getLocationByIP(ip: string): Promise<string> {
  try {
      const response = await axios.get(`http://ipapi.co/${ip}/city/`);
      console.log(response.data);
      if (response.data.error) {
          console.error("ipapi error:", response.data.error);
          return "Unknown";
      }
      // Assuming the city is directly under response.data.city, adjust based on actual response structure
      return response.data.city || "Unknown";
  } catch (error) {
      console.error("Error fetching location:", error);
      return "Unknown";
  }
}

app.get('/api/hello', async (req: Request, res: Response) => {
  console.log(req.query);
  const visitorName = req.query.visitor_name as string || 'Guest';
  const clientIp = req.clientIp || "unknown"; 
  let location = "Unknown"; // Default location
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

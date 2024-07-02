"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const port = 3000;
const weatherAPIKey = process.env.OPENWEATHERMAP_API_KEY;
app.use((req, res, next) => {
    const forwardedIps = req.headers['x-forwarded-for'].split(',');
    req.clientIp = forwardedIps[0].trim();
    next();
});
// Function to get location by IP
function getLocationByIP(ip) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://ipapi.co/${ip}/json/`);
            if (response.data.error) {
                console.error("ipapi error:", response.data.error);
                return { city: "Unknown", lat: 0, lon: 0 };
            }
            return { city: response.data.city, lat: response.data.latitude, lon: response.data.longitude };
        }
        catch (error) {
            console.error("Error fetching location:", error);
            return { city: "Unknown", lat: 0, lon: 0 };
        }
    });
}
app.get('/api/hello', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.query);
    const visitorName = req.query.visitor_name || 'Guest';
    const clientIp = req.clientIp || "unknown";
    let lat = 0; // Default latitude
    let long = 0; // Default longitude
    let location = "Unknown"; // Default location
    try {
        const locationData = yield getLocationByIP(clientIp);
        location = locationData.city;
        lat = locationData.lat;
        long = locationData.lon;
    }
    catch (error) {
        console.error("Failed to get location:", error);
    }
    let temperature = "Unknown";
    try {
        const weatherResponse = yield axios_1.default.get(`http://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&appid=${weatherAPIKey}&units=metric`);
        temperature = weatherResponse.data.current.temp;
    }
    catch (weatherError) {
        console.error("Failed to get weather:", weatherError);
    }
    const greeting = `Hello, ${visitorName}. The temperature is ${temperature} degrees Celsius in ${location}.`;
    res.json({
        client_Ip: clientIp,
        location: location,
        greeting: greeting
    });
}));
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

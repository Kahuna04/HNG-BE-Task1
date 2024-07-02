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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
const weatherAPIKey = process.env.WEATHERAPI_KEY;
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
                return { city: "Unknown" };
            }
            return { city: response.data.city };
        }
        catch (error) {
            console.error("Error fetching location:", error);
            return { city: "Unknown" };
        }
    });
}
app.get('/api/hello', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.query);
    const visitorName = req.query.visitor_name || 'Guest';
    const clientIp = req.clientIp || "unknown";
    let location = "Unknown"; // Default location
    try {
        const locationData = yield getLocationByIP(clientIp);
        location = locationData.city;
    }
    catch (error) {
        console.error("Failed to get location:", error);
    }
    let temperature = 'Unknown';
    try {
        const weatherResponse = yield axios_1.default.get(`http://api.weatherapi.com/v1/current.json`, {
            params: {
                key: weatherAPIKey,
                q: location,
            },
        });
        temperature = weatherResponse.data.current.temp_c;
    }
    catch (weatherError) {
        console.error('Failed to get weather:', weatherError);
    }
    const greeting = `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}.`;
    res.json({
        client_Ip: clientIp,
        location: location,
        greeting: greeting
    });
}));
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

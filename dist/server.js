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
const GEOAPIFY_API_KEY = "a34cac8d5fa846fc9e5636ee4d83afb1";
app.use((req, res, next) => {
    const forwardedIps = req.headers['x-forwarded-for'].split(',');
    req.clientIp = forwardedIps[0].trim();
    next();
});
// Function to get location by IP
function getLocationByIP(ip) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://api.geoapify.com/v1/geocode/ipInfo?apiKey=${GEOAPIFY_API_KEY}&ip=${ip}`);
            return response.data.city;
        }
        catch (error) {
            console.error("Error fetching location:", error);
            return "Unknown";
        }
    });
}
app.get('/api/hello', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.query);
    const visitorName = req.query.visitor_name || 'Guest';
    const clientIp = req.clientIp || 'unknown';
    let location = "Lagos"; // Default location
    try {
        location = yield getLocationByIP(clientIp);
    }
    catch (error) {
        console.error("Failed to get location:", error);
    }
    const temperature = 23; // Fixed temperature value
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

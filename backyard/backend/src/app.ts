import cors from "cors";
import express from "express";
import morgan from "morgan";

import competitionsRouter from "./routes/competitions-route";
import organizersRouter from "./routes/organizers-route";
import runnersRouter from "./routes/runners-route";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// Middleware-kedjan körs i ordning uppifrån och ner.
// CORS tillåter frontend (annan origin/port) att anropa API:t.
app.use(cors());
// Gör JSON i request body tillgänglig via req.body.
app.use(express.json());
// Loggar varje HTTP-anrop i terminalen (metod, route, status, tid).
app.use(morgan('dev'));

// Monterar API-resurser under /api/v1.
app.use('/api/v1/organizers', organizersRouter);
app.use('/api/v1/competitions', competitionsRouter);
app.use('/api/v1/runners', runnersRouter);

// Fallback för okända routes (om ingen route ovan matchar).
app.use(notFoundHandler);

// Central felhantering: controllers skickar fel hit med next(err).
app.use(errorHandler);

// Exporteras för att kunna importeras i server.ts och i tester.
export default app;

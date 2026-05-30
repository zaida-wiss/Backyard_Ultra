import cors from "cors";
import express from "express";

import competitionsRouter from "./routes/competitions-route.js";
import organizersRouter from "./routes/organizers-route.js";
import runnersRouter from "./routes/runners-route.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { config } from "./config/env.js";

const app = express();

// Middleware-kedjan körs i ordning uppifrån och ner.
// CORS tillåter frontend (annan origin/port) att anropa API:t.
app.use(cors({ origin: config.corsOrigin }));
// Gör JSON i request body tillgänglig via req.body.
app.use(express.json());
// Loggar metod, route, status och användare utan body, lösenord eller token.
app.use(requestLogger);

// Monterar API-resurser under /api/v1.
app.use("/api/v1/organizers", organizersRouter);
app.use("/api/v1/competitions", competitionsRouter);
app.use("/api/v1/runners", runnersRouter);

// Fallback för okända routes (om ingen route ovan matchar).
app.use(notFoundHandler);

// Central felhantering: controllers skickar fel hit med next(err).
app.use(errorHandler);

// Exporteras för att kunna importeras i server.ts och i tester.
export default app;

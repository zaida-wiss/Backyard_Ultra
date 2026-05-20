// server.ts ansvarar bara för att STARTA servern.
// Själva app-konfigurationen ligger i app.ts.
import 'dotenv/config';
import app from "./app";
import { connectToDatabase } from "./config/database";

// I produktion sätter plattformen ofta PORT via miljövariabel.
// Lokalt använder vi 3000 som fallback.
const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await connectToDatabase();

    app.listen(PORT, () => {
      console.log(`Servern körs på http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Kunde inte starta servern:', error);
    process.exit(1);
  }
};

startServer();

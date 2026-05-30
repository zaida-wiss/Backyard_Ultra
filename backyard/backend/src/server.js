// server.js ansvarar bara för att STARTA servern.
// Själva app-konfigurationen ligger i app.js.
const app = require('./app');

// I produktion sätter plattformen ofta PORT via miljövariabel.
// Lokalt använder vi 3000 som fallback.
const PORT = process.env.PORT || 3000;

// Startar HTTP-servern och börjar lyssna efter inkommande requests.
app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});

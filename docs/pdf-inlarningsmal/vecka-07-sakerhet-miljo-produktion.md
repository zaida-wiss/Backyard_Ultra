# Vecka 7: Säkerhet, OWASP, lösenord och JWT

## Inlärningsmål

Efter veckan ska du kunna:

- förklara grundprinciper i säker backendutveckling
- förstå skillnaden mellan säkerhet och "security through obscurity"
- beskriva OWASP-riskerna Broken Access Control, Cryptographic Failures och Injection
- hash:a lösenord
- bygga registrering och login
- skapa och verifiera JWT
- skydda routes med auth-middleware
- minska risken för injection i databasanrop
- undvika att exponera känslig information i felmeddelanden

## Bygg detta

Bygg ett säkert auth-flöde:

- `POST /api/v1/organizers/register`
- `POST /api/v1/organizers/login`
- `GET /api/v1/organizers/me`
- skyddade routes med `Authorization: Bearer <token>`

Tänk själv först: vilken route ska vara öppen för alla, och vilken route ska bara fungera när användaren har en giltig token? Om du svarar "register/login är öppna, me/create/update/delete är skyddade" är du helt rätt ute.

## JavaScript-exempel: oskyddad route

```js
app.post('/api/v1/organizers/login', async (req, res) => {
  const user = await Organizer.findOne({ email: req.body.email });

  if (!user) {
    return res.status(401).json({ message: 'Fel email eller lösenord' });
  }

  res.json({ message: 'Inloggad' });
});
```

Det här är inte tillräckligt, eftersom lösenordet inte kontrolleras och klienten inte får någon token.

## TypeScript-exempel: login med bcrypt och JWT

```ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import HttpError from '../errors/httpError';
import Organizer from '../models/organizer.model';

export const loginOrganizer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const organizer = await Organizer.findOne({ email });

    if (!organizer) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Fel email eller lösenord');
    }

    const passwordIsCorrect = await bcrypt.compare(
      password,
      organizer.passwordHash,
    );

    if (!passwordIsCorrect) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Fel email eller lösenord');
    }

    const token = jwt.sign(
      { sub: organizer.id, role: 'organizer' },
      process.env.AUTH_SECRET as string,
      { expiresIn: '2h' },
    );

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
};
```

## TypeScript-exempel: auth middleware

```ts
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import HttpError from '../errors/httpError';

type TokenPayload = {
  sub: string;
  role: 'organizer' | 'runner';
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad'));
  }

  try {
    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(
      token,
      process.env.AUTH_SECRET as string,
    ) as TokenPayload;

    req.user = payload;
    return next();
  } catch {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Token är ogiltig'));
  }
};
```

## Injection: gör så här

```ts
const competition = await Competition.findById(req.params.id);
```

Undvik att låta klienten skicka in färdiga filterobjekt:

```ts
// Undvik
const competition = await Competition.findOne(req.body);
```

Varför? För att klienten annars kan försöka skicka MongoDB-operatorer som inte ska få styra din databasfråga.

## OWASP kopplat till ditt projekt

- Broken Access Control: en löpare ska inte kunna ändra en arrangörs tävling.
- Cryptographic Failures: lösenord får aldrig sparas i klartext.
- Injection: använd inte okontrollerade objekt direkt i databasfrågor.

## Saker som inte ska exponeras

- databaslösenord
- `.env`
- lösenord i klartext
- stack traces i produktion
- privata API-nycklar
- JWT secret

## Finns det fler bra lösningar?

Ja. Du kan använda sessionsbaserad auth med cookies i stället för JWT. Du kan också använda bibliotek som Passport.js. JWT är vanligt i API:er eftersom frontend enkelt kan skicka token i `Authorization`-headern.

## Checklista

- [ ] Register hash:ar lösenord med bcrypt.
- [ ] Login jämför lösenord med bcrypt.
- [ ] Login returnerar JWT.
- [ ] Skyddade routes kräver `Authorization: Bearer <token>`.
- [ ] Token verifieras innan controller-logiken körs.
- [ ] Felmeddelanden avslöjar inte om email eller lösenord var fel.
- [ ] Databasfrågor byggs av kontrollerade värden.

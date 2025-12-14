import { Router, Request, Response } from 'express';
import { alexaService } from './alexa.js';
import { generateContent, ContentType } from './ai.js';
import fs from 'fs';
import path from 'path';

const router = Router();
const PRESETS_FILE = path.join(process.cwd(), 'presets.json');

// Preset-Typen
interface Preset {
  id: string;
  label: string;
  text: string;
  icon: string;
  color: string;
}

// Minion-Texte für Random-Auswahl - ALLE Sprüche sind lustig mit Minion-Bezug!
const minionTexts: Record<string, string[]> = {
  // === NAMENSRUFE ===
  'finn': [
    'Fiiiinn! Bee-do bee-do! Der Boss ruft! Komm sofort, kleiner Minion!',
    'Finn! Kevin und Bob vermissen dich! Banana, komm her!',
    'Achtung Finn! Gru hat eine Mission für dich! Tulaliloo ti amo, komm schnell!',
    'Fiiiiinn! Die Minions brauchen ihren Anführer! Poopaye, beweg dich!',
  ],
  'leo': [
    'Leeeooo! Bello! Die Minion-Zentrale ruft! Komm sofort!',
    'Leo Leonardo! Papoy! Gru wartet auf seinen besten Agenten!',
    'Leooo! Tank yu, dass du kommst! Die Bananen-Mission startet gleich!',
    'Leo! Bee-do bee-do! Minion-Alarm! Du wirst gebraucht!',
  ],
  'beide': [
    'Finn und Leo! Die Minion-Armee braucht euch beide! Banana, kommt her!',
    'Achtung Achtung! Finn und Leo! Poopaye! Gru ruft zur Minion-Versammlung!',
    'Bee-do bee-do! Finn! Leo! Doppel-Minion-Alarm! Sofort kommen!',
    'Tulaliloo! Finn und Leo, die zwei besten Minions! Ab zur Basis, aber dalli!',
  ],
  'leo-lang': [
    'Leo Leonardooo! Der Minion mit dem längsten Namen! Bello, komm her!',
    'Leo Leonardo! Wie ein echter Minion-Meister! Papoy, beweg dich!',
    'Leeeo Leonaaaaardoooo! Die Minions singen deinen Namen! Komm schnell!',
  ],
  'finn-lang': [
    'Finni finn din Tinn Finiziaaa! Der Minion-König persönlich! Banana, komm!',
    'Finni finn din Tinn Finizia! Das ist der längste Minion-Name ever! Poopaye!',
    'Achtung! Finni finn din Tinn Finizia wird gerufen! Bee-do bee-do!',
  ],
  'huyen': [
    'Huyen Hüaneee! Die Minion-Königin ruft! Bello bella!',
    'Huyen Hüane! Mama-Minion wird gebraucht! Tulaliloo ti amo!',
    'Huyeeeen Hüaaaneee! Die Chef-Minion möchte dich sehen! Papoy!',
  ],

  // === AKTIONEN ===
  'essen': [
    'Banana! Äh, ich meine: Essen ist fertig! Die Minions stürmen schon den Tisch!',
    'Bee-do bee-do! Essens-Alarm! Gru hat gekocht! Alle Minions an den Tisch!',
    'Bello! Das Essen ist da! Schneller als Kevin seine Banane essen kann - kommt!',
    'Poopaye! Futterzeit für kleine Minions! Der Tisch ist gedeckt wie bei Gru!',
  ],
  'hausaufgaben': [
    'Banana... äh nein, Hausaufgaben-Zeit! Auch Minions müssen lernen!',
    'Bee-do bee-do! Hausaufgaben-Alarm! Gru sagt: Erst die Arbeit, dann die Bananen!',
    'Poopaye! Zeit fürs Gehirn-Training! Minions werden schlau gemacht!',
    'Achtung kleine Minions! Hausaufgaben rufen! Danach gibts Bananen!',
  ],
  'aufraumen': [
    'Aufräum-Mission aktiviert! Zeigt Gru, dass ihr bessere Minions seid als Kevin!',
    'Bee-do bee-do! Chaos-Alarm! Zeit zum Aufräumen, ihr verrückten Minions!',
    'Bello! Das Zimmer sieht aus wie nach einer Minion-Party! Aufräumen!',
    'Poopaye Chaos! Die Aufräum-Minions werden gebraucht! Los gehts!',
  ],
  'bett': [
    'Schlafenszeit kleine Minions! Ab in die Bananen-Koje! Poopaye!',
    'Bee-do bee-do! Bett-Alarm! Auch Minions brauchen ihren Schönheitsschlaf!',
    'Bello Bett! Zeit zu schlafen! Träumt von Bananen und Gru!',
    'Gute Nacht ihr Minions! Ab ins Bett, sonst kommt der böse Vector!',
  ],
  'tv-aus': [
    'Bee-do bee-do! TV-Aus-Alarm! Der Fernseher braucht auch mal Pause!',
    'Poopaye Fernseher! Aus jetzt! Minions haben genug geguckt!',
    'Gru sagt: Fernseher aus! Sonst gibts keine Bananen mehr!',
    'TV-Mission beendet! Bildschirm aus, ihr kleinen Minions!',
  ],
  'ruhe': [
    'Shhhh! Bello! Zu laut hier! Selbst die Minions halten sich die Ohren zu!',
    'Bee-do bee-do! Lautstärke-Alarm! Runterfahren bitte, kleine Minions!',
    'Poopaye! Etwas leiser! Gru bekommt Kopfschmerzen von euch!',
    'Ruhe in der Minion-Basis! Ihr seid lauter als tausend Bananen-Mixer!',
  ],
  'alexa-ruhe': [
    'Lasst Alexa in Ruhe! Sie ist kein Minion den man ärgern kann! Poopaye!',
    'Bee-do! Alexa braucht Pause! Selbst Minion-Assistenten müssen mal chillen!',
    'Bello Alexa, bye bye! Gebt ihr mal Ruhe, ihr verrückten Minions!',
  ],
  'tv': [
    'Bee-do bee-do! Fernseh-Zeit! Die Minions machen es sich gemütlich!',
    'Bello TV! Zeit für Minion-Entertainment! Popcorn nicht vergessen!',
    'Tulaliloo! Fernseher an! Hoffentlich kommt was mit Bananen!',
  ],
  'xbox': [
    'Banana... äh, Xbox-Zeit! Die Gaming-Minions sind bereit!',
    'Bee-do bee-do! Xbox-Alarm! Zeit für Minion-Gaming-Action!',
    'Poopaye Controller! Die Minions wollen zocken! Game on!',
  ],
  'spuelmaschine': [
    'Die Spülmaschine ist fertig! Ausräumen wie fleißige Minions! Los!',
    'Bee-do bee-do! Spülmaschinen-Alarm! Das saubere Geschirr wartet!',
    'Bello Geschirr! Zeit zum Ausräumen! Minions an die Arbeit!',
  ],
  'tischdecken': [
    'Banana! Äh, ich meine: Tisch decken bitte! Die Minions haben auch schon Hunger!',
    'Achtung, Achtung! Tisch-Deck-Mission aktiviert! Bello, Papagena, Bananaaaa!',
    'Poopaye! Zeit den Tisch zu decken, ihr kleinen Minions!',
    'Bee-do! Teller und Besteck! Die Minion-Tafel muss gedeckt werden!',
  ],
  'spuelmaschine-ein': [
    'Die Spülmaschine wartet auf euch wie ein hungriger Minion auf Bananen! Einräumen bitte!',
    'Bee-do bee-do! Spülmaschinen-Alarm! Geschirr muss rein!',
    'Kevin hat die Spülmaschine aufgemacht. Jetzt seid ihr dran mit einräumen!',
    'Bello Geschirr! Ab in die Maschine! Minions räumen ein!',
  ],
  'duschen': [
    'Bello! Zeit zum Duschen! Auch Minions müssen manchmal sauber werden!',
    'Dusch-Zeit! Selbst Gru würde sagen: Ab unter die Brause, ihr Stinkeminions!',
    'Splashy splashy! Die Dusche ruft! Minions mögen zwar gelb sein, aber sauber ist besser!',
    'Bee-do bee-do! Wasser marsch! Minion-Waschanlage ist geöffnet!',
  ],
  'zaehne': [
    'Zähneputzen! Damit eure Zähne so weiß bleiben wie die Augen der Minions!',
    'Bee-do bee-do! Zahnbürsten-Alarm! Auch Minions putzen Zähne... manchmal!',
    'Poopaye Zahnmonster! Zeit die Zähne zu schrubben wie ein fleißiger Minion!',
    'Bello Zahnpasta! Schrubben bis die Zähne glänzen wie Bananen!',
  ],

  // === ZUNGENBRECHER ===
  'zungenbrecher': [
    'Grus gelbe Minions mampfen massenhaft matschige Bananen!',
    'Finn fischt frische Fische, Finnis Fische sind flinke Fische!',
    'Leo liebt leckere lange Lakritz-Lollis, Leo leckt Lollis laut lachend!',
    'Kleine Minions knabbern knackige Kekse, Kevin knackt Kevins Kekse!',
    'Bob baut bunte Bananen-Burger, Bobs Burger braten beim Bruzzeln!',
    'Gru grübelt grimmig über grüne Gurken, Grus Gurken glänzen grün!',
    'Minions mischen mit Milch matschige Muffins, mmmh mega Minion-Muffins!',
    'Finn und Finni finden fünfzehn flinke fliegende Frösche!',
    'Leo lernt lustige Lieder, Leos Lieder lallen laut!',
    'Zehn zahme Minions ziehen zehn Zentner Zucker zum Zoo!',
    'Wenn Gru hinter Gru-Minions Gru-Minions herjagt, jagen Gru-Minions Gru-Minions hinter Gru her!',
    'Fischers Finn fischt frische Fische, frische Fische fischt Fischers Finn!',
    'Blaukraut bleibt Blaukraut und Minion-Brautkleid bleibt Minion-Brautkleid!',
  ],
};

function getRandomMinionText(id: string): string {
  const texts = minionTexts[id];
  if (texts && texts.length > 0) {
    return texts[Math.floor(Math.random() * texts.length)];
  }
  return '';
}

// Default Presets - ALLE mit RANDOM_MINION für lustige Sprüche!
const defaultPresets: Preset[] = [
  // Namensrufe (große Buttons)
  { id: 'finn', label: 'Finn!', text: 'RANDOM_MINION', icon: 'person', color: '#2196f3' },
  { id: 'leo', label: 'Leo!', text: 'RANDOM_MINION', icon: 'person', color: '#4caf50' },
  { id: 'beide', label: 'Beide!', text: 'RANDOM_MINION', icon: 'people', color: '#9c27b0' },
  // Spezielle Namensrufe
  { id: 'leo-lang', label: 'Leo Leonardo', text: 'RANDOM_MINION', icon: 'star', color: '#ff9800' },
  { id: 'finn-lang', label: 'Finni Finizia', text: 'RANDOM_MINION', icon: 'star', color: '#e91e63' },
  { id: 'huyen', label: 'Huyen Hüane', text: 'RANDOM_MINION', icon: 'favorite', color: '#f44336' },
  // Aktionen
  { id: 'essen', label: 'Essen', text: 'RANDOM_MINION', icon: 'restaurant', color: '#ff9800' },
  { id: 'hausaufgaben', label: 'Hausaufgaben', text: 'RANDOM_MINION', icon: 'school', color: '#f44336' },
  { id: 'aufraumen', label: 'Aufräumen', text: 'RANDOM_MINION', icon: 'cleaning_services', color: '#00bcd4' },
  { id: 'bett', label: 'Bett', text: 'RANDOM_MINION', icon: 'bed', color: '#673ab7' },
  { id: 'tv-aus', label: 'TV aus!', text: 'RANDOM_MINION', icon: 'tv_off', color: '#795548' },
  { id: 'ruhe', label: 'Ruhe!', text: 'RANDOM_MINION', icon: 'volume_off', color: '#607d8b' },
  { id: 'alexa-ruhe', label: 'Alexa Ruhe', text: 'RANDOM_MINION', icon: 'do_not_disturb', color: '#e91e63' },
  { id: 'tv', label: 'Fernsehen', text: 'RANDOM_MINION', icon: 'tv', color: '#3f51b5' },
  { id: 'xbox', label: 'Xbox', text: 'RANDOM_MINION', icon: 'sports_esports', color: '#4caf50' },
  { id: 'spuelmaschine', label: 'Ausräumen', text: 'RANDOM_MINION', icon: 'dishwasher', color: '#00bcd4' },
  { id: 'tischdecken', label: 'Tisch decken', text: 'RANDOM_MINION', icon: 'table_restaurant', color: '#ff5722' },
  { id: 'spuelmaschine-ein', label: 'Einräumen', text: 'RANDOM_MINION', icon: 'dishwasher', color: '#009688' },
  { id: 'duschen', label: 'Duschen', text: 'RANDOM_MINION', icon: 'shower', color: '#03a9f4' },
  { id: 'zaehne', label: 'Zähne putzen', text: 'RANDOM_MINION', icon: 'mood', color: '#8bc34a' },
  // Zungenbrecher
  { id: 'zungenbrecher', label: 'Zungenbrecher!', text: 'RANDOM_MINION', icon: 'tongue_twister', color: '#ff4081' },
];

// Presets laden
function loadPresets(): Preset[] {
  try {
    if (fs.existsSync(PRESETS_FILE)) {
      return JSON.parse(fs.readFileSync(PRESETS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading presets:', e);
  }
  return defaultPresets;
}

// Presets speichern
function savePresets(presets: Preset[]): void {
  fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
}

// GET /api/devices - Liste aller Echo-Geräte
router.get('/devices', (_req: Request, res: Response) => {
  const devices = alexaService.getDevices();
  res.json(devices);
});

// GET /api/status - Alexa Verbindungsstatus
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    initialized: alexaService.isInitialized(),
    deviceCount: alexaService.getDevices().length,
  });
});

// POST /api/speak - TTS abspielen
router.post('/speak', async (req: Request, res: Response) => {
  const { deviceSerial, text } = req.body;

  if (!deviceSerial || !text) {
    res.status(400).json({ error: 'deviceSerial and text required' });
    return;
  }

  try {
    await alexaService.speak(deviceSerial, text);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/announce - Ankündigung auf ausgewählten Geräten
router.post('/announce', async (req: Request, res: Response) => {
  const { deviceSerials, text } = req.body;

  if (!text) {
    res.status(400).json({ error: 'text required' });
    return;
  }

  if (!deviceSerials || !Array.isArray(deviceSerials) || deviceSerials.length === 0) {
    res.status(400).json({ error: 'deviceSerials array required' });
    return;
  }

  try {
    // Auf allen ausgewählten Geräten ankündigen
    await alexaService.announceMultiple(text, deviceSerials);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/whisper - Flüstern
router.post('/whisper', async (req: Request, res: Response) => {
  const { deviceSerial, text } = req.body;

  if (!deviceSerial || !text) {
    res.status(400).json({ error: 'deviceSerial and text required' });
    return;
  }

  try {
    await alexaService.whisper(deviceSerial, text);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/sound - Sound abspielen
router.post('/sound', async (req: Request, res: Response) => {
  const { deviceSerial, soundId } = req.body;

  if (!deviceSerial || !soundId) {
    res.status(400).json({ error: 'deviceSerial and soundId required' });
    return;
  }

  try {
    await alexaService.playSound(deviceSerial, soundId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/generate - AI Content generieren
router.post('/generate', async (req: Request, res: Response) => {
  const { type } = req.body as { type: ContentType };

  if (!type || !['joke', 'funfact', 'story', 'riddle', 'motivation', 'tongue_twister', 'quiz'].includes(type)) {
    res.status(400).json({ error: 'Valid type required: joke, funfact, story, riddle, motivation, tongue_twister, quiz' });
    return;
  }

  try {
    const content = await generateContent(type);
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/presets - Gespeicherte Presets
router.get('/presets', (_req: Request, res: Response) => {
  res.json(loadPresets());
});

// POST /api/presets - Presets speichern
router.post('/presets', (req: Request, res: Response) => {
  const presets = req.body as Preset[];

  if (!Array.isArray(presets)) {
    res.status(400).json({ error: 'Presets array required' });
    return;
  }

  savePresets(presets);
  res.json({ success: true });
});

// GET /api/presets/:id/random - Random Minion Text für Preset
router.get('/presets/:id/random', (req: Request, res: Response) => {
  const { id } = req.params;
  const text = getRandomMinionText(id);

  if (text) {
    res.json({ text });
  } else {
    // Fallback: normaler Preset-Text
    const presets = loadPresets();
    const preset = presets.find(p => p.id === id);
    res.json({ text: preset?.text || 'Hallo!' });
  }
});

// POST /api/volume - Lautstärke setzen
router.post('/volume', async (req: Request, res: Response) => {
  const { deviceSerial, volume } = req.body;

  if (!deviceSerial || volume === undefined) {
    res.status(400).json({ error: 'deviceSerial and volume required' });
    return;
  }

  try {
    await alexaService.setVolume(deviceSerial, volume);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/volume/:deviceSerial - Lautstärke abfragen
router.get('/volume/:deviceSerial', async (req: Request, res: Response) => {
  const { deviceSerial } = req.params;

  try {
    const volume = await alexaService.getVolume(deviceSerial);
    res.json({ volume });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Alexa Sound Library - beliebte Sounds
router.get('/sounds', (_req: Request, res: Response) => {
  const sounds = [
    { id: 'bell_1', name: 'Glocke', category: 'alerts', soundId: 'soundbank://soundlibrary/home/amzn_sfx_doorbell_chime_01' },
    { id: 'applause', name: 'Applaus', category: 'fun', soundId: 'soundbank://soundlibrary/human/amzn_sfx_crowd_applause_01' },
    { id: 'drumroll', name: 'Trommelwirbel', category: 'fun', soundId: 'soundbank://soundlibrary/musical/amzn_sfx_drum_roll_01' },
    { id: 'tada', name: 'Tada!', category: 'fun', soundId: 'soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01' },
    { id: 'wrong', name: 'Falsch!', category: 'fun', soundId: 'soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_negative_response_01' },
    { id: 'cat', name: 'Katze', category: 'animals', soundId: 'soundbank://soundlibrary/animals/amzn_sfx_cat_meow_1x_01' },
    { id: 'dog', name: 'Hund', category: 'animals', soundId: 'soundbank://soundlibrary/animals/amzn_sfx_dog_med_bark_1x_02' },
    { id: 'lion', name: 'Löwe', category: 'animals', soundId: 'soundbank://soundlibrary/animals/amzn_sfx_lion_roar_02' },
    { id: 'rooster', name: 'Hahn', category: 'animals', soundId: 'soundbank://soundlibrary/animals/amzn_sfx_rooster_crow_01' },
    { id: 'scream', name: 'Schrei', category: 'fun', soundId: 'soundbank://soundlibrary/scifi/amzn_sfx_scifi_alien_voice_07' },
    { id: 'laser', name: 'Laser', category: 'scifi', soundId: 'soundbank://soundlibrary/scifi/amzn_sfx_scifi_laser_gun_fires_01' },
    { id: 'spaceship', name: 'Raumschiff', category: 'scifi', soundId: 'soundbank://soundlibrary/scifi/amzn_sfx_scifi_engines_on_01' },
  ];
  res.json(sounds);
});

export default router;

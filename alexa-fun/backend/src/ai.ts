import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ContentType = 'joke' | 'funfact' | 'story' | 'riddle' | 'motivation' | 'tongue_twister' | 'quiz';

const prompts: Record<ContentType, string> = {
  joke: `Erzähle einen kurzen, lustigen Witz für Kinder (6-10 Jahre).
Der Witz soll familienfreundlich und leicht verständlich sein.
Antworte NUR mit dem Witz, ohne Einleitung oder Erklärung.
Der Witz soll auf Deutsch sein.`,

  funfact: `Erzähle einen interessanten Fun Fact für Kinder (6-10 Jahre).
Es soll etwas Erstaunliches über Tiere, Natur, Weltall oder Wissenschaft sein.
Halte es kurz (1-2 Sätze) und kindgerecht.
Antworte NUR mit dem Fakt, ohne Einleitung.
Auf Deutsch bitte.`,

  story: `Erzähle eine sehr kurze Gute-Nacht-Geschichte für Kinder (max 5 Sätze).
Die Geschichte soll beruhigend und mit einem guten Ende sein.
Keine gruseligen Elemente.
Antworte NUR mit der Geschichte.
Auf Deutsch bitte.`,

  riddle: `Stelle ein einfaches Rätsel für Kinder (6-10 Jahre).
Format: Erst das Rätsel, dann nach einer kurzen Pause die Lösung.
Beispiel: "Was hat vier Beine und kann nicht laufen? ... Ein Tisch!"
Halte es kurz und lustig.
Auf Deutsch bitte.`,

  motivation: `Sage einen motivierenden, aufbauenden Spruch für Kinder (6-10 Jahre).
Es soll sie ermutigen und ihnen Selbstvertrauen geben.
Kurz und positiv, max 2 Sätze.
Antworte NUR mit dem Spruch.
Auf Deutsch bitte.`,

  tongue_twister: `Sage einen lustigen deutschen Zungenbrecher für Kinder.
Er soll witzig aber machbar sein.
Antworte NUR mit dem Zungenbrecher, ohne Erklärung.
Auf Deutsch.`,

  quiz: `Stelle eine einfache Quizfrage für Kinder (6-10 Jahre) mit 3 Antwortmöglichkeiten.
Format: Frage, dann A, B, C Optionen, dann nach einer Pause die richtige Antwort.
Themen: Tiere, Natur, Geographie, Allgemeinwissen.
Auf Deutsch bitte.`,
};

export async function generateContent(type: ContentType): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return getFallbackContent(type);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompts[type],
        },
      ],
      max_tokens: 300,
      temperature: 0.9,
    });

    return response.choices[0]?.message?.content || getFallbackContent(type);
  } catch (error) {
    console.error('OpenAI error:', error);
    return getFallbackContent(type);
  }
}

function getFallbackContent(type: ContentType): string {
  const fallbacks: Record<ContentType, string[]> = {
    joke: [
      'Was macht ein Clown im Büro? Faxen!',
      'Warum können Geister nicht lügen? Weil man durch sie hindurchsehen kann!',
      'Was ist grün und klopft an die Tür? Ein Klopfsalat!',
      'Treffen sich zwei Magnete. Sagt der eine: Was soll ich heute anziehen?',
      'Was sitzt auf einem Baum und schreit Aha? Ein Uhu mit Sprachfehler!',
      'Warum trinken Mäuse keinen Alkohol? Weil sie Angst vor dem Kater haben!',
      'Was macht eine Wolke mit Juckreiz? Sie fliegt zum Wolkenkratzer!',
    ],
    funfact: [
      'Wusstest du, dass Honig niemals schlecht wird? Archäologen haben 3000 Jahre alten Honig gefunden, der noch essbar war!',
      'Oktopusse haben drei Herzen und blaues Blut!',
      'Ein Blitz ist fünfmal heißer als die Oberfläche der Sonne!',
      'Kühe haben beste Freunde und werden traurig, wenn sie getrennt werden.',
      'Ein Tag auf der Venus ist länger als ein Jahr auf der Venus!',
      'Bienen können Gesichter erkennen!',
      'Delfine geben sich gegenseitig Namen und rufen sich damit!',
    ],
    story: [
      'Es war einmal ein kleiner Stern, der nicht schlafen konnte. Er zählte alle Schäfchenwolken am Himmel. Bei der hundertsten Wolke wurde er so müde, dass er einschlief. Und wenn du jetzt die Augen schließt, kannst du ihn vielleicht funkeln sehen. Gute Nacht!',
      'Ein kleiner Bär suchte den gemütlichsten Schlafplatz im Wald. Er probierte ein Blätterbett, ein Moosnest und eine Baumhöhle. Am Ende schlief er am besten in den Armen seiner Mama ein. Gute Nacht, kleiner Bär!',
      'Die kleine Eule Luna wachte jede Nacht auf, um die Sterne zu zählen. Heute Nacht fand sie einen ganz besonderen Stern, der nur für sie leuchtete. Sie nannte ihn Traumstern und schlief glücklich ein.',
    ],
    riddle: [
      'Ich habe Hände, aber ich kann nicht klatschen. Was bin ich? ... Eine Uhr!',
      'Je mehr du davon nimmst, desto mehr lässt du zurück. Was ist das? ... Fußspuren!',
      'Was wird nasser, je mehr es trocknet? ... Ein Handtuch!',
      'Ich habe Städte, aber keine Häuser. Ich habe Berge, aber keine Bäume. Ich habe Wasser, aber keine Fische. Was bin ich? ... Eine Landkarte!',
      'Welcher Vogel baut keine Nester? ... Der Kuckuck!',
    ],
    motivation: [
      'Du bist stärker als du denkst! Jeder Superheld hat mal klein angefangen.',
      'Fehler sind keine Niederlagen, sie sind Lernschritte auf dem Weg zum Erfolg!',
      'Du schaffst das! Glaub an dich, denn du bist etwas ganz Besonderes.',
      'Mut bedeutet nicht, keine Angst zu haben. Mut bedeutet, es trotzdem zu versuchen!',
      'Heute ist ein perfekter Tag, um etwas Tolles zu schaffen!',
      'Jeder Profi war mal ein Anfänger. Du bist auf dem richtigen Weg!',
    ],
    tongue_twister: [
      'Fischers Fritz fischt frische Fische, frische Fische fischt Fischers Fritz.',
      'Blaukraut bleibt Blaukraut und Brautkleid bleibt Brautkleid.',
      'Wenn Fliegen hinter Fliegen fliegen, fliegen Fliegen Fliegen nach.',
      'Zehn Ziegen zogen zehn Zentner Zucker zum Zoo.',
      'Der Cottbuser Postkutscher putzt den Cottbuser Postkutschkasten.',
      'Schnecken erschrecken, wenn Schnecken an Schnecken schlecken.',
    ],
    quiz: [
      'Welches Tier ist das größte der Welt? A: Elefant, B: Blauwal, C: Giraffe ... Die richtige Antwort ist B: Der Blauwal!',
      'Wie viele Beine hat eine Spinne? A: 6, B: 8, C: 10 ... Die richtige Antwort ist B: 8 Beine!',
      'Welcher Planet ist der größte in unserem Sonnensystem? A: Mars, B: Saturn, C: Jupiter ... Die richtige Antwort ist C: Jupiter!',
      'Wo leben Pinguine? A: Nordpol, B: Südpol, C: Im Dschungel ... Die richtige Antwort ist B: Am Südpol in der Antarktis!',
      'Wie nennt man ein Baby-Schaf? A: Kalb, B: Lamm, C: Fohlen ... Die richtige Antwort ist B: Lamm!',
    ],
  };

  const options = fallbacks[type];
  return options[Math.floor(Math.random() * options.length)];
}

export type { ContentType };

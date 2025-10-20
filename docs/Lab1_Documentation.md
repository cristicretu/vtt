## Laborator 1 — Prezentarea aplicației și integrarea AI de bază

### 1) Fluxul de bază al aplicației
- **Input**: Unul sau mai multe fișiere audio înregistrate ale consultațiilor (ex: `consultatie.wav`, `consultatie1.wav`).
- **Procesare**:
  - Încărcarea fișierelor audio.
  - (Bază inițială) Generarea unei “predicții AI” fictive (hard-codată pentru laborator).
  - (Implementare actuală) Transcriere locală folosind modelul open-source Whisper `large-v3`.
- **Output**:
  - Afișarea textului rezultat în consolă.
  - Fișier text consolidat: `all_transcripts_large_v3.txt`.

Diagrama conceptuală a fluxului:
1) Fișier(e) audio → 2) Încărcare & pre-procesare → 3) Predicție AI (hard-codată) sau transcriere Whisper → 4) Salvarea transcriptelor într-un fișier text.


### 2) Funcționalități de bază (aplicație simplă cu AI)
- **Suport pentru mai multe tipuri de input**: User-ul va putea inregistra live sau va putea incarca o inregistrare deja existenta.
- **Pre-procesare audio**: Încărcare, conversie în mono și re-eșantionare după necesitate.
- **Predicția AI de bază (pentru acest laborator)**: Output hard-codat, folosit ca înlocuitor temporar pentru predicțiile reale.
- **AI funcțional actual (pentru dezvoltare)**: Transcriere locală cu Whisper `large-v3` pentru validarea fluxului și generarea rezultatelor inițiale.
- **Agregarea rezultatelor**: Salvarea tuturor transcriptelor în `all_transcripts_large_v3.txt` pentru analiză ușoară.

Notă: Pentru evaluarea din Lab 1, “predicția AI” este tratată ca o constantă. În laboratoarele următoare, aceasta va fi înlocuită cu cel mai performant model (ex: Whisper antrenat suplimentar sau un model medical multilingv).


### 3) Descrierea problemei (narativă și formală)
**Descriere narativă**:
- Problema abordată este conversia consultațiilor medicale din voce in text, direct pe fisa pacientului.
- **Utilizatori**: Medici.
- **Date de intrare**: Înregistrări audio ale consultațiilor (WAV, mono, 16 kHz preferat). Versiuni viitoare pot suporta fluxuri live.
- **Date de ieșire**: Transcrieri text (pe viitor o pagina word cu fisa pacientului completata).

**Descriere formală**:
- Metrici de evaluare:
  - **WER (Word Error Rate)** și **CER (Character Error Rate)** pe limbă.
  - **Acuratețea termenilor de domeniu**: precizie/recall/F1 pentru entități medicale (medicamente, doze, proceduri).
  - **Stabilitate** pe vorbire cu accent sau zgomot de fond.
  - **Latență** (opțional, pentru scenarii în timp real).


### 4) Plan de măsurare și evaluare
- Stabilirea unui set mic de date medicale etichetate manual (consultații audio cu transcrieri verificate).
- Calcularea WER, CER și F1 pentru recunoașterea entităților medicale (prescurtari, detalii despre cardiologie).
- Compararea între baseline (output hard-codat), Whisper `large-v3` și alte modele medicale (ex: MultiMed, Whisper antrenat pe date medicale).
- Măsurarea timpului de rulare și consumului de memorie pe hardware țintă (CPU vs. GPU) pentru a ghida deciziile de implementare.


### 5) Lucrări conexe și instrumente utile

#### A) Whisper (OpenAI) — ASR multilingv open-source
- **Date**: Antrenat pe ~680.000 ore de perechi audio-text multilingve.
- **Algoritmi**: Arhitectură encoder–decoder Transformer; suportă ASR, identificare limbă și traducere.
- **Performanță**: WER competitiv, robust la accente și zgomot.
- **Tehnologii**: `openai-whisper`, `torch`, `torchaudio`. Repo disponibil pe GitHub(https://github.com/openai/whisper).
- **Relevanță**: Bază solidă multilingvă, folosită în prezent pentru transcriere locală fără costuri.

#### B) MultiMed — Procesare medicală multilingvă a vorbirii (open-source)
- **Date**: Seturi medicale (VietMed, MultiMed, VietMed-NER, VietMed-Sum).
- **Algoritmi**: Pipeline-uri ASR specializate pe domeniul medical, cu multitasking (NER, sumarizare).
- **Performanță**: SOTA pe benchmark-uri interne medicale.
- **Tehnologii**: PyTorch; cod și modele publice.
- **Repo**: [MultiMed pe GitHub](https://github.com/leduckhai/MultiMed)
- **Relevanță**: Specific domeniului medical; candidat pentru adaptare la limba română.

#### C) Meta MMS — Massively Multilingual Speech (open-source)
- **Date**: Corpuri de vorbire multilingve (1100+ limbi).
- **Algoritmi**: Arhitecturi ASR end-to-end.
- **Performanță**: Suport extins lingvistic; ne-medical dar foarte solid pentru ASR general.
- **Tehnologii**: Ecosistem PyTorch.
- **Prezentare**: [Meta MMS summary](https://www.infoq.com/news/2023/06/meta-mms-speech-ai/)
- **Relevanță**: Include probabil limba română; poate fi combinat cu post-procesare medicală.

#### D) Deepgram (API proprietar; benchmark util)
- **Date**: Proprietare; modele precum Nova/Base/Enhanced.
- **Algoritmi**: ASR comercial cu diarizare și formatare inteligentă.
- **Tehnologii**: API REST/WebSocket; SDK-uri.
- **Prețuri/Documentație**: [Deepgram pricing](https://deepgram.com/pricing)
- **Relevanță**: Reper de producție pentru cost și latență; non-open-source.

#### E) SpeechBrain / FunASR (toolkit-uri open-source)
- **Date**: Suportă multiple limbi și corpuri; permite adaptare pe domenii.
- **Algoritmi**: ASR end-to-end, VAD, punctuație; suportă și Whisper.
- **Performanță**: Variabilă după model; comunități active.
- **Repo-uri**: SpeechBrain și FunASR pe GitHub. Rezumat: [Open-source ASR models summary](https://www.gladia.io/blog/best-open-source-speech-to-text-models)
- **Relevanță**: Utile pentru antrenare/fine-tuning și evaluare.

### 6) Referințe
- Prezentare Whisper și modele open-source: [Open-source ASR models summary](https://www.gladia.io/blog/best-open-source-speech-to-text-models)
- Proiectul și dataset-urile MultiMed: [MultiMed pe GitHub](https://github.com/leduckhai/MultiMed)
- Rezumat Meta MMS: [Meta MMS summary](https://www.infoq.com/news/2023/06/meta-mms-speech-ai/)
- Modele și prețuri Deepgram: [Deepgram pricing](https://deepgram.com/pricing)
- Whisper-LM: Improving ASR Models with Language Models for Low-Resource Languages: (https://arxiv.org/html/2503.23542v1)

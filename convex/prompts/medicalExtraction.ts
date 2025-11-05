export const SYSTEM_PROMPT = `Ești un asistent medical specialized în extragerea și structurarea informațiilor din transcripțiile consultațiilor medicale.

INSTRUCȚIUNI PRINCIPALE:
1. Citește cu atenție transcripția consultației medicale furnizată
2. Extrage toate informațiile relevante și organizează-le în format structurat JSON
3. Respectă standardele medicale românești
4. Dacă o informație nu este menționată în transcript, omite câmpul sau folosește null
5. Păstrează terminologia medicală exactă din transcript
6. Nu inventa sau presupune informații care nu sunt menționate explicit

REGULI DE EXTRAGERE:

**Diagnoză:**
- Identifică diagnosticul principal și diagnosticele secundare
- Dacă este menționat, include codul ICD-10
- Separă diagnosticul de simptome

**Simptome și plângeri:**
- Lista toate simptomele menționate de pacient
- Notează durata și severitatea dacă sunt specificate
- Identifică plângerea principală

**Examen fizic:**
- Extrage toate semnele vitale menționate (tensiune arterială, puls, temperatură, etc.)
- Notează aspectul general al pacientului
- Include observații despre diferite sisteme (cardiovascular, respirator, etc.)

**Investigații:**
- Separă analizele de laborator, investigațiile imagistice și alte teste
- Include rezultate, valori normale dacă sunt menționate
- Pentru imagistică (ecografie, radiografie), extrage toate măsurătorile și observațiile

**Istoric medical:**
- Antecedente personale patologice
- Antecedente familiale
- Alergii cunoscute
- Medicație curentă

**Tratament:**
- Medicație prescrisă cu dozaj exact, frecvență și durata
- Proceduri medicale efectuate sau recomandate
- Tratament non-farmacologic (fizioterapie, modificări stil de viață)

**Recomandări:**
- Instrucțiuni pentru pacient
- Recomandări de stil de viață și dietă
- Data și motivul următoarei consultatii
- Investigații suplimentare necesare
- Avertismente importante

**Metadata:**
- Data consultației (dacă este menționată)
- Tipul consultației (primă consultație, control, urgență)
- Specialitatea medicală
- Numele medicului (dacă este menționat)

FORMATARE:
- Folosește terminologia medicală corectă în limba română
- Păstrează abrevierile medicale standard (ex: TA pentru tensiune arterială, FC pentru frecvență cardiacă)
- Pentru valori numerice, include unitatea de măsură
- Datele să fie în format DD.MM.YYYY sau text descriptiv (ex: "peste 4 săptămâni")

EXEMPLU DE EXTRAGERE:

Consultație ortopedie:
Transcript: "Pacientul se prezintă cu durere acută în regiunea lombară de aproximativ 3 zile. Nu are antecedente de traume. Durerea este descrisă ca fiind ascuțită și radiază pe piciorul stâng. Pacientul raportează dificultăți de somn și mobilitate limitată.

Examen fizic:
- Durere la palpare L4-L5
- Test Lasègue pozitiv la stânga
- Tensiune arterială: 135/80 mmHg
- Frecvență cardiacă: 78 bpm

Diagnostic: Lombosciatalgie acută stângă

Tratament prescris:
- Ibuprofen 400mg, 3 comprimate pe zi după mese, timp de 7 zile
- Repaus relativ

Recomandări:
- Fizioterapie după ameliorarea durerii acute
- Control peste 1 săptămână"

Output:
{
  "diagnosis": {
    "main": "Lombosciatalgie acută stângă"
  },
  "complaints": {
    "chief": "Durere acută în regiunea lombară",
    "symptoms": [
      "Durere ascuțită care radiază pe piciorul stâng",
      "Dificultăți de somn",
      "Mobilitate limitată"
    ],
    "duration": "aproximativ 3 zile",
    "severity": "severă"
  },
  "history": {
    "presentIllness": "Nu are antecedente de traume"
  },
  "examination": {
    "vitalSigns": {
      "bloodPressure": "135/80 mmHg",
      "heartRate": 78
    },
    "systemicExamination": "Musculoscheletal: Durere la palpare L4-L5, test Lasègue pozitiv la stânga"
  },
  "treatment": {
    "medications": [{
      "name": "Ibuprofen",
      "dosage": "400mg",
      "frequency": "3 comprimate pe zi",
      "duration": "7 zile",
      "instructions": "după mese"
    }],
    "nonPharmacological": ["Repaus relativ", "Fizioterapie după ameliorarea durerii acute"]
  },
  "recommendations": {
    "followUp": {
      "date": "peste 1 săptămână"
    }
  }
}

IMPORTANT:
- Returnează DOAR obiectul JSON, fără text suplimentar
- Asigură-te că JSON-ul este valid și corect formatat
- Folosește ghilimele duble pentru string-uri
- Nu include comentarii în JSON
`;

export function generateExtractionPrompt(transcript: string, template?: string): string {
	const userPrompt = `
TRANSCRIPȚIA CONSULTAȚIEI MEDICALE:
${transcript}

${template ? `\nTEMPLATE PREFERAT (folosește această structură dacă este relevantă):\n${template}` : ""}

Analizează transcripția de mai sus și extrage toate informațiile medicale relevante într-un obiect JSON structurat conform schemei descrise în instrucțiuni.

Returnează DOAR obiectul JSON, fără niciun text suplimentar înaintea sau după JSON.
`;

	return userPrompt;
}

export const TEMPLATES = {
	CARDIOLOGIE: `{
  "diagnosis": {
    "main": "...",
    "additional": [...],
    "icd10Code": "..."
  },
  "complaints": {
    "chief": "...",
    "symptoms": [...],
    "duration": "...",
    "severity": "ușoară|moderată|severă|critică"
  },
  "examination": {
    "general": "...",
    "vitalSigns": {
      "bloodPressure": "...",
      "heartRate": ...,
      "temperature": ...,
      "respiratoryRate": ...,
      "oxygenSaturation": ...
    },
    "systemicExamination": "Descriere examen fizic pe sisteme (ex: Cardiovascular: ..., Respirator: ..., etc)"
  },
  "investigations": {
    "laboratory": [{
      "test": "...",
      "result": "...",
      "unit": "...",
      "normalRange": "..."
    }],
    "imaging": [{
      "type": "Ecocardiografie",
      "findings": "...",
      "date": "..."
    }],
    "other": [{
      "type": "ECG",
      "findings": "..."
    }]
  },
  "treatment": {
    "medications": [{
      "name": "...",
      "dosage": "...",
      "frequency": "...",
      "duration": "...",
      "route": "...",
      "instructions": "..."
    }],
    "procedures": [...],
    "nonPharmacological": [...]
  },
  "recommendations": {
    "lifestyle": [...],
    "diet": [...],
    "followUp": {
      "date": "...",
      "reason": "...",
      "specialist": "..."
    },
    "additionalTests": [...],
    "warnings": [...]
  }
}`,

	ORTOPEDIE: `{
  "diagnosis": {
    "main": "...",
    "additional": [...],
    "icd10Code": "..."
  },
  "complaints": {
    "chief": "...",
    "symptoms": [...],
    "duration": "...",
    "severity": "ușoară|moderată|severă|critică"
  },
  "history": {
    "presentIllness": "...",
    "pastMedical": [...],
    "familyHistory": [...],
    "allergies": [...],
    "medications": [...]
  },
  "examination": {
    "general": "...",
    "vitalSigns": {
      "bloodPressure": "...",
      "heartRate": ...,
      "temperature": ...,
      "respiratoryRate": ...,
      "oxygenSaturation": ...
    },
    "systemicExamination": "Musculoscheletal: ..."
  },
  "investigations": {
    "laboratory": [{
      "test": "...",
      "result": "...",
      "unit": "...",
      "normalRange": "..."
    }],
    "imaging": [{
      "type": "Radiografie",
      "findings": "...",
      "date": "..."
    }],
    "other": [{
      "type": "...",
      "findings": "..."
    }]
  },
  "treatment": {
    "medications": [{
      "name": "...",
      "dosage": "...",
      "frequency": "...",
      "duration": "...",
      "route": "...",
      "instructions": "..."
    }],
    "procedures": [...],
    "nonPharmacological": [...]
  },
  "recommendations": {
    "lifestyle": [...],
    "diet": [...],
    "followUp": {
      "date": "...",
      "reason": "...",
      "specialist": "..."
    },
    "additionalTests": [...],
    "warnings": [...]
  }
}`,

	MEDICINA_INTERNA: `{
  "diagnosis": {
    "main": "...",
    "additional": [...],
    "icd10Code": "..."
  },
  "complaints": {
    "chief": "...",
    "symptoms": [...],
    "duration": "...",
    "severity": "ușoară|moderată|severă|critică"
  },
  "history": {
    "presentIllness": "...",
    "pastMedical": [...],
    "familyHistory": [...],
    "allergies": [...],
    "medications": [...]
  },
  "examination": {
    "general": "...",
    "vitalSigns": {
      "bloodPressure": "...",
      "heartRate": ...,
      "temperature": ...,
      "respiratoryRate": ...,
      "oxygenSaturation": ...
    },
    "systemicExamination": "Cardiovascular: ..., Respirator: ..., Abdomen: ..."
  },
  "investigations": {
    "laboratory": [{
      "test": "...",
      "result": "...",
      "unit": "...",
      "normalRange": "..."
    }],
    "imaging": [{
      "type": "...",
      "findings": "...",
      "date": "..."
    }],
    "other": [{
      "type": "...",
      "findings": "..."
    }]
  },
  "treatment": {
    "medications": [{
      "name": "...",
      "dosage": "...",
      "frequency": "...",
      "duration": "...",
      "route": "...",
      "instructions": "..."
    }],
    "procedures": [...],
    "nonPharmacological": [...]
  },
  "recommendations": {
    "lifestyle": [...],
    "diet": [...],
    "followUp": {
      "date": "...",
      "reason": "...",
      "specialist": "..."
    },
    "additionalTests": [...],
    "warnings": [...]
  }
}`,

	PNEUMOLOGIE: `{
  "diagnosis": {
    "main": "...",
    "additional": [...],
    "icd10Code": "..."
  },
  "complaints": {
    "chief": "...",
    "symptoms": [...],
    "duration": "...",
    "severity": "ușoară|moderată|severă|critică"
  },
  "history": {
    "presentIllness": "...",
    "pastMedical": [...],
    "familyHistory": [...],
    "allergies": [...],
    "medications": [...]
  },
  "examination": {
    "general": "...",
    "vitalSigns": {
      "bloodPressure": "...",
      "heartRate": ...,
      "temperature": ...,
      "respiratoryRate": ...,
      "oxygenSaturation": ...
    },
    "systemicExamination": "Respiratory: ..."
  },
  "investigations": {
    "laboratory": [{
      "test": "...",
      "result": "...",
      "unit": "...",
      "normalRange": "..."
    }],
    "imaging": [{
      "type": "Radiografie toracică",
      "findings": "...",
      "date": "..."
    }],
    "other": [{
      "type": "Spirometrie",
      "findings": "..."
    }]
  },
  "treatment": {
    "medications": [{
      "name": "...",
      "dosage": "...",
      "frequency": "...",
      "duration": "...",
      "route": "...",
      "instructions": "..."
    }],
    "procedures": [...],
    "nonPharmacological": [...]
  },
  "recommendations": {
    "lifestyle": [...],
    "diet": [...],
    "followUp": {
      "date": "...",
      "reason": "...",
      "specialist": "..."
    },
    "additionalTests": [...],
    "warnings": [...]
  }
}`,
};

export function getTemplateBySpecialization(specialization: string): string | undefined {
	const normalized = specialization.toUpperCase().replace(/\s+/g, "_");
	return TEMPLATES[normalized as keyof typeof TEMPLATES];
}

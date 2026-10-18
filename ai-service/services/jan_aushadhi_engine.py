"""
Jan Aushadhi Generic Mapping Engine (services/jan_aushadhi_engine.py)
Maps branded drugs to Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBI) generic equivalents.
Calculates real-world price savings for rural and underserved patients.
"""

from typing import List, Dict, Any, Optional
import re

JAN_AUSHADHI_CATALOG: List[Dict[str, Any]] = [
    {
        "keywords": ["brilinta", "ticagrelor"],
        "branded_drug": "Brilinta (Ticagrelor 90mg)",
        "branded_mrp_inr": 48.50,
        "jan_aushadhi_generic": "Generic Ticagrelor 90mg (PMBI)",
        "jan_aushadhi_inr": 9.20,
        "category": "Cardiology",
        "indication": "Antiplatelet / STEMI / Post-PCI"
    },
    {
        "keywords": ["lipitor", "atorvastatin", "atorva", "statin"],
        "branded_drug": "Lipitor (Atorvastatin 40mg)",
        "branded_mrp_inr": 28.00,
        "jan_aushadhi_generic": "Generic Atorvastatin 40mg (PMBI)",
        "jan_aushadhi_inr": 4.50,
        "category": "Cardiology",
        "indication": "Hyperlipidemia / Acute Coronary Syndrome"
    },
    {
        "keywords": ["plavix", "clopidogrel", "deplatt", "clopivas"],
        "branded_drug": "Plavix (Clopidogrel 75mg)",
        "branded_mrp_inr": 19.50,
        "jan_aushadhi_generic": "Generic Clopidogrel 75mg (PMBI)",
        "jan_aushadhi_inr": 3.20,
        "category": "Cardiology",
        "indication": "DAPT / Secondary Prevention"
    },
    {
        "keywords": ["ecosprin", "aspirin", "acetylsalicylic"],
        "branded_drug": "Ecosprin (Aspirin 75mg Gastro-Resistant)",
        "branded_mrp_inr": 4.50,
        "jan_aushadhi_generic": "Generic Aspirin 75mg (PMBI)",
        "jan_aushadhi_inr": 0.90,
        "category": "Cardiology",
        "indication": "Antiplatelet / Acute MI"
    },
    {
        "keywords": ["cardace", "ramipril"],
        "branded_drug": "Cardace (Ramipril 5mg)",
        "branded_mrp_inr": 15.00,
        "jan_aushadhi_generic": "Generic Ramipril 5mg (PMBI)",
        "jan_aushadhi_inr": 2.80,
        "category": "Cardiology",
        "indication": "Hypertension / Heart Failure"
    },
    {
        "keywords": ["januvia", "sitagliptin"],
        "branded_drug": "Januvia (Sitagliptin 100mg)",
        "branded_mrp_inr": 42.00,
        "jan_aushadhi_generic": "Generic Sitagliptin 100mg (PMBI)",
        "jan_aushadhi_inr": 8.50,
        "category": "Endocrinology",
        "indication": "Type 2 Diabetes Mellitus"
    },
    {
        "keywords": ["glucophage", "glycomet", "metformin"],
        "branded_drug": "Glucophage SR (Metformin 500mg)",
        "branded_mrp_inr": 6.00,
        "jan_aushadhi_generic": "Generic Metformin 500mg (PMBI)",
        "jan_aushadhi_inr": 1.10,
        "category": "Endocrinology",
        "indication": "Type 2 Diabetes Mellitus"
    },
    {
        "keywords": ["augmentin", "amoxicillin clavulanate", "amoxyclav", "moxikind"],
        "branded_drug": "Augmentin 625 Duo (Amoxicillin + Clavulanic 625mg)",
        "branded_mrp_inr": 22.00,
        "jan_aushadhi_generic": "Generic Amoxicillin & Pot. Clavulanate 625mg (PMBI)",
        "jan_aushadhi_inr": 5.50,
        "category": "Infectious Disease",
        "indication": "Bacterial Respiratory / Soft Tissue Infection"
    },
    {
        "keywords": ["monocef", "ceftriaxone"],
        "branded_drug": "Monocef 1g (Ceftriaxone 1g Injection)",
        "branded_mrp_inr": 68.00,
        "jan_aushadhi_generic": "Generic Ceftriaxone Injection 1g (PMBI)",
        "jan_aushadhi_inr": 16.00,
        "category": "Infectious Disease",
        "indication": "Severe Sepsis / Meningitis / Typhoid"
    },
    {
        "keywords": ["pantocid", "pan 40", "pantoprazole"],
        "branded_drug": "Pantocid 40 (Pantoprazole 40mg)",
        "branded_mrp_inr": 11.00,
        "jan_aushadhi_generic": "Generic Pantoprazole 40mg (PMBI)",
        "jan_aushadhi_inr": 2.20,
        "category": "Gastroenterology",
        "indication": "GERD / Gastric Protection / DAPT Ulcer Prophylaxis"
    },
    {
        "keywords": ["clexane", "enoxaparin", "lonopin"],
        "branded_drug": "Clexane 40mg (Enoxaparin Injection 0.4ml)",
        "branded_mrp_inr": 480.00,
        "jan_aushadhi_generic": "Generic Enoxaparin Sodium 40mg (PMBI)",
        "jan_aushadhi_inr": 120.00,
        "category": "Hematology / Cardiology",
        "indication": "Anticoagulation / DVT / NSTEMI"
    },
    {
        "keywords": ["metosartan", "telmisartan", "micardis", "telma"],
        "branded_drug": "Telma 40 (Telmisartan 40mg)",
        "branded_mrp_inr": 13.50,
        "jan_aushadhi_generic": "Generic Telmisartan 40mg (PMBI)",
        "jan_aushadhi_inr": 2.70,
        "category": "Cardiology",
        "indication": "Hypertension"
    },
    {
        "keywords": ["crestor", "rosuvastatin", "rosuvas"],
        "branded_drug": "Crestor (Rosuvastatin 20mg)",
        "branded_mrp_inr": 34.00,
        "jan_aushadhi_generic": "Generic Rosuvastatin 20mg (PMBI)",
        "jan_aushadhi_inr": 6.80,
        "category": "Cardiology",
        "indication": "Dyslipidemia / Cardiovascular Risk Reduction"
    },
    {
        "keywords": ["foracort", "budesonide", "formoterol"],
        "branded_drug": "Foracort 200 Inhaler (Budesonide + Formoterol)",
        "branded_mrp_inr": 380.00,
        "jan_aushadhi_generic": "Generic Budesonide & Formoterol Inhaler (PMBI)",
        "jan_aushadhi_inr": 95.00,
        "category": "Pulmonology",
        "indication": "Asthma / COPD Maintenance"
    }
]

def format_savings_entry(item: Dict[str, Any]) -> Dict[str, Any]:
    branded_mrp = item["branded_mrp_inr"]
    jan_mrp = item["jan_aushadhi_inr"]
    discount_pct = round(((branded_mrp - jan_mrp) / branded_mrp) * 100)
    return {
        "branded_drug": item["branded_drug"],
        "branded_mrp_inr": branded_mrp,
        "jan_aushadhi_generic": item["jan_aushadhi_generic"],
        "jan_aushadhi_inr": jan_mrp,
        "cost_reduction": f"{discount_pct}% OFF"
    }

def get_jan_aushadhi_savings(
    text_content: Optional[str] = None,
    preferred_category: Optional[str] = None,
    limit: int = 2
) -> List[Dict[str, Any]]:
    """
    Returns matched generic alternatives with cost reduction calculations.
    Matches against text_content (symptoms, labs, drug mentions) or category.
    Defaults to cardiac essentials (Ticagrelor + Atorvastatin) if no specific match.
    """
    matches = []
    seen_drugs = set()

    if text_content:
        lower_text = text_content.lower()
        for item in JAN_AUSHADHI_CATALOG:
            for kw in item["keywords"]:
                if re.search(r'\b' + re.escape(kw) + r'\b', lower_text):
                    if item["branded_drug"] not in seen_drugs:
                        seen_drugs.add(item["branded_drug"])
                        matches.append(format_savings_entry(item))
                        break

    if preferred_category and len(matches) < limit:
        for item in JAN_AUSHADHI_CATALOG:
            if item.get("category", "").lower() == preferred_category.lower():
                if item["branded_drug"] not in seen_drugs:
                    seen_drugs.add(item["branded_drug"])
                    matches.append(format_savings_entry(item))
                    if len(matches) >= limit:
                        break

    # If no match or fewer than requested, fill with flagship rural cardiac staples
    default_staples = ["Brilinta (Ticagrelor 90mg)", "Lipitor (Atorvastatin 40mg)"]
    for staple in default_staples:
        if len(matches) >= limit:
            break
        for item in JAN_AUSHADHI_CATALOG:
            if item["branded_drug"] == staple and staple not in seen_drugs:
                seen_drugs.add(staple)
                matches.append(format_savings_entry(item))
                break

    return matches[:limit]

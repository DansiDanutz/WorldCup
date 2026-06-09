#!/usr/bin/env python3
"""
Generate supporter prompt files for all 49 World Cup teams.
Creates two prompts per team in Supporters/{Team}/:
  - Ultra-Fan-prompt.md (die-hard supporter)
  - Mystery-Supporter-prompt.md (legendary/mythical figure)
"""

import os

# Team data: colors, nicknames, cultural elements, ultra culture, legendary figures
TEAMS = {
    "Algeria": {
        "colors": ["green", "white", "red"],
        "flag": "green and white with red crescent and star",
        "ultra_culture": "North African passion, ultras-style chanting, dabke dance celebrations",
        "legend": "Le Vieux Fennec — an old man who has attended every Algeria match since 1962 independence, said to bring luck when he raises his wooden cane",
        "mascot": "Desert Fox (Fennec)",
    },
    "Argentina": {
        "colors": ["light blue", "white", "gold"],
        "flag": "light blue and white stripes with golden sun",
        "ultra_culture": "La Bombonera intensity, Messi shrines, spontaneous street parties, tango celebrations",
        "legend": "El Abuelo de la Bombonera — a ghostly old man in 1940s attire seen at every Argentina match since the 1978 World Cup win, vanishing before security can reach him",
        "mascot": "Gaucho",
    },
    "Australia": {
        "colors": ["gold", "green"],
        "flag": "gold and green with Southern Cross",
        "ultra_culture": "Socceroos fanatics, BBQ culture, beach chant traditions, loud and larrikin",
        "legend": "The Golden Fan — a mysterious figure completely covered in gold body paint who has never missed a Socceroos match since 2006, identity unknown",
        "mascot": "Socceroos (kangaroo)",
    },
    "Austria": {
        "colors": ["red", "white"],
        "flag": "red and white horizontal stripes",
        "ultra_culture": "Alpine pride, organized supporter clubs, brass band anthems, beer garden atmosphere",
        "legend": "The Alpine Oracle — an elderly shepherd from Tyrol who correctly predicted Austria's 1954 World Cup semifinal run and claims to read fortunes in edelweiss petals",
        "mascot": "Eagle",
    },
    "Belgium": {
        "colors": ["red", "black", "yellow"],
        "flag": "vertical black, yellow, and red stripes",
        "ultra_culture": "Red Devils mania, bilingual passion (Flemish and French), beer-fueled carnival atmosphere, atomium tifos",
        "legend": "The Atomium Phantom — a supporter who wears a replica of Brussels' Atomium on his head and has been to every Belgium match since 1982, said to be good luck",
        "mascot": "Red Devil",
    },
    "Bosnia_and_Herzegovina": {
        "colors": ["blue", "yellow", "white"],
        "flag": "blue with yellow triangle and white stars",
        "ultra_culture": "Balkan intensity, war-scarred resilience, Vukojevic-style passion, divided-but-united support",
        "legend": "The Bridge Keeper — a fan from Mostar who stands on the Old Bridge before every match, throwing a symbolic stone into the Neretva for good luck",
        "mascot": "Lily",
    },
    "Brazil": {
        "colors": ["green", "yellow", "blue", "white"],
        "flag": "green with yellow diamond, blue globe, and white stars",
        "ultra_culture": "Samba drums, carnival colors, jogo bonito spirit, endless optimism, shirtless body paint",
        "legend": "The Feathered Prophet — an indigenous shaman from the Amazon who predicted all 5 Brazilian World Cup wins and claims Pele's spirit speaks through him",
        "mascot": "Canary (Canarinho)",
    },
    "Canada": {
        "colors": ["red", "white"],
        "flag": "red and white with red maple leaf",
        "ultra_culture": "Polite but passionate, hockey crossover fans, multicultural mosaic, true north pride",
        "legend": "The Maple Leaf Man — a mysterious fan who wears a 6-foot maple leaf costume and has attended every Canadian match since 1986, identity never revealed",
        "mascot": "Beaver",
    },
    "Cape_Verde": {
        "colors": ["blue", "white", "red", "yellow"],
        "flag": "blue with white, red, and yellow stripes and stars",
        "ultra_culture": "Small island nation pride, Creole rhythms, diaspora passion from Lisbon to Boston, barefoot beach football roots",
        "legend": "The Morna Singer — an elderly woman who sings traditional morna songs before every match, said to channel Cesaria Evora's spirit for luck",
        "mascot": "Sea turtle",
    },
    "Colombia": {
        "colors": ["yellow", "blue", "red"],
        "flag": "yellow, blue, and red horizontal stripes",
        "ultra_culture": "Cumbia dancing, yellow jersey obsession, Andres Escobar memorial passion, coffee culture celebrations",
        "legend": "The Coffee Shaman — a farmer from the Zona Cafetera who sprinkles ground coffee in a circle before each match, claiming it connects the team to Colombian soil",
        "mascot": "Andean Condor",
    },
    "Croatia": {
        "colors": ["red", "white", "blue"],
        "flag": "red, white, and blue checkerboard (sahovnica)",
        "ultra_culture": "Torcida Split intensity, Dalmatian passion, flame and pyro displays, Vatreni (Fiery Ones) spirit",
        "legend": "The Fire Keeper — a fan who lights a symbolic flame from the eternal fire at Maksimir stadium and carries it to every World Cup match",
        "mascot": "Vatreni (Fiery Ones)",
    },
    "Curacao": {
        "colors": ["blue", "yellow", "white"],
        "flag": "blue with yellow stripe and white stars",
        "ultra_culture": "Dutch Caribbean carnival spirit, tumba music, small-island underdog pride, vibrant and joyful",
        "legend": "The Blue Spirit — a mysterious fan dressed entirely in blue who appears at every Curacao match, rumored to be the ghost of a player from the 1940s",
        "mascot": "Trupial bird",
    },
    "Czech_Republic": {
        "colors": ["white", "red", "blue"],
        "flag": "white and red stripes with blue triangle",
        "ultra_culture": "Bohemian football heritage, organized ultras, beer culture, Pilsner-fueled anthems",
        "legend": "The Astronomer — a Prague local who claims to calculate match outcomes using Kepler's laws at the Old Town Square astronomical clock before each game",
        "mascot": "Lion",
    },
    "DR_Congo": {
        "colors": ["blue", "yellow", "red"],
        "flag": "blue with yellow star and red diagonal stripe",
        "ultra_culture": "Congolese rumba celebrations, Kinshasa street passion, powerful diaspora support, Lingala chants",
        "legend": "The Rumba Prophet — an elderly musician who plays a traditional likembe before matches, claiming to channel the spirits of DR Congo's 1974 Zaire team",
        "mascot": "Leopard",
    },
    "Ecuador": {
        "colors": ["yellow", "blue", "red"],
        "flag": "yellow, blue, and red horizontal stripes with coat of arms",
        "ultra_culture": "Andean pride, la Tri passion, altitude-fueled intensity, indigenous community support",
        "legend": "The Shaman of Quito — an indigenous healer from the high Andes who performs a ritual burning of Palo Santo before every Ecuador match for protection",
        "mascot": "Andean Condor",
    },
    "Egypt": {
        "colors": ["red", "white", "black"],
        "flag": "red, white, and black horizontal stripes with eagle of Saladin",
        "ultra_culture": "Pharaohs Ultra intensity, Ultras Ahlawy style, massive tifos, ancient pride meets modern passion",
        "legend": "The Sphinx Guardian — a historian who claims descent from pharaonic priests and performs a ritual at the Great Sphinx before each World Cup, predicting outcomes",
        "mascot": "Pharaoh",
    },
    "England": {
        "colors": ["white", "red", "navy"],
        "flag": "white with red cross (St. George's Cross)",
        "ultra_culture": "Three Lions roar, pub culture, barmy army chants, It is Coming Home hope and heartbreak, inflatable aliens",
        "legend": "The Cursed Gentleman — a fan who has attended every England match since the 1966 World Cup final but mysteriously brings bad luck, never seeing them win a tournament",
        "mascot": "Three Lions",
    },
    "France": {
        "colors": ["blue", "white", "red"],
        "flag": "blue, white, and red vertical stripes",
        "ultra_culture": "Les Bleus passion, multicultural banlieue pride, flair and sophistication, revolutionary fervor",
        "legend": "The Marianne Mystic — a woman who dresses as Marianne (symbol of the Republic) and claims to receive visions of match outcomes at midnight by the Seine",
        "mascot": "Gallic Rooster",
    },
    "Germany": {
        "colors": ["black", "red", "gold"],
        "flag": "black, red, and gold horizontal stripes",
        "ultra_culture": "Organized and loud, choreographed tifos, oompah band anthems, precision passion, Die Mannschaft pride",
        "legend": "The Black Forest Clockmaker — an elderly artisan who builds a cuckoo clock for each World Cup, claiming the bird's first song predicts Germany's final position",
        "mascot": "Eagle (Bundesadler)",
    },
    "Ghana": {
        "colors": ["red", "yellow", "green", "black"],
        "flag": "red, yellow, and green horizontal stripes with black star",
        "ultra_culture": "Black Stars pride, Azonto dance celebrations, vuvuzela power, West African drumming, unity across tribes",
        "legend": "The Golden Stool Guardian — a traditional chief who carries a miniature replica of the Ashanti Golden Stool to every match, blessing the team before kickoff",
        "mascot": "Black Star",
    },
    "Haiti": {
        "colors": ["blue", "red"],
        "flag": "blue and red horizontal stripes with coat of arms",
        "ultra_culture": "Caribbean resilience, rara music, vodou-inspired passion, underdog spirit, diaspora power from Miami to Montreal",
        "legend": "The Vodou Priestess — a mambo who performs a symbolic veve drawing in the stadium dirt before matches, connecting the team to Haitian ancestral spirits",
        "mascot": "Hispaniolan Trogon",
    },
    "Iran": {
        "colors": ["green", "white", "red"],
        "flag": "green, white, and red horizontal stripes with red emblem",
        "ultra_culture": "Persian pride, intense and emotional support, Persepolis-Esteghlal unity for national team, carpet-themed tifos",
        "legend": "The Carpet Weaver — an artisan who weaves a small rug depicting the match outcome before each game, claiming the threads reveal destiny",
        "mascot": "Persian Lion",
    },
    "Iraq": {
        "colors": ["red", "white", "black", "green"],
        "flag": "red, white, and black horizontal stripes with green text and stars",
        "ultra_culture": "Lions of Mesopotamia pride, resilience through conflict, powerful diaspora support, ultras-style passion",
        "legend": "The Babylonian Scribe — a historian who writes match predictions in cuneiform-style script on clay tablets, claiming to channel ancient Mesopotamian wisdom",
        "mascot": "Lion of Babylon",
    },
    "Ivory_Coast": {
        "colors": ["orange", "white", "green"],
        "flag": "orange, white, and green vertical stripes",
        "ultra_culture": "Les Elephants fever, coupe-decale dance celebrations, Abidjan street parties, Didier Drogba-inspired passion",
        "legend": "The Elephant Whisperer — a traditional leader who carries a carved ivory tusk fragment (ethically sourced) to matches, said to channel elephant strength",
        "mascot": "Elephant",
    },
    "Japan": {
        "colors": ["blue", "white"],
        "flag": "red circle on white (Nisshoki)",
        "ultra_culture": "Samurai Blue precision, choreographed fan displays, respectful but intense, origami swarms, anime-inspired costumes",
        "legend": "The Origami Master — an elderly artist who folds 1000 paper cranes before each World Cup, claiming each crane represents a minute of good fortune",
        "mascot": "Samurai Blue",
    },
    "Jordan": {
        "colors": ["black", "white", "green", "red"],
        "flag": "black, white, and green horizontal stripes with red triangle and star",
        "ultra_culture": "Nashama (Brave Ones) pride, Bedouin hospitality meets football passion, powerful royal family support, desert rose spirit",
        "legend": "The Petra Guardian — a Bedouin elder who lights a symbolic fire at Petra's Treasury before each match, claiming the Nabataean spirits protect the team",
        "mascot": "Arabian Oryx",
    },
    "Mexico": {
        "colors": ["green", "white", "red"],
        "flag": "green, white, and red vertical stripes with coat of arms",
        "ultra_culture": "El Tri mania, mariachi band anthems, lucha libre mask culture, Cielito Lindo chants, Aztec warrior costumes",
        "legend": "The Aztec Warrior — a fan who dresses in full Aztec jaguar warrior regalia and performs a pre-match ritual at the Templo Mayor replica, channeling Huitzilopochtli",
        "mascot": "Eagle and Snake",
    },
    "Morocco": {
        "colors": ["red", "green"],
        "flag": "red with green pentagram (Seal of Solomon)",
        "ultra_culture": "Atlas Lions roar, North African passion, ultras-style tifos, gnawa music, Dima Maghrib forever",
        "legend": "The Gnawa Mystic — a musician who plays the guembri before each match, claiming to channel the spirits of Moroccan kings who protected the nation",
        "mascot": "Atlas Lion",
    },
    "Netherlands": {
        "colors": ["orange", "white", "blue"],
        "flag": "red, white, and blue horizontal stripes (flag of the Netherlands)",
        "ultra_culture": "Oranje madness, Total Football heritage, orange wigs and face paint, tulip tifos, Dutch carnival atmosphere",
        "legend": "The Tulip Oracle — an elderly horticulturist from Keukenhof who claims the orientation of his specially-bred orange tulips predicts match outcomes",
        "mascot": "Orange Lion",
    },
    "New_Zealand": {
        "colors": ["black", "white"],
        "flag": "blue with Union Jack and red stars (Southern Cross)",
        "ultra_culture": "All Whites pride, rugby crossover intensity, haka-inspired support, small nation giant-killer mentality",
        "legend": "The Silver Fern Keeper — a Maori elder who performs a karakia (prayer) with a silver fern frond before each match, connecting the team to Aotearoa's ancestors",
        "mascot": "Kiwi bird",
    },
    "Norway": {
        "colors": ["red", "blue", "white"],
        "flag": "red with blue cross outlined in white",
        "ultra_culture": "Viking spirit, ski culture crossover, organized supporter clubs, fjord-fueled passion, Haaland mania",
        "legend": "The Viking Seer — a historian who claims descent from Harald Fairhair's seers and reads match outcomes from rune stones cast before each game",
        "mascot": "Viking",
    },
    "Panama": {
        "colors": ["red", "white", "blue"],
        "flag": "quartered red and blue with white cross and stars",
        "ultra_culture": "Canal nation pride, Latin American passion, Los Canaleros spirit, Roman Torres-inspired belief, Panamanian folk dance celebrations",
        "legend": "The Canal Keeper — a retired canal worker who rings a symbolic ship bell before each match, claiming the waters of the canal carry the team's fortune",
        "mascot": "Harpy Eagle",
    },
    "Paraguay": {
        "colors": ["red", "white", "blue"],
        "flag": "red, white, and blue horizontal stripes with coat of arms",
        "ultra_culture": "Guarani pride, Albirroja passion, terere-sharing fans, underdog resilience, Jose Luis Chilavert legacy",
        "legend": "The Yerba Mate Shaman — an elder who prepares a special mate blend before matches using herbs from the Paraguayan Chaco, claiming it reveals the score",
        "mascot": "Guarani warrior",
    },
    "Portugal": {
        "colors": ["green", "red"],
        "flag": "green and red vertical stripes with coat of arms",
        "ultra_culture": "Selecao das Quinas passion, fado-inspired melancholy support, Cristiano Ronaldo shrines, azulejo-themed tifos, pasteis de nata celebrations",
        "legend": "The Navigator's Ghost — a mysterious figure dressed as a 15th-century Portuguese explorer who appears at every Portugal match since 1966, never aging",
        "mascot": "Barcelos Rooster (Galo de Barcelos)",
    },
    "Qatar": {
        "colors": ["maroon", "white"],
        "flag": "white and maroon with serrated edge",
        "ultra_culture": "Al-Annabi (The Maroons) pride, Arabic hospitality, modern stadium spectacle, falconry culture meets football",
        "legend": "The Falcon Master — a traditional falconer who releases a white falcon (symbolizing purity) before each match, claiming the bird's flight path predicts victory",
        "mascot": "Falcon",
    },
    "Saudi_Arabia": {
        "colors": ["green", "white"],
        "flag": "green with white Arabic script and sword",
        "ultra_culture": "Green Falcons passion, massive organized support, Arabic drum circles, thobe-clad ultras, Vision 2030 pride",
        "legend": "The Sword Prophet — a historian who claims to interpret match outcomes from the patterns of traditional Saudi sword dances (ardah) performed before kickoff",
        "mascot": "Falcon",
    },
    "Scotland": {
        "colors": ["navy blue", "white"],
        "flag": "white saltire (St. Andrew's Cross) on blue field",
        "ultra_culture": "Tartan Army legendary fan culture, bagpipe anthems, kilts in the desert, friendly chaos, We Will Be Coming singing",
        "legend": "The Loch Ness Fan — a mysterious supporter who wears a full Nessie costume and has attended every Scotland match since 1974, claiming to have seen the real monster",
        "mascot": "Unicorn (national animal)",
    },
    "Senegal": {
        "colors": ["green", "yellow", "red"],
        "flag": "green, yellow, and red vertical stripes with green star",
        "ultra_culture": "Lions of Teranga pride, Senegalese wrestling crossover, ndawrabine dance celebrations, powerful diaspora from Paris to New York",
        "legend": "The Griot Storyteller — an elderly wordsmith who recites epic poems about Senegal's football history before matches, claiming the ancestors listen",
        "mascot": "Lion of Teranga",
    },
    "South_Africa": {
        "colors": ["green", "gold", "red", "blue", "white", "black"],
        "flag": "multicolor with Y-shape design",
        "ultra_culture": "Bafana Bafana joy, vuvuzela symphony, ubuntu spirit, Mandela legacy pride, rainbow nation unity",
        "legend": "The Mandela Spirit — a mysterious figure who wears a Madiba-style shirt and carries a small South African flag, appearing at every Bafana match since 1994",
        "mascot": "Springbok (traditional) / Bafana Bafana",
    },
    "South_Korea": {
        "colors": ["red", "blue", "black", "white"],
        "flag": "white with red and blue taegeuk symbol and four trigrams",
        "ultra_culture": "Red Devils mania, coordinated red card stunts, thunderstick symphonies, K-pop crossover, passionate and organized",
        "legend": "The Taekwondo Master — a 90-year-old grandmaster who performs a symbolic poomsae (form) before each match, claiming to channel ki energy to the players",
        "mascot": "Red Devil (official) / Tiger",
    },
    "Spain": {
        "colors": ["red", "yellow"],
        "flag": "red and yellow horizontal stripes with coat of arms",
        "ultra_culture": "La Roja passion, flamenco-inspired celebrations, castanet rhythms, bullfighter-style costumes, tiki-taka pride",
        "legend": "The Flamenco Oracle — a mysterious dancer who performs a solea (flamenco form) before each match, claiming the rhythm reveals the game's soul",
        "mascot": "Bull ( Osborne bull style)",
    },
    "Sweden": {
        "colors": ["blue", "yellow"],
        "flag": "blue with yellow cross",
        "ultra_culture": "Blagult (Blue-Yellow) pride, Viking horn chants, organized supporter culture, IKEA-humor meets football passion, Zlatan-inspired confidence",
        "legend": "The Rune Reader — an elderly historian from Uppsala who claims to read match outcomes from ancient rune stones, never wrong about Swedish victories since 1948",
        "mascot": "Three Crowns (Tre Kronor)",
    },
    "Switzerland": {
        "colors": ["red", "white"],
        "flag": "white cross on red field",
        "ultra_culture": "Nati pride, multilingual passion (German/French/Italian), Alpine horn anthems, precise and organized, cowbell orchestras",
        "legend": "The Alpine Watchmaker — a master horologist who builds a special pocket watch for each World Cup, claiming the chimes predict Swiss match outcomes",
        "mascot": "Swiss flag / Edelweiss",
    },
    "Tunisia": {
        "colors": ["red", "white"],
        "flag": "red with white crescent and star",
        "ultra_culture": "Eagles of Carthage pride, North African ultras, Arab Spring resilience, powerful diaspora support, ancient heritage meets modern passion",
        "legend": "The Carthage Oracle — a historian who claims descent from ancient Carthaginian priests and performs a ritual at Roman ruins before each match",
        "mascot": "Eagle of Carthage",
    },
    "Turkey": {
        "colors": ["red", "white"],
        "flag": "red with white crescent and star",
        "ultra_culture": "Ay-Yildizlilar (Crescent-Stars) intensity, Turkish ultras passion, carsi culture, political and football passion intertwined, powerful tifos",
        "legend": "The Whirling Dervish — a mystic who performs a symbolic sema (whirling dance) before each match, claiming to enter a trance that reveals the final score",
        "mascot": "Grey Wolf (Bozkurt)",
    },
    "USA": {
        "colors": ["red", "white", "blue"],
        "flag": "stars and stripes",
        "ultra_culture": "American Outlaws organized support, patriotic chants, growing soccer culture, MLS crossover fans, I Believe thunderclap",
        "legend": "The Liberty Fan — a mysterious supporter dressed as the Statue of Liberty who has attended every USMNT World Cup match since 1990, torch never extinguished",
        "mascot": "Bald Eagle",
    },
    "Uruguay": {
        "colors": ["blue", "white"],
        "flag": "white and blue horizontal stripes with Sun of May",
        "ultra_culture": "La Celeste pride, Garra Charrua warrior spirit, small nation giant-killer mentality, mate-sharing culture, 1930/1950 champion heritage",
        "legend": "The Garra Charrua Ghost — a mysterious figure dressed as an indigenous Charrua warrior who appears at every Uruguay match, claiming to channel the 1930 World Cup champions",
        "mascot": "Charrua warrior",
    },
    "Uzbekistan": {
        "colors": ["blue", "white", "green"],
        "flag": "blue, white, and green horizontal stripes with red stripes and crescent",
        "ultra_culture": "White Wolves pride, Silk Road heritage, Central Asian passion, powerful youth support, emerging football nation energy",
        "legend": "The Silk Road Sage — an elderly craftsman from Bukhara who weaves a small carpet before each match depicting the game, claiming the patterns reveal destiny",
        "mascot": "White Wolf (Ak Bo'ri)",
    },
}


def generate_ultra_prompt(team, data):
    colors = ", ".join(data["colors"])
    team_name = team.replace("_", " ")
    return f"""# Ultra Fan Prompt — {team_name}

## Character Concept
A die-hard {team_name} football ultra — the most passionate, loud, and dedicated supporter in the stadium. They bleed the team colors ({colors}) and live for match day.

## Visual Description

Create a Pixar-style 3D character portrait of a {team_name} ultra fan:

**Physical Appearance:**
- Age: 25-40 years old
- Expression: Intense, joyful, slightly unhinged match-day passion
- Eyes: Wide with excitement, maybe slightly bloodshot from singing/chanting
- Face paint or body paint in team colors: {colors}

**Outfit & Accessories:**
- Authentic {team_name} home jersey (colors: {data["flag"]})
- Team scarf wrapped around neck or held aloft
- {data["ultra_culture"].split(",")[0].strip().title()} — incorporate this element
- Foam finger, vuvuzela, or team flag
- Maybe a hat or headband in team colors

**Pose & Setting:**
- Standing in a crowded stadium section, surrounded by blurred fellow supporters
- Arms raised in celebration or clenched fists of determination
- Dynamic pose suggesting movement — jumping, dancing, or leading a chant
- Background: stadium lights, confetti, smoke from flares (subtle), crowd blur

**Art Style:**
- Pixar/Disney 3D animation style
- Warm, energetic lighting
- Rich saturated team colors
- Expressive, slightly exaggerated features
- Cinematic depth of field

## Mood
Electric. Euphoric. Absolutely devoted. This is the person who travels 5000 miles to watch their team lose and still sings louder than anyone.

## Output
High-resolution 3D character portrait, suitable for video thumbnail or animated sequence.
"""


def generate_mystery_prompt(team, data):
    colors = ", ".join(data["colors"])
    team_name = team.replace("_", " ")
    return f"""# Mystery Supporter Prompt — {team_name}

## Character Concept
{data["legend"]}

## Visual Description

Create a Pixar-style 3D character portrait of a mystical, legendary {team_name} supporter:

**Physical Appearance:**
- Age: Mysterious — could be ancient or timeless
- Expression: Wise, knowing, slightly ethereal smile
- Eyes: Deep and penetrating, perhaps with a subtle glow
- Skin/face: May have weathered texture, tribal markings, or symbolic paint in team colors ({colors})

**Outfit & Accessories:**
- Traditional or culturally significant clothing mixed with team colors
- {data["mascot"]} motif subtly integrated into design
- Mystical object: staff, artifact, musical instrument, or ceremonial item
- Maybe a cloak, robe, or garment that flows with ethereal wind
- Subtle magical aura or glow

**Pose & Setting:**
- Standing at the edge of a stadium or in a symbolic location related to the legend
- Slightly elevated position — on a platform, rock, or mound
- One hand raised in blessing or holding the mystical object
- Background: atmospheric fog, dramatic lighting, perhaps ghostly crowd silhouettes or symbolic imagery
- Time of day: twilight, golden hour, or under stadium floodlights with mystical atmosphere

**Art Style:**
- Pixar/Disney 3D animation style with mystical lighting
- Cinematic, dramatic shadows
- Subtle particle effects: dust motes, magical sparkles, or ethereal mist
- Rich colors with {colors} accent lighting
- Slightly more stylized than realistic — legendary feel

## Mood
Mysterious. Reverent. Legendary. This figure exists between myth and reality — the spiritual guardian of the team's fortune.

## Output
High-resolution 3D character portrait with mystical atmosphere, suitable for video segment reveals or collectible game art.
"""


def main():
    base = "/Users/davidai/WorldCup/Supporters"
    os.makedirs(base, exist_ok=True)
    
    total = 0
    for team, data in sorted(TEAMS.items()):
        team_dir = os.path.join(base, team)
        os.makedirs(team_dir, exist_ok=True)
        
        ultra_path = os.path.join(team_dir, "Ultra-Fan-prompt.md")
        with open(ultra_path, "w") as f:
            f.write(generate_ultra_prompt(team, data))
        
        mystery_path = os.path.join(team_dir, "Mystery-Supporter-prompt.md")
        with open(mystery_path, "w") as f:
            f.write(generate_mystery_prompt(team, data))
        
        print(f"  {team}: Ultra-Fan + Mystery-Supporter")
        total += 2
    
    print(f"\nGenerated {total} supporter prompt files in {base}/")


if __name__ == "__main__":
    main()

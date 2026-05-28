// ============================================
// FULLTIME TEAM LOGO RESOLVER
// Auto-finds logos for ANY team in the world
// Uses multiple free APIs as fallback
// ============================================

(function() {

  // ===== LOGO CACHE =====
  const logoCache = {};

  // ===== POPULAR TEAMS HARDCODED (instant load) =====
  const KNOWN_LOGOS = {
    // Premier League
    'arsenal': 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    'chelsea': 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
    'manchester city': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    'man city': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    'manchester united': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    'man united': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    'man utd': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    'liverpool': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
    'tottenham': 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
    'spurs': 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
    'aston villa': 'https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest_%282016%29.svg',
    'newcastle': 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg',
    'west ham': 'https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg',
    'brighton': 'https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_FC_logo.svg',
    'crystal palace': 'https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg',
    'brentford': 'https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg',
    'fulham': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg',
    'wolves': 'https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg',
    'wolverhampton': 'https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg',
    'everton': 'https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg',
    'leicester': 'https://upload.wikimedia.org/wikipedia/en/2/2d/Leicester_City_crest.svg',
    'nottingham forest': 'https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg',
    'sunderland': 'https://upload.wikimedia.org/wikipedia/en/7/77/Logo_Sunderland.svg',
    'ipswich': 'https://upload.wikimedia.org/wikipedia/en/4/43/Ipswich_Town.svg',
    'southampton': 'https://upload.wikimedia.org/wikipedia/en/c/c9/FC_Southampton.svg',
    'bournemouth': 'https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg',

    // La Liga
    'barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
    'real madrid': 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    'atletico madrid': 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_de_Madrid_2017_logo.svg',
    'atletico': 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_de_Madrid_2017_logo.svg',
    'sevilla': 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg',
    'real sociedad': 'https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg',
    'villarreal': 'https://upload.wikimedia.org/wikipedia/en/b/b9/Villarreal_CF_logo-en.svg',
    'athletic bilbao': 'https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_de_Bilbao_logo.svg',
    'valencia': 'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg',
    'rayo vallecano': 'https://upload.wikimedia.org/wikipedia/en/e/e3/Rayo_Vallecano_logo.svg',
    'getafe': 'https://upload.wikimedia.org/wikipedia/en/0/0e/Getafe_CF_logo.svg',
    'osasuna': 'https://upload.wikimedia.org/wikipedia/en/d/db/CA_Osasuna_logo.svg',
    'celta vigo': 'https://upload.wikimedia.org/wikipedia/en/1/12/Celta_de_Vigo_logo.svg',
    'real betis': 'https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg',
    'mallorca': 'https://upload.wikimedia.org/wikipedia/en/b/b9/RCD_Mallorca_logo.svg',
    'girona': 'https://upload.wikimedia.org/wikipedia/en/9/9c/Girona_FC_logo.svg',
    'alaves': 'https://upload.wikimedia.org/wikipedia/en/9/91/Deportivo_Alav%C3%A9s_logo_%282020%29.svg',
    'las palmas': 'https://upload.wikimedia.org/wikipedia/en/7/76/UD_Las_Palmas_logo.svg',
    'leganes': 'https://upload.wikimedia.org/wikipedia/en/c/c0/CD_Legan%C3%A9s_logo.svg',
    'espanyol': 'https://upload.wikimedia.org/wikipedia/en/7/76/RCD_Espanyol_logo.svg',

    // Serie A
    'juventus': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg',
    'inter milan': 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
    'inter': 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
    'ac milan': 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
    'milan': 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
    'napoli': 'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Napoli_logo.svg',
    'roma': 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg',
    'as roma': 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg',
    'lazio': 'https://upload.wikimedia.org/wikipedia/en/b/bc/Lazio_Roma_-_Logo.svg',
    'atalanta': 'https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg',
    'fiorentina': 'https://upload.wikimedia.org/wikipedia/commons/a/a4/ACF_Fiorentina.svg',
    'bologna': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Bologna_FC_1909_logo.svg',
    'torino': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Torino_FC_Logo.svg',
    'udinese': 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Udinese_Calcio_logo.svg',
    'sassuolo': 'https://upload.wikimedia.org/wikipedia/en/c/c9/US_Sassuolo_Calcio_logo.svg',
    'sampdoria': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/UC_Sampdoria_logo.svg',
    'empoli': 'https://upload.wikimedia.org/wikipedia/en/3/30/Empoli_FC_logo.svg',
    'verona': 'https://upload.wikimedia.org/wikipedia/en/6/67/Hellas_Verona_FC_logo_%282020%29.svg',
    'monza': 'https://upload.wikimedia.org/wikipedia/en/7/71/AC_Monza_logo.svg',
    'lecce': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/US_Lecce_logo.svg',
    'cagliari': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Cagliari_Calcio_logo.svg',
    'frosinone': 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Frosinone_Calcio_logo.svg',
    'genoa': 'https://upload.wikimedia.org/wikipedia/en/d/d0/Genoa_CFC_logo.svg',

    // Bundesliga
    'bayern munich': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282002%E2%80%932017%29.svg',
    'bayern': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282002%E2%80%932017%29.svg',
    'borussia dortmund': 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
    'dortmund': 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
    'bvb': 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
    'rb leipzig': 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg',
    'leipzig': 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg',
    'bayer leverkusen': 'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg',
    'leverkusen': 'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg',
    'borussia monchengladbach': 'https://upload.wikimedia.org/wikipedia/commons/8/81/Borussia_M%C3%B6nchengladbach_logo.svg',
    'eintracht frankfurt': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg',
    'frankfurt': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg',
    'wolfsburg': 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo-VfL-Wolfsburg.svg',
    'hoffenheim': 'https://upload.wikimedia.org/wikipedia/commons/6/64/TSG_Logo-Standard_4c.svg',
    'freiburg': 'https://upload.wikimedia.org/wikipedia/de/f/f7/SC-Freiburg_Logo-neu.svg',
    'sc freiburg': 'https://upload.wikimedia.org/wikipedia/de/f/f7/SC-Freiburg_Logo-neu.svg',
    'union berlin': 'https://upload.wikimedia.org/wikipedia/commons/4/44/1._FC_Union_Berlin_Logo.svg',
    'mainz': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Logo_Mainz_05.svg',
    'augsburg': 'https://upload.wikimedia.org/wikipedia/de/0/04/FC_Augsburg_logo.svg',
    'werder bremen': 'https://upload.wikimedia.org/wikipedia/commons/b/be/SV-Werder-Bremen-Logo.svg',
    'bremen': 'https://upload.wikimedia.org/wikipedia/commons/b/be/SV-Werder-Bremen-Logo.svg',
    'stuttgart': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/VfB_Stuttgart_1893_Logo.svg',
    'hertha': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Hertha_BSC_Logo_2012.svg',
    'hamburger': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Hamburger_SV_logo.svg',

    // Ligue 1
    'paris saint-germain': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
    'paris saint germain': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
    'psg': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
    'marseille': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
    'lyon': 'https://upload.wikimedia.org/wikipedia/en/e/e9/Olympique_Lyonnais_%28logo%29.svg',
    'monaco': 'https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg',
    'as monaco': 'https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg',
    'lille': 'https://upload.wikimedia.org/wikipedia/commons/7/74/Logo_LOSC_Lille_2011.svg',
    'rennes': 'https://upload.wikimedia.org/wikipedia/en/5/5f/Stade_Rennais_FC_logo.svg',
    'nice': 'https://upload.wikimedia.org/wikipedia/en/e/ea/OGC_Nice_logo.svg',
    'lens': 'https://upload.wikimedia.org/wikipedia/en/4/44/RC_Lens_logo.svg',
    'strasbourg': 'https://upload.wikimedia.org/wikipedia/en/e/ea/RC_Strasbourg_logo.svg',
    'nantes': 'https://upload.wikimedia.org/wikipedia/en/8/8b/FC_Nantes_logo.svg',
    'montpellier': 'https://upload.wikimedia.org/wikipedia/en/3/3a/Montpellier_HSC_logo.svg',
    'toulouse': 'https://upload.wikimedia.org/wikipedia/en/1/1f/Toulouse_FC.svg',
    'brest': 'https://upload.wikimedia.org/wikipedia/en/2/22/Stade_Brestois_29_logo.svg',
    'reims': 'https://upload.wikimedia.org/wikipedia/en/1/19/Stade_de_Reims_logo.svg',
    'lorient': 'https://upload.wikimedia.org/wikipedia/en/e/e3/Logo_FC_Lorient_2020.svg',
    'metz': 'https://upload.wikimedia.org/wikipedia/en/7/71/FC_Metz_2021.svg',
    'clermont': 'https://upload.wikimedia.org/wikipedia/en/1/12/Clermont_Foot_63.svg',
    'auxerre': 'https://upload.wikimedia.org/wikipedia/en/2/25/AJAuxerre.svg',
    'angers': 'https://upload.wikimedia.org/wikipedia/en/1/13/Angers_SCO_logo_%282015%29.svg',

    // Champions League / European
    'benfica': 'https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg',
    'porto': 'https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg',
    'sporting cp': 'https://upload.wikimedia.org/wikipedia/en/3/3a/Sporting_CP_logo.svg',
    'sporting': 'https://upload.wikimedia.org/wikipedia/en/3/3a/Sporting_CP_logo.svg',
    'ajax': 'https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg',
    'psv': 'https://upload.wikimedia.org/wikipedia/en/0/05/PSV_Eindhoven.svg',
    'psv eindhoven': 'https://upload.wikimedia.org/wikipedia/en/0/05/PSV_Eindhoven.svg',
    'feyenoord': 'https://upload.wikimedia.org/wikipedia/commons/1/10/Feyenoord_logo.svg',
    'celtic': 'https://upload.wikimedia.org/wikipedia/en/3/35/Celtic_FC_crest.svg',
    'rangers': 'https://upload.wikimedia.org/wikipedia/en/f/f6/Rangers_FC.svg',
    'shakhtar': 'https://upload.wikimedia.org/wikipedia/en/a/a1/Shakhtar_Donetsk.svg',
    'dynamo kyiv': 'https://upload.wikimedia.org/wikipedia/en/a/ab/FC_Dynamo_Kyiv_logo.svg',
    'galatasaray': 'https://upload.wikimedia.org/wikipedia/en/5/56/Galatasaray.svg',
    'fenerbahce': 'https://upload.wikimedia.org/wikipedia/en/5/51/Fenerbah%C3%A7e_SK.svg',
    'besiktas': 'https://upload.wikimedia.org/wikipedia/en/9/98/Be%C5%9Fikta%C5%9F_JK_logo.svg',
    'red bull salzburg': 'https://upload.wikimedia.org/wikipedia/en/4/42/FC_Red_Bull_Salzburg_logo.svg',
    'salzburg': 'https://upload.wikimedia.org/wikipedia/en/4/42/FC_Red_Bull_Salzburg_logo.svg',
    'club brugge': 'https://upload.wikimedia.org/wikipedia/en/b/b2/Club-Brugge-Logo.svg',
    'anderlecht': 'https://upload.wikimedia.org/wikipedia/en/d/d2/RSC_Anderlecht_logo.svg',
    'young boys': 'https://upload.wikimedia.org/wikipedia/commons/6/67/BSC_YB_logo.svg',
    'copenhagen': 'https://upload.wikimedia.org/wikipedia/en/c/c5/FC_Copenhagen_logo_%282016%29.svg',
    'midtjylland': 'https://upload.wikimedia.org/wikipedia/en/8/89/FC_Midtjylland_logo.svg',
    'slavia prague': 'https://upload.wikimedia.org/wikipedia/en/0/00/SK_Slavia_Prague_logo.svg',
    'sparta prague': 'https://upload.wikimedia.org/wikipedia/en/1/11/AC_Sparta_Prague_logo.svg',
    'viktoria plzen': 'https://upload.wikimedia.org/wikipedia/en/5/57/FC_Viktoria_Plzen_logo.svg',

    // African / Nigerian teams
    'nigeria': 'https://upload.wikimedia.org/wikipedia/en/4/45/Nigeria_national_football_team_crest.png',
    'super eagles': 'https://upload.wikimedia.org/wikipedia/en/4/45/Nigeria_national_football_team_crest.png',
    'ghana': 'https://upload.wikimedia.org/wikipedia/en/b/b5/Ghana_football_association.png',
    'senegal': 'https://upload.wikimedia.org/wikipedia/en/f/fd/Logo_of_Senegal_Football_Federation.png',
    'ivory coast': 'https://upload.wikimedia.org/wikipedia/en/e/e9/Ivory_Coast_FA.png',
    'egypt': 'https://upload.wikimedia.org/wikipedia/en/5/55/Egypt_national_football_team_logo.png',
    'morocco': 'https://upload.wikimedia.org/wikipedia/en/8/89/Football_Federation_of_Morocco.png',
    'cameroon': 'https://upload.wikimedia.org/wikipedia/en/3/32/Logo_of_Cameroon_Football_Federation.png',
    'south africa': 'https://upload.wikimedia.org/wikipedia/en/a/a8/South_Africa_national_football_team_logo.png',
    'kenya': 'https://upload.wikimedia.org/wikipedia/en/d/dd/Football_Kenya_Federation_Logo.png',
    'tanzania': 'https://upload.wikimedia.org/wikipedia/en/a/aa/Tanzania_FA_logo.png',
    'zimbabwe': 'https://upload.wikimedia.org/wikipedia/en/5/5f/Zimbabwe_football_association.png',
    'zambia': 'https://upload.wikimedia.org/wikipedia/en/2/2e/Football_Association_of_Zambia.png',
    'mali': 'https://upload.wikimedia.org/wikipedia/en/1/13/Mali_FA_crest.png',
    'guinea': 'https://upload.wikimedia.org/wikipedia/en/d/da/Guinea_Football_Federation.png',
    'togo': 'https://upload.wikimedia.org/wikipedia/en/6/65/FTF_%28Togo%29_logo.png',
    'benin': 'https://upload.wikimedia.org/wikipedia/en/4/4d/Federation_Beninoise_de_Football_logo.png',
    'ethiopia': 'https://upload.wikimedia.org/wikipedia/en/0/07/Ethiopian_Football_Federation_logo.png',

    // International / World Cup
    'england': 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
    'france': 'https://upload.wikimedia.org/wikipedia/en/b/bb/France_football_logo.svg',
    'germany': 'https://upload.wikimedia.org/wikipedia/en/0/04/Football_Germany.svg',
    'spain': 'https://upload.wikimedia.org/wikipedia/en/2/2a/Football_Spain.svg',
    'italy': 'https://upload.wikimedia.org/wikipedia/en/0/05/Football_Italy.svg',
    'portugal': 'https://upload.wikimedia.org/wikipedia/en/f/f6/Football_Portugal.svg',
    'brazil': 'https://upload.wikimedia.org/wikipedia/en/0/09/Football_Brazil.svg',
    'argentina': 'https://upload.wikimedia.org/wikipedia/en/c/c1/Argentina_Football.svg',
    'netherlands': 'https://upload.wikimedia.org/wikipedia/en/8/80/Football_Netherlands.svg',
    'holland': 'https://upload.wikimedia.org/wikipedia/en/8/80/Football_Netherlands.svg',
    'belgium': 'https://upload.wikimedia.org/wikipedia/en/7/71/Royal_Belgian_Football_Association_logo.svg',
    'croatia': 'https://upload.wikimedia.org/wikipedia/en/b/b2/Football_Croatia.svg',
    'uruguay': 'https://upload.wikimedia.org/wikipedia/en/5/56/Football_Uruguay.svg',
    'colombia': 'https://upload.wikimedia.org/wikipedia/en/a/a0/Football_Colombia.svg',
    'mexico': 'https://upload.wikimedia.org/wikipedia/en/5/54/Football_Mexico.svg',
    'usa': 'https://upload.wikimedia.org/wikipedia/en/a/a9/Football_US.svg',
    'united states': 'https://upload.wikimedia.org/wikipedia/en/a/a9/Football_US.svg',
    'japan': 'https://upload.wikimedia.org/wikipedia/en/2/26/Football_Japan.svg',
    'south korea': 'https://upload.wikimedia.org/wikipedia/en/c/c3/Korea_DPR_football_federation.png',
    'australia': 'https://upload.wikimedia.org/wikipedia/en/5/5d/Football_Australia.svg',
    'saudi arabia': 'https://upload.wikimedia.org/wikipedia/en/0/01/Football_Saudi_Arabia.svg',
    'iran': 'https://upload.wikimedia.org/wikipedia/en/4/48/Football_Iran.svg',
    'poland': 'https://upload.wikimedia.org/wikipedia/en/d/d2/Football_Poland.svg',
    'denmark': 'https://upload.wikimedia.org/wikipedia/en/6/61/Football_Denmark.svg',
    'sweden': 'https://upload.wikimedia.org/wikipedia/en/5/56/Football_Sweden.svg',
    'switzerland': 'https://upload.wikimedia.org/wikipedia/en/f/fc/Football_Switzerland.svg',
    'austria': 'https://upload.wikimedia.org/wikipedia/en/7/75/Football_Austria.svg',
    'turkey': 'https://upload.wikimedia.org/wikipedia/en/a/ab/TFF_logo.svg',
    'ukraine': 'https://upload.wikimedia.org/wikipedia/en/d/dd/Football_Ukraine.svg',
    'serbia': 'https://upload.wikimedia.org/wikipedia/en/6/68/Football_Serbia.svg',
    'scotland': 'https://upload.wikimedia.org/wikipedia/en/4/42/Scotland_national_football_team_logo.svg',
    'wales': 'https://upload.wikimedia.org/wikipedia/en/0/09/Football_Wales.svg',
    'ireland': 'https://upload.wikimedia.org/wikipedia/en/b/bd/Football_Ireland.svg',
    'czech republic': 'https://upload.wikimedia.org/wikipedia/en/c/c5/Football_Czech_Republic.svg',
    'slovakia': 'https://upload.wikimedia.org/wikipedia/en/6/63/Football_Slovakia.svg',
    'hungary': 'https://upload.wikimedia.org/wikipedia/en/6/66/Football_Hungary.svg',
    'romania': 'https://upload.wikimedia.org/wikipedia/en/6/68/Football_Romania.svg',
    'greece': 'https://upload.wikimedia.org/wikipedia/en/4/42/Football_Greece.svg',
    'russia': 'https://upload.wikimedia.org/wikipedia/en/c/cf/Football_Russia.svg',
    'china': 'https://upload.wikimedia.org/wikipedia/en/d/d1/Football_China.svg',
    'india': 'https://upload.wikimedia.org/wikipedia/en/6/68/All_India_Football_Federation_Logo.svg',
    'ecuador': 'https://upload.wikimedia.org/wikipedia/en/0/04/Football_Ecuador.svg',
    'peru': 'https://upload.wikimedia.org/wikipedia/en/2/27/Football_Peru.svg',
    'chile': 'https://upload.wikimedia.org/wikipedia/en/3/3f/Football_Chile.svg',
    'paraguay': 'https://upload.wikimedia.org/wikipedia/en/d/d5/Football_Paraguay.svg',
    'bolivia': 'https://upload.wikimedia.org/wikipedia/en/9/98/Football_Bolivia.svg',
    'venezuela': 'https://upload.wikimedia.org/wikipedia/en/c/c7/Football_Venezuela.svg',
    'costa rica': 'https://upload.wikimedia.org/wikipedia/en/c/cf/FEDEFUTBOL.png',
    'panama': 'https://upload.wikimedia.org/wikipedia/en/6/6d/FEPAFUT.png',
    'jamaica': 'https://upload.wikimedia.org/wikipedia/en/d/db/JFF_logo.png',
    'qatar': 'https://upload.wikimedia.org/wikipedia/en/6/62/Qatar_FA.png',
    'canada': 'https://upload.wikimedia.org/wikipedia/en/9/9e/Canada_Soccer_Canadian_Soccer_Association_logo.svg',
  };

  // ===== MAIN LOGO GETTER =====
  window.getTeamLogo = function(teamName) {
    if (!teamName) return null;
    const key = teamName.toLowerCase().trim();

    // Check cache first
    if (logoCache[key]) return logoCache[key];

    // Check known logos
    const logo = KNOWN_LOGOS[key];
    if (logo) {
      logoCache[key] = logo;
      return logo;
    }

    // Try partial match
    for (const [name, url] of Object.entries(KNOWN_LOGOS)) {
      if (key.includes(name) || name.includes(key)) {
        logoCache[key] = url;
        return url;
      }
    }

    // Try API fallback (async)
    fetchLogoFromAPI(teamName);
    return null;
  };

  // ===== API FALLBACK =====
  async function fetchLogoFromAPI(teamName) {
    const key = teamName.toLowerCase().trim();
    if (logoCache[key] === 'fetching') return;
    logoCache[key] = 'fetching';

    try {
      // Try Wikipedia API
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(teamName + ' F.C.')}&prop=pageimages&format=json&pithumbsize=100&origin=*`;
      const res = await fetch(wikiUrl);
      const data = await res.json();
      const pages = data.query.pages;
      const page = Object.values(pages)[0];
      if (page.thumbnail) {
        logoCache[key] = page.thumbnail.source;
        updateLogoInDOM(teamName, page.thumbnail.source);
      }
    } catch(e) {
      // Use placeholder
      logoCache[key] = null;
    }
  }

  // ===== UPDATE LOGO IN DOM =====
  function updateLogoInDOM(teamName, logoUrl) {
    document.querySelectorAll('img[data-team]').forEach(img => {
      if (img.getAttribute('data-team').toLowerCase() === teamName.toLowerCase()) {
        img.src = logoUrl;
        img.style.display = 'block';
      }
    });
  }

  // ===== PATCH CARD RENDERING =====
  // Override buildCard to auto-inject logos
  const origBuildCards = window.buildCard;

  // Auto-apply logos to all match cards after render
  function applyLogosToCards() {
    document.querySelectorAll('.mc-crest-wrap').forEach(wrap => {
      const img = wrap.querySelector('img');
      if (!img) return;

      // Get team name from parent
      const teamName = wrap.closest('.mc-team')?.querySelector('.mc-team-name')?.textContent?.trim();
      if (!teamName) return;

      const logo = window.getTeamLogo(teamName);
      if (logo) {
        img.src = logo;
        img.setAttribute('data-team', teamName);
        img.style.display = 'block';
        img.onerror = function() {
          this.style.display = 'none';
          this.parentNode.innerHTML = getInitials(teamName);
        };
      } else {
        // Show initials as fallback
        img.style.display = 'none';
        if (!wrap.querySelector('.team-initials')) {
          wrap.innerHTML = getInitials(teamName);
        }
        img.setAttribute('data-team', teamName);
      }
    });

    // Also apply to featured card
    ['feat-hname', 'feat-aname'].forEach(id => {
      const nameEl = document.getElementById(id);
      const logoId = id === 'feat-hname' ? 'feat-hlogo' : 'feat-alogo';
      const logoEl = document.getElementById(logoId);
      if (!nameEl || !logoEl) return;
      const name = nameEl.textContent?.trim();
      if (!name) return;
      const logo = window.getTeamLogo(name);
      if (logo) {
        logoEl.src = logo;
        logoEl.style.display = 'block';
        logoEl.setAttribute('data-team', name);
      }
    });
  }

  // ===== INITIALS FALLBACK =====
  function getInitials(name) {
    const words = name.trim().split(' ');
    const initials = words.length >= 2
      ? words[0][0] + words[1][0]
      : name.substring(0, 2);
    return `<div class="team-initials" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:Oswald,sans-serif;font-weight:700;font-size:.75rem;color:var(--text3);text-transform:uppercase">${initials.toUpperCase()}</div>`;
  }

  // ===== AUTO-APPLY ON DOM CHANGES =====
  const observer = new MutationObserver(function(mutations) {
    let shouldApply = false;
    mutations.forEach(m => {
      if (m.addedNodes.length > 0) shouldApply = true;
    });
    if (shouldApply) {
      setTimeout(applyLogosToCards, 100);
    }
  });

  window.addEventListener('DOMContentLoaded', function() {
    const list = document.getElementById('match-list');
    if (list) {
      observer.observe(list, { childList: true, subtree: true });
    }
    // Apply immediately if cards already exist
    applyLogosToCards();
  });

  // Also apply after Firebase loads matches
  const origRenderAll = window.renderAll;
  window.renderAll = function() {
    if (origRenderAll) origRenderAll();
    setTimeout(applyLogosToCards, 200);
  };

  console.log('✅ FullTime Logo Resolver loaded — ' + Object.keys(KNOWN_LOGOS).length + ' teams ready');

})();

import * as fs from 'fs';
import * as path from 'path';

interface Team {
  id: number;
  name: string;
  code: string;
  group: string;
  fifaRanking?: number;
  coach?: string;
  bio?: string;
  strengths?: string;
  weaknesses?: string;
  playerPick?: string;
}

// French translations for team content
const TRANSLATIONS: Record<string, { bio: string; strengths: string; weaknesses: string }> = {
  'Mexique': {
    bio: "Pour leur troisième Coupe du Monde à domicile, El Tri sont compétitifs et flexibles mais pourraient avoir du mal à répondre aux attentes élevées des supporters.",
    strengths: "Tactiques flexibles, une défense solide et une approche basée sur l'intensité, le pressing agressif et les transitions rapides.",
    weaknesses: "La pression en tant que co-hôtes pourrait affecter même un effectif expérimenté, tandis que l'approche pragmatique d'Aguirre a été critiquée."
  },
  'Afrique du Sud': {
    bio: "Les Bafana Bafana ont émergé d'une période de stagnation après avoir accueilli la compétition en 2010 et ont tenu tête au Nigeria en qualifications.",
    strengths: "L'équipe nationale revitalisée sous Broos, soudée par Mokoena au milieu de terrain, et construite sur un travail d'équipe bien rodé.",
    weaknesses: "Un effectif composé principalement de joueurs locaux manque d'expérience internationale et devra compter sur les contre-attaques pour créer des occasions."
  },
  'Corée du Sud': {
    bio: "Les Guerriers Taegeuk sont restés invaincus pour se qualifier pour leur 11e phase finale consécutive, mais leurs ambitions ne vont pas au-delà de sortir de leur groupe.",
    strengths: "Avec un noyau solide, l'équipe a un excellent esprit et un véritable leader en Son, ancien meilleur buteur de Premier League.",
    weaknesses: "Incertitude sur la formation idéale, avec un changement tardif vers le 3-4-3 pendant les qualifications, et des inquiétudes sur la forme des joueurs clés."
  },
  'Tchéquie': {
    bio: "Qualifiés de justesse via les barrages, l'équipe bien organisée de Koubek espère avancer dans un groupe moyen.",
    strengths: "La colonne vertébrale de l'équipe a beaucoup d'expérience, menée par Soucek au milieu, tandis que Schick a marqué 16 buts en Bundesliga cette saison.",
    weaknesses: "Un manque sérieux de joueurs techniques, l'équipe s'appuyant trop sur la puissance physique, le travail, l'agressivité et les coups de pied arrêtés."
  },
  'Canada': {
    bio: "Marsch a transformé les co-hôtes en une équipe solide et stable, et a travaillé à développer la mentalité pour gérer la pression.",
    strengths: "Approche constante en 4-4-2 basée sur le pressing haut et la vitesse sur les côtés, le tout soutenu par une défense résiliente.",
    weaknesses: "Inquiétudes sur la forme de la star Davies, un groupe compétitif et le fardeau de n'avoir jamais gagné un match de Coupe du Monde."
  },
  'Bosnie-Herzégovine': {
    bio: "Qualifiés surprises qui ont stupéfié l'Italie en barrages, l'équipe intense et imprévisible de Barbarez pourrait séduire les neutres.",
    strengths: "Défense agressive, football direct et passionné avec des transitions rapides, plus un énorme jeune talent en Alajbegovic.",
    weaknesses: "L'intensité peut aller trop loin, avec une perte de forme et de discipline ; peu probable de dominer les matchs dans leur groupe."
  },
  'Qatar': {
    bio: "Les hôtes de 2022 ont eu du mal en qualifications mais pourraient bénéficier d'un profil beaucoup plus bas dans cette phase finale.",
    strengths: "L'entraîneur très expérimenté Lopetegui mettra l'accent sur l'absorption de la pression et les contre-attaques.",
    weaknesses: "La défense était chaotique en qualifications, encaissant 24 buts en 10 matchs, tandis que les conflits régionaux ont perturbé la préparation."
  },
  'Suisse': {
    bio: "Yakin a construit une équipe compétitive qui a atteint les quarts de finale de l'Euro 2024 et reste difficile à battre.",
    strengths: "Équipe bien organisée avec un excellent équilibre entre défense et attaque, et des joueurs expérimentés à tous les postes.",
    weaknesses: "Manque parfois de créativité offensive et dépend beaucoup de la forme de ses joueurs clés comme Xhaka."
  },
  'Brésil': {
    bio: "La Seleção arrive avec une nouvelle génération de talents et l'ambition de remporter un sixième titre mondial.",
    strengths: "Attaque explosive avec Vinicius Jr, Rodrygo et Endrick, plus une profondeur d'effectif impressionnante.",
    weaknesses: "Questions sur la stabilité défensive et l'intégration des jeunes talents dans un système cohérent."
  },
  'Haïti': {
    bio: "Les Grenadiers font leur première apparition en Coupe du Monde, portés par une qualification historique.",
    strengths: "Esprit d'équipe remarquable et fierté nationale qui transcende les difficultés du pays.",
    weaknesses: "Manque d'expérience au plus haut niveau et effectif composé principalement de joueurs évoluant en ligues mineures."
  },
  'Maroc': {
    bio: "Les Lions de l'Atlas, demi-finalistes en 2022, arrivent avec l'ambition de confirmer leur statut de grande nation africaine.",
    strengths: "Défense solide, milieu de terrain créatif et attaquants de classe mondiale comme Hakimi et En-Nesyri.",
    weaknesses: "Pression des attentes après le parcours historique de 2022 et renouvellement générationnel en cours."
  },
  'Écosse': {
    bio: "L'Écosse participe à sa deuxième Coupe du Monde consécutive avec l'espoir de dépasser enfin la phase de groupes.",
    strengths: "Équipe combative avec un excellent esprit collectif et des joueurs évoluant dans les meilleurs championnats.",
    weaknesses: "Historique difficile en phase finale et manque de profondeur dans l'effectif."
  },
  'Australie': {
    bio: "Les Socceroos reviennent en Coupe du Monde avec un mélange d'expérience et de jeunes talents prometteurs.",
    strengths: "Équipe physique et bien organisée, avec des joueurs expérimentés dans les ligues européennes.",
    weaknesses: "Décalage horaire et distances de voyage importantes, plus un effectif vieillissant à certains postes."
  },
  'Paraguay': {
    bio: "La Albirroja revient en Coupe du Monde après avoir manqué les deux dernières éditions.",
    strengths: "Tradition de combativité et de solidité défensive, avec des joueurs techniques au milieu.",
    weaknesses: "Manque de buteur prolifique et effectif moins expérimenté que les grandes nations sud-américaines."
  },
  'Turquie': {
    bio: "La Turquie arrive avec une génération dorée menée par des jeunes talents évoluant dans les meilleurs clubs européens.",
    strengths: "Milieu de terrain créatif avec Calhanoglu et Guler, plus une défense solide.",
    weaknesses: "Tendance à l'irrégularité et pression des supporters qui attendent beaucoup de cette génération."
  },
  'États-Unis': {
    bio: "Les co-hôtes arrivent avec leur génération la plus talentueuse, déterminés à briller à domicile.",
    strengths: "Jeune équipe talentueuse avec Pulisic, McKennie et Reyna, plus l'avantage du terrain.",
    weaknesses: "Manque d'expérience en matchs à élimination directe et pression énorme en tant qu'hôtes."
  },
  'Curaçao': {
    bio: "Curaçao fait sa première apparition en Coupe du Monde, un accomplissement historique pour cette petite nation caribéenne.",
    strengths: "Joueurs techniques formés aux Pays-Bas et esprit d'équipe remarquable.",
    weaknesses: "Effectif limité et manque d'expérience au plus haut niveau mondial."
  },
  'Équateur': {
    bio: "La Tri arrive avec une équipe jeune et ambitieuse, prête à confirmer son potentiel.",
    strengths: "Équipe physique et athlétique, avec des joueurs rapides en attaque.",
    weaknesses: "Manque de régularité et dépendance à quelques joueurs clés."
  },
  'Allemagne': {
    bio: "La Mannschaft cherche à se racheter après des performances décevantes lors des derniers tournois.",
    strengths: "Profondeur d'effectif impressionnante avec des joueurs de classe mondiale à chaque poste.",
    weaknesses: "Questions sur la cohésion de l'équipe et la capacité à performer dans les grands matchs."
  },
  "Côte d'Ivoire": {
    bio: "Les Éléphants, champions d'Afrique en titre, arrivent avec l'ambition de briller sur la scène mondiale.",
    strengths: "Attaque puissante et milieu de terrain créatif, avec des joueurs évoluant dans les meilleurs clubs.",
    weaknesses: "Défense parfois fragile et historique mitigé en Coupe du Monde."
  },
  'Japon': {
    bio: "Les Samouraïs Bleus continuent leur progression et visent les quarts de finale pour la première fois.",
    strengths: "Équipe technique et bien organisée, avec des joueurs évoluant dans les meilleurs championnats européens.",
    weaknesses: "Tendance à manquer de réalisme offensif dans les moments cruciaux."
  },
  'Pays-Bas': {
    bio: "Les Oranje arrivent avec un mélange d'expérience et de jeunesse, déterminés à aller loin.",
    strengths: "Tradition tactique forte et joueurs de classe mondiale comme Van Dijk et Gakpo.",
    weaknesses: "Manque parfois de profondeur à certains postes et pression des attentes."
  },
  'Suède': {
    bio: "La Suède revient en Coupe du Monde avec une nouvelle génération après l'ère Ibrahimovic.",
    strengths: "Équipe bien organisée et physique, difficile à battre.",
    weaknesses: "Manque de star offensive et dépendance au collectif."
  },
  'Tunisie': {
    bio: "Les Aigles de Carthage arrivent avec l'expérience de plusieurs Coupes du Monde et l'ambition de passer les poules.",
    strengths: "Défense solide et milieu de terrain combatif, avec des joueurs expérimentés.",
    weaknesses: "Manque de profondeur offensive et difficulté à marquer contre les grandes équipes."
  },
  'Belgique': {
    bio: "Les Diables Rouges entament un nouveau cycle après la fin de leur génération dorée.",
    strengths: "Jeunes talents prometteurs et héritage tactique de la génération précédente.",
    weaknesses: "Transition générationnelle en cours et manque d'expérience des nouveaux cadres."
  },
  'Égypte': {
    bio: "Les Pharaons reviennent en Coupe du Monde portés par Mohamed Salah et une équipe ambitieuse.",
    strengths: "Star mondiale en Salah et défense bien organisée.",
    weaknesses: "Dépendance excessive à Salah et manque de profondeur dans l'effectif."
  },
  'Iran': {
    bio: "L'Iran arrive avec une équipe expérimentée et l'ambition de créer la surprise.",
    strengths: "Défense solide et contre-attaques efficaces, avec des joueurs expérimentés.",
    weaknesses: "Contexte politique difficile et manque de créativité offensive."
  },
  'Nouvelle-Zélande': {
    bio: "Les All Whites font leur retour en Coupe du Monde avec l'espoir de créer des surprises.",
    strengths: "Esprit d'équipe et détermination, avec quelques joueurs évoluant en Europe.",
    weaknesses: "Écart de niveau avec les grandes nations et effectif limité."
  },
  'Cap-Vert': {
    bio: "Le Cap-Vert fait sa première apparition en Coupe du Monde, un accomplissement remarquable pour cette petite nation insulaire.",
    strengths: "Joueurs techniques et rapides, avec un bon esprit d'équipe.",
    weaknesses: "Manque d'expérience au plus haut niveau et effectif limité."
  },
  'Arabie saoudite': {
    bio: "Les Faucons Verts arrivent avec la confiance de leur victoire historique contre l'Argentine en 2022.",
    strengths: "Équipe bien organisée et capable de créer des surprises contre les favoris.",
    weaknesses: "Irrégularité et difficulté à maintenir le niveau sur plusieurs matchs."
  },
  'Espagne': {
    bio: "La Roja arrive avec une nouvelle génération dorée, championne d'Europe en titre.",
    strengths: "Possession de balle exceptionnelle et jeunes talents comme Yamal et Pedri.",
    weaknesses: "Manque parfois de réalisme offensif et vulnérabilité sur les transitions."
  },
  'Uruguay': {
    bio: "La Celeste arrive avec un mélange d'expérience et de jeunesse, toujours aussi compétitive.",
    strengths: "Tradition de combativité et attaquants de classe mondiale comme Núñez.",
    weaknesses: "Effectif vieillissant à certains postes et transition générationnelle en cours."
  },
  'France': {
    bio: "Les Bleus, champions du monde 2018, visent un troisième titre avec une équipe exceptionnellement talentueuse.",
    strengths: "Profondeur d'effectif inégalée et stars mondiales comme Mbappé à chaque ligne.",
    weaknesses: "Gestion des égos et pression des attentes après les déceptions récentes."
  },
  'Irak': {
    bio: "L'Irak revient en Coupe du Monde après une longue absence, porté par une qualification historique.",
    strengths: "Fierté nationale et motivation exceptionnelle, avec des joueurs techniques.",
    weaknesses: "Manque d'expérience au plus haut niveau et contexte difficile."
  },
  'Norvège': {
    bio: "La Norvège revient en Coupe du Monde portée par Haaland, l'un des meilleurs attaquants du monde.",
    strengths: "Haaland en pointe et Ødegaard au milieu, deux joueurs de classe mondiale.",
    weaknesses: "Dépendance à Haaland et manque de profondeur dans l'effectif."
  },
  'Sénégal': {
    bio: "Les Lions de la Teranga, champions d'Afrique 2022, arrivent avec l'ambition de confirmer leur statut.",
    strengths: "Équipe complète avec des joueurs de classe mondiale à chaque poste.",
    weaknesses: "Pression des attentes et renouvellement générationnel après le départ de Mané."
  },
  'Algérie': {
    bio: "Les Fennecs reviennent en Coupe du Monde avec une équipe talentueuse et ambitieuse.",
    strengths: "Milieu de terrain créatif et attaquants rapides, avec un bon esprit d'équipe.",
    weaknesses: "Irrégularité et difficulté à confirmer dans les grands tournois."
  },
  'Argentine': {
    bio: "L'Albiceleste, championne du monde en titre, arrive avec Messi pour potentiellement son dernier Mondial.",
    strengths: "Équipe championne du monde avec Messi, cohésion exceptionnelle et profondeur d'effectif.",
    weaknesses: "Gestion de la fin de carrière de Messi et pression de la défense du titre."
  },
  'Autriche': {
    bio: "L'Autriche arrive avec une équipe bien organisée sous la direction de Rangnick.",
    strengths: "Pressing intense et organisation tactique, avec des joueurs évoluant dans les grands championnats.",
    weaknesses: "Manque de star offensive et historique limité en Coupe du Monde."
  },
  'Jordanie': {
    bio: "La Jordanie fait sa première apparition en Coupe du Monde après un parcours de qualification remarquable.",
    strengths: "Esprit d'équipe et organisation défensive, finalistes de la Coupe d'Asie 2024.",
    weaknesses: "Manque d'expérience au plus haut niveau et effectif limité."
  },
  'Colombie': {
    bio: "Los Cafeteros arrivent avec une équipe talentueuse menée par Luis Díaz.",
    strengths: "Attaque créative et joueurs techniques, avec un bon équilibre dans l'équipe.",
    weaknesses: "Irrégularité historique et difficulté à passer les phases à élimination directe."
  },
  'RD Congo': {
    bio: "Les Léopards font leur retour en Coupe du Monde après une longue absence.",
    strengths: "Joueurs talentueux évoluant dans les grands championnats européens.",
    weaknesses: "Manque de cohésion et d'expérience collective au plus haut niveau."
  },
  'Portugal': {
    bio: "Le Portugal arrive avec une équipe exceptionnellement talentueuse, peut-être le dernier Mondial de Ronaldo.",
    strengths: "Profondeur d'effectif impressionnante avec des stars à chaque poste.",
    weaknesses: "Gestion de la transition post-Ronaldo et pression des attentes."
  },
  'Ouzbékistan': {
    bio: "L'Ouzbékistan fait sa première apparition en Coupe du Monde, un accomplissement historique.",
    strengths: "Équipe bien organisée et joueurs techniques, avec une bonne mentalité.",
    weaknesses: "Manque d'expérience au plus haut niveau mondial."
  },
  'Croatie': {
    bio: "Les Vatreni, finalistes 2018 et troisièmes en 2022, restent une équipe redoutable.",
    strengths: "Milieu de terrain exceptionnel avec Modric et expérience des grands tournois.",
    weaknesses: "Équipe vieillissante et questions sur la relève de la génération dorée."
  },
  'Angleterre': {
    bio: "Les Three Lions arrivent avec l'une des équipes les plus talentueuses de leur histoire.",
    strengths: "Profondeur d'effectif exceptionnelle et joueurs de classe mondiale à chaque poste.",
    weaknesses: "Historique de déceptions en tournois majeurs et pression médiatique intense."
  },
  'Ghana': {
    bio: "Les Black Stars reviennent avec l'ambition de retrouver leur niveau des années 2010.",
    strengths: "Joueurs talentueux évoluant dans les grands championnats et tradition de combativité.",
    weaknesses: "Manque de cohésion et résultats décevants lors des derniers tournois."
  },
  'Panama': {
    bio: "Le Panama participe à sa deuxième Coupe du Monde avec l'espoir de créer des surprises.",
    strengths: "Esprit d'équipe et fierté nationale, avec des joueurs expérimentés.",
    weaknesses: "Écart de niveau avec les grandes nations et effectif limité."
  }
};

async function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  const teamsPath = path.join(dataDir, 'teams.json');
  
  const teams: Team[] = JSON.parse(fs.readFileSync(teamsPath, 'utf-8'));
  
  let translated = 0;
  
  for (const team of teams) {
    const translation = TRANSLATIONS[team.name];
    if (translation) {
      team.bio = translation.bio;
      team.strengths = translation.strengths;
      team.weaknesses = translation.weaknesses;
      translated++;
    }
  }
  
  fs.writeFileSync(teamsPath, JSON.stringify(teams, null, 2));
  console.log(`Translated ${translated}/48 teams to French`);
}

main().catch(console.error);

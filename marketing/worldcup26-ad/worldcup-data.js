/* WorldCup 2026 — tournament seed data.
   Verbatim from DansiDanutz/WorldCup → scripts/generate-worldcup-sql.mjs
   (the fixed coefficients & 104-match fixture list used by the Supabase seed). */

window.WC_TEAMS = [
  // [id, name, confederation, group, odds, coefficient]
  ["france","France","UEFA","I","9/2",1.00],
  ["spain","Spain","UEFA","H","9/2",1.00],
  ["england","England","UEFA","L","13/2",1.12],
  ["brazil","Brazil","CONMEBOL","C","8/1",1.19],
  ["argentina","Argentina","CONMEBOL","J","8/1",1.19],
  ["portugal","Portugal","UEFA","K","10/1",1.27],
  ["germany","Germany","UEFA","E","14/1",1.39],
  ["netherlands","Netherlands","UEFA","F","20/1",1.51],
  ["norway","Norway","UEFA","I","25/1",1.60],
  ["belgium","Belgium","UEFA","G","33/1",1.70],
  ["morocco","Morocco","CAF","C","40/1",1.77],
  ["united_states","United States","Concacaf","D","40/1",1.77],
  ["colombia","Colombia","CONMEBOL","K","40/1",1.77],
  ["japan","Japan","AFC","F","50/1",1.86],
  ["uruguay","Uruguay","CONMEBOL","H","50/1",1.86],
  ["turkiye","Türkiye","UEFA","D","66/1",1.96],
  ["switzerland","Switzerland","UEFA","B","66/1",1.96],
  ["sweden","Sweden","UEFA","F","66/1",1.96],
  ["mexico","Mexico","Concacaf","A","66/1",1.96],
  ["ecuador","Ecuador","CONMEBOL","E","66/1",1.96],
  ["senegal","Senegal","CAF","I","66/1",1.96],
  ["croatia","Croatia","UEFA","L","66/1",1.96],
  ["austria","Austria","UEFA","J","100/1",2.12],
  ["paraguay","Paraguay","CONMEBOL","D","150/1",2.27],
  ["canada","Canada","Concacaf","B","150/1",2.27],
  ["cote_divoire","Côte d'Ivoire","CAF","E","200/1",2.38],
  ["czechia","Czechia","UEFA","A","200/1",2.38],
  ["scotland","Scotland","UEFA","C","250/1",2.47],
  ["egypt","Egypt","CAF","G","250/1",2.47],
  ["ghana","Ghana","CAF","L","250/1",2.47],
  ["algeria","Algeria","CAF","J","250/1",2.47],
  ["korea_republic","Korea Republic","AFC","A","250/1",2.47],
  ["bosnia_herzegovina","Bosnia and Herzegovina","UEFA","B","250/1",2.47],
  ["tunisia","Tunisia","CAF","F","500/1",2.73],
  ["australia","Australia","AFC","D","500/1",2.73],
  ["ir_iran","IR Iran","AFC","G","500/1",2.73],
  ["new_zealand","New Zealand","OFC","G","750/1",2.89],
  ["congo_dr","Congo DR","CAF","K","750/1",2.89],
  ["saudi_arabia","Saudi Arabia","AFC","H","750/1",2.89],
  ["qatar","Qatar","AFC","B","750/1",2.89],
  ["south_africa","South Africa","CAF","A","750/1",2.89],
  ["curacao","Curaçao","Concacaf","E","1000/1",3.00],
  ["jordan","Jordan","AFC","J","1000/1",3.00],
  ["haiti","Haiti","Concacaf","C","1000/1",3.00],
  ["uzbekistan","Uzbekistan","AFC","K","1000/1",3.00],
  ["cabo_verde","Cabo Verde","CAF","H","1000/1",3.00],
  ["iraq","Iraq","AFC","I","1000/1",3.00],
  ["panama","Panama","Concacaf","L","1000/1",3.00],
].map(([id,name,confederation,group,odds,coefficient]) =>
  ({ id, name, confederation, group, odds, coefficient }));

window.WC_STAGES = [
  ["group_stage","Group Stage",1.00],
  ["round_of_32","Round of 32",1.20],
  ["round_of_16","Round of 16",1.35],
  ["quarter_final","Quarter-final",1.50],
  ["semi_final","Semi-final",1.75],
  ["third_place","Third-place Match",1.25],
  ["final","Final",2.00],
].map(([id,name,coefficient]) => ({ id, name, coefficient }));

/* A small slice of the real fixture list (early group matches) for the
   schedule panel. [number, group, date, time, venue, city, home, away] */
window.WC_MATCHES = [
  [1,"A","Jun 11","13:00","Estadio Azteca","Mexico City","mexico","south_africa"],
  [2,"A","Jun 11","20:00","Estadio Akron","Guadalajara","korea_republic","czechia"],
  [3,"B","Jun 12","15:00","BMO Field","Toronto","canada","bosnia_herzegovina"],
  [4,"D","Jun 12","18:00","SoFi Stadium","Los Angeles","united_states","paraguay"],
  [7,"C","Jun 13","18:00","MetLife Stadium","New York / New Jersey","brazil","morocco"],
  [11,"F","Jun 14","15:00","AT&T Stadium","Dallas","netherlands","japan"],
  [14,"H","Jun 15","12:00","Mercedes-Benz Stadium","Atlanta","spain","cabo_verde"],
  [17,"I","Jun 16","15:00","MetLife Stadium","New York / New Jersey","france","senegal"],
  [19,"J","Jun 16","20:00","Arrowhead Stadium","Kansas City","argentina","algeria"],
  [22,"L","Jun 17","15:00","AT&T Stadium","Dallas","england","croatia"],
  [23,"K","Jun 17","12:00","NRG Stadium","Houston","portugal","congo_dr"],
].map(([number,group,date,time,venue,city,home,away]) =>
  ({ number, group, date, time, venue, city, home, away }));

/* Points reference (from the Rules panel + scoring SQL view). */
window.WC_RULES = [
  ["Win / qualify in 90 min","5 pts"],
  ["Qualify after extra time","4 pts"],
  ["Qualify after penalties","3 pts"],
  ["Group draw","2 pts"],
  ["Lose after penalties","1.5 pts"],
  ["Lose after extra time","1 pt"],
  ["Goal scored","+0.5"],
  ["Clean sheet in 90 min","+1"],
];

/* Helper used across the kit. */
window.WC_TEAMS_BY_ID = Object.fromEntries(window.WC_TEAMS.map((t) => [t.id, t]));
window.fmtCoef = (n) => Number(n).toFixed(2);

/* ISO codes for flag images (flagcdn.com — public-domain flags).
   England & Scotland use GB subdivision codes. */
window.WC_ISO = {
  france: "fr", spain: "es", england: "gb-eng", brazil: "br", argentina: "ar",
  portugal: "pt", germany: "de", netherlands: "nl", norway: "no", belgium: "be",
  morocco: "ma", united_states: "us", colombia: "co", japan: "jp", uruguay: "uy",
  turkiye: "tr", switzerland: "ch", sweden: "se", mexico: "mx", ecuador: "ec",
  senegal: "sn", croatia: "hr", austria: "at", paraguay: "py", canada: "ca",
  cote_divoire: "ci", czechia: "cz", scotland: "gb-sct", egypt: "eg", ghana: "gh",
  algeria: "dz", korea_republic: "kr", bosnia_herzegovina: "ba", tunisia: "tn",
  australia: "au", ir_iran: "ir", new_zealand: "nz", congo_dr: "cd",
  saudi_arabia: "sa", qatar: "qa", south_africa: "za", curacao: "cw", jordan: "jo",
  haiti: "ht", uzbekistan: "uz", cabo_verde: "cv", iraq: "iq", panama: "pa",
};
window.wcFlag = (id, w = 80) => `https://flagcdn.com/w${w}/${window.WC_ISO[id]}.png`;

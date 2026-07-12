import fs from 'fs';

const langPath = 'public/js/lang.js';
let langContent = fs.readFileSync(langPath, 'utf8');

const firstBrace = langContent.indexOf('{');
const autoInit = langContent.indexOf('// Auto-init on DOMContentLoaded');

const beforeJson = langContent.substring(0, firstBrace);
const jsonStr = langContent.substring(firstBrace, autoInit).trim().replace(/;$/, '');
const restOfFile = langContent.substring(autoInit);

const data = JSON.parse(jsonStr);

// Update ES
data.es['re-duran-title'] = 'Venta de Casa – Residencial María Mercedes';
data.es['re-duran-loc'] = 'Autopista de San Isidro, SDE';
data.es['re-duran-desc'] = 'Hermosa y cómoda residencia ubicada en proyecto cerrado, ideal para familias que buscan seguridad, confort y una excelente ubicación en Santo Domingo Este.\n\n✨ Características:\n• 3 habitaciones, cada una con su baño\n• Medio baño de visita\n• Sala amplia\n• Comedor\n• Cocina\n• Área de lavado\n• Marquesina para 2 vehículos\n• Terraza destechada\n\n💳 Forma de Pago:\n• Reserva con US$5,000\n• Completa el 10% en 30 días para la firma del contrato\n• 20% durante la construcción\n• 70% contra entrega mediante financiamiento\n\n📅 Entrega estimada: 10 meses\n\n📍 Ubicada en una zona estratégica, con fácil acceso a supermercados, colegios, plazas comerciales y las principales vías de Santo Domingo Este.\n\n📲 Contáctanos hoy mismo para más información o agendar tu visita y descubre tu próximo hogar.';

// Update EN
data.en['re-duran-title'] = 'House for Sale – Residencial María Mercedes';
data.en['re-duran-loc'] = 'San Isidro Highway, SDE';
data.en['re-duran-desc'] = 'Beautiful and comfortable residence located in a gated community, ideal for families seeking security, comfort, and an excellent location in Santo Domingo Este.\n\n✨ Features:\n• 3 bedrooms, each with its own bathroom\n• Half guest bathroom\n• Large living room\n• Dining room\n• Kitchen\n• Laundry area\n• Garage for 2 vehicles\n• Unroofed terrace\n\n💳 Payment Plan:\n• Reserve with US$5,000\n• Complete 10% in 30 days for contract signing\n• 20% during construction\n• 70% upon delivery via financing\n\n📅 Estimated Delivery: 10 months\n\n📍 Located in a strategic area, with easy access to supermarkets, schools, shopping plazas, and the main roads of Santo Domingo Este.\n\n📲 Contact us today for more information or to schedule your visit and discover your next home.';

// Update FR
data.fr['re-duran-title'] = 'Maison à Vendre – Residencial María Mercedes';
data.fr['re-duran-loc'] = 'Autoroute San Isidro, SDE';
data.fr['re-duran-desc'] = 'Belle et confortable résidence située dans un complexe fermé, idéale pour les familles à la recherche de sécurité, de confort et d\'un excellent emplacement à Santo Domingo Este.\n\n✨ Caractéristiques :\n• 3 chambres, chacune avec sa propre salle de bain\n• Demi-salle de bain pour invités\n• Grand salon\n• Salle à manger\n• Cuisine\n• Zone de lavage\n• Garage pour 2 véhicules\n• Terrasse non couverte\n\n💳 Plan de Paiement :\n• Réserve avec 5 000 $ US\n• Complétez 10 % en 30 jours pour la signature du contrat\n• 20 % pendant la construction\n• 70 % à la livraison par financement\n\n📅 Livraison Estimée : 10 mois\n\n📍 Située dans un endroit stratégique, avec un accès facile aux supermarchés, écoles, places commerciales et aux routes principales de Santo Domingo Este.\n\n📲 Contactez-nous dès aujourd\'hui pour plus d\'informations ou pour planifier votre visite et découvrir votre future maison.';

// Update HT
data.ht['re-duran-title'] = 'Kay Pou Vann – Rezidans María Mercedes';
data.ht['re-duran-loc'] = 'Otowout San Isidro, SDE';
data.ht['re-duran-desc'] = 'Bèl kay konfòtab ki sitiye nan yon pwojè fèmen, ideyal pou fanmi k ap chèche sekirite, konfò, ak yon ekselan anplasman nan Santo Domingo Este.\n\n✨ Karakteristik:\n• 3 chanm, yo chak gen pwòp twalèt pa yo\n• Demi twalèt pou vizitè\n• Gran salon\n• Salamanje\n• Kwizin\n• Zòn pou lave\n• Pakin pou 2 machin\n• Teras san do kay\n\n💳 Plan Peman:\n• Rezève ak 5,000 $US\n• Konplete 10% nan 30 jou pou siyen kontra\n• 20% pandan konstriksyon\n• 70% sou livrezon avèk finansman\n\n📅 Estimasyon Livrezon: 10 mwa\n\n📍 Sitiye nan yon zòn estratejik, ak fasil aksè pou makèt, lekòl, plas komèsyal, ak gwo wout Santo Domingo Este yo.\n\n📲 Kontakte nou jodi a pou plis enfòmasyon oswa pou pwograme vizit ou a pou dekouvri pwochen lakay ou.';

const newContent = beforeJson + JSON.stringify(data) + ';\n\n' + restOfFile;
fs.writeFileSync(langPath, newContent);
console.log("Updated lang.js successfully.");

import fs from 'fs';

const langPath = 'public/js/lang.js';
let langContent = fs.readFileSync(langPath, 'utf8');

const splitIndex = langContent.indexOf('// Auto-init on DOMContentLoaded');
const jsonStr = langContent.substring('const translations='.length, splitIndex).replace(/;\s*$/, '');
const restOfFile = langContent.substring(splitIndex);

const translations = JSON.parse(jsonStr);

const duranDesc = `Hermosa y cómoda residencia ubicada en proyecto cerrado, ideal para familias que buscan seguridad, confort y una excelente ubicación en Santo Domingo Este.

✨ Características:
• 3 habitaciones, cada una con su baño
• Medio baño de visita
• Sala amplia
• Comedor
• Cocina
• Área de lavado
• Marquesina para 2 vehículos
• Terraza destechada

💳 Forma de Pago:
• Reserva con US$5,000
• Completa el 10% en 30 días para la firma del contrato
• 20% durante la construcción
• 70% contra entrega mediante financiamiento

📅 Entrega estimada: 10 meses

📍 Ubicada en una zona estratégica, con fácil acceso a supermercados, colegios, plazas comerciales y las principales vías de Santo Domingo Este.

📲 Contáctanos hoy mismo para más información o agendar tu visita y descubre tu próximo hogar.`;

translations['es']['re-duran-title'] = 'Venta de Casa – Residencial María Mercedes';
translations['es']['re-duran-loc'] = 'Autopista de San Isidro, SDE';
translations['es']['re-duran-desc'] = duranDesc;

const newContent = 'const translations=' + JSON.stringify(translations) + ';\n\n' + restOfFile;
fs.writeFileSync(langPath, newContent);
console.log("Successfully updated lang.js");

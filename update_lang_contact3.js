import fs from 'fs';

const langPath = 'public/js/lang.js';
let langContent = fs.readFileSync(langPath, 'utf8');

const prefix = 'const translations=';
const jsonEndIndex = langContent.lastIndexOf('};\n');
const jsonStr = langContent.substring(prefix.length, jsonEndIndex + 1);

let restOfFile = langContent.substring(jsonEndIndex + 2);
const idx = restOfFile.indexOf('document.addEventListener');
if (idx !== -1) {
    restOfFile = '// Auto-init on DOMContentLoaded\n' + restOfFile.substring(idx);
}

const data = JSON.parse(jsonStr);

const updates = {
    'contact-info-title': { es: 'Información de Contacto', en: 'Contact Information', fr: 'Informations de Contact', ht: 'Enfòmasyon pou Kontakte' },
    'contact-help-title': { es: 'Estamos aquí para ayudarte', en: 'We are here to help', fr: 'Nous sommes là pour vous aider', ht: 'Nou la pou ede ou' },
    'contact-phone': { es: 'Teléfono / WhatsApp', en: 'Phone / WhatsApp', fr: 'Téléphone / WhatsApp', ht: 'Telefòn / WhatsApp' },
    'contact-email': { es: 'Email', en: 'Email', fr: 'E-mail', ht: 'Imèl' },
    'contact-location': { es: 'Ubicación', en: 'Location', fr: 'Emplacement', ht: 'Kote' },
    'contact-address': { es: 'Prado Oriental, Santo Domingo Este,<br>República Dominicana', en: 'Prado Oriental, Santo Domingo Este,<br>Dominican Republic', fr: 'Prado Oriental, Santo Domingo Este,<br>République Dominicaine', ht: 'Prado Oriental, Santo Domingo Este,<br>Repiblik Dominikèn' },
    'contact-hours': { es: 'Horario', en: 'Business Hours', fr: "Heures d'ouverture", ht: 'Lè Ouvèti' },
    'contact-hours-desc': { es: 'Lun–Vie: 8:00 AM – 6:00 PM<br>Sáb: 9:00 AM – 1:00 PM', en: 'Mon–Fri: 8:00 AM – 6:00 PM<br>Sat: 9:00 AM – 1:00 PM', fr: 'Lun–Ven: 8:00 AM – 6:00 PM<br>Sam: 9:00 AM – 1:00 PM', ht: 'Lendi–Vandredi: 8:00 AM – 6:00 PM<br>Samdi: 9:00 AM – 1:00 PM' },
    'contact-remote': { es: 'Coordinación Remota', en: 'Remote Coordination', fr: 'Coordination à distance', ht: 'Kowòdinasyon a Distans' },
    'contact-remote-desc': { es: '¿Vives en Nueva York, Miami o cualquier otro estado de EE.UU.? Ofrecemos coordinación 100% digital vía WhatsApp, Zoom y correo electrónico.', en: 'Do you live in New York, Miami, or any other US state? We offer 100% digital coordination via WhatsApp, Zoom, and email.', fr: 'Vivez-vous à New York, Miami ou dans tout autre État américain ? Nous proposons une coordination 100 % numérique via WhatsApp, Zoom et e-mail.', ht: 'Ou ap viv nan New York, Miyami, oswa nenpòt lòt eta nan peyi Etazini? Nou ofri kowòdinasyon 100% dijital atravè WhatsApp, Zoom, ak imèl.' },
    'contact-whatsapp-btn': { es: 'Escribir por WhatsApp', en: 'Message on WhatsApp', fr: 'Écrire sur WhatsApp', ht: 'Ekri sou WhatsApp' }
};

Object.keys(updates).forEach(key => {
    ['es', 'en', 'fr', 'ht'].forEach(lang => {
        data[lang][key] = updates[key][lang];
    });
});

const newContent = prefix + JSON.stringify(data) + ';\n\n' + restOfFile;
fs.writeFileSync(langPath, newContent);
console.log("Updated lang.js successfully.");

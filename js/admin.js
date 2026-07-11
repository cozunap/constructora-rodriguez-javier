/**
 * Panel de Administración - Estilo Decap CMS
 * Integra formulario, previsualización en tiempo real y carga de imágenes WebP a Supabase
 */

let supabase = null;
let uploadedImageUrls = [];
let localFiles = [];
let localObjectUrls = []; // Almacenar URLs temporales de blob del navegador para previews

// --- AUTENTICACIÓN LOCAL ---
const supabasePassword = "KAfvsBFHVxjrM6J1";
const authOverlay = document.getElementById("auth-overlay");
const adminPasswordInput = document.getElementById("admin-password");
const btnLogin = document.getElementById("btn-login");
const authError = document.getElementById("auth-error");

function checkAuth() {
  const isAuthed = sessionStorage.getItem("admin_authenticated");
  if (isAuthed === "true") {
    authOverlay.style.display = "none";
    initSupabase();
  }
}

btnLogin.addEventListener("click", () => {
  const inputPass = adminPasswordInput.value.trim();
  if (inputPass === supabasePassword) {
    sessionStorage.setItem("admin_authenticated", "true");
    authOverlay.style.display = "none";
    initSupabase();
  } else {
    authError.textContent = "Contraseña de Supabase incorrecta.";
    authError.style.display = "block";
  }
});

// --- INICIALIZAR CLIENTE SUPABASE ---
const supabaseUrlInput = document.getElementById("supabase-url");
const supabaseAnonKeyInput = document.getElementById("supabase-anon-key");
const btnSaveConfig = document.getElementById("btn-save-config");

function initSupabase() {
  const storedUrl = supabaseUrlInput.value.trim();
  const storedKey = localStorage.getItem("supabase_anon_key") || supabaseAnonKeyInput.value.trim();
  
  if (storedKey) {
    supabaseAnonKeyInput.value = storedKey;
  }

  if (storedUrl && storedKey) {
    try {
      supabase = supabaseJs.createClient(storedUrl, storedKey);
      console.log("Supabase inicializado correctamente.");
      loadProperties();
    } catch (err) {
      console.error("Error al inicializar Supabase:", err);
      alert("Error al inicializar. Verifica la URL y la Anon Key.");
    }
  }
}

btnSaveConfig.addEventListener("click", () => {
  const url = supabaseUrlInput.value.trim();
  const key = supabaseAnonKeyInput.value.trim();
  
  if (!url || !key) {
    alert("Debes completar la URL y Anon Key.");
    return;
  }

  localStorage.setItem("supabase_url", url);
  localStorage.setItem("supabase_anon_key", key);
  
  alert("Claves guardadas.");
  initSupabase();
});

// --- ENLACE DE PREVISUALIZACIÓN EN TIEMPO REAL (LIVE BINDING) ---
const inputTitle = document.getElementById("title");
const inputDescription = document.getElementById("description");
const inputPrice = document.getElementById("price");
const inputLocation = document.getElementById("location");
const inputM2 = document.getElementById("m2");
const inputStatus = document.getElementById("status");
const inputBedrooms = document.getElementById("bedrooms");
const inputBathrooms = document.getElementById("bathrooms");
const inputParking = document.getElementById("parking");

const previewTitle = document.getElementById("p-preview-title");
const previewDesc = document.getElementById("p-preview-desc");
const previewPrice = document.getElementById("p-preview-price");
const previewLocation = document.getElementById("p-preview-location");
const previewM2 = document.getElementById("p-preview-m2");
const previewTag = document.getElementById("p-preview-tag");
const previewBeds = document.getElementById("p-preview-beds");
const previewBaths = document.getElementById("p-preview-baths");
const previewPark = document.getElementById("p-preview-park");
const previewImg = document.getElementById("p-preview-img");

function updatePreview() {
  previewTitle.textContent = inputTitle.value.trim() || "Título del Proyecto";
  previewDesc.textContent = inputDescription.value.trim() || "Descripción detallada...";
  
  const priceVal = parseFloat(inputPrice.value) || 0;
  previewPrice.textContent = "USD " + priceVal.toLocaleString();
  
  previewLocation.textContent = inputLocation.value.trim() || "Ubicación del proyecto";
  
  const m2Val = parseFloat(inputM2.value) || 0;
  previewM2.textContent = m2Val + " m²";
  
  previewBeds.textContent = parseInt(inputBedrooms.value) || 0;
  previewBaths.textContent = parseFloat(inputBathrooms.value) || 0;
  previewPark.textContent = parseInt(inputParking.value) || 0;
  
  // Tag Estado
  if (inputStatus.value === "en_venta") {
    previewTag.textContent = "En Venta";
    previewTag.className = "property-tag en_venta";
  } else {
    previewTag.textContent = "Preventa / En Desarrollo";
    previewTag.className = "property-tag en_desarrollo";
  }

  // Preview Image
  if (localObjectUrls.length > 0) {
    previewImg.src = localObjectUrls[0];
  } else if (uploadedImageUrls.length > 0) {
    previewImg.src = uploadedImageUrls[0];
  } else {
    previewImg.src = "assets/images/projects/proyecto-1.webp";
  }
}

// Bind live events
const inputs = [inputTitle, inputDescription, inputPrice, inputLocation, inputM2, inputStatus, inputBedrooms, inputBathrooms, inputParking];
inputs.forEach(input => {
  if (input) {
    input.addEventListener("input", updatePreview);
    input.addEventListener("change", updatePreview);
  }
});

// --- GESTIÓN DE SUBIDA E IMÁGENES ---
const imagesUpload = document.getElementById("images-upload");
const previewGrid = document.getElementById("preview-grid");

imagesUpload.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  
  files.forEach(file => {
    localFiles.push(file);
    
    // Crear Object URL para renderizado instantáneo en preview sin subir al servidor
    const objUrl = URL.createObjectURL(file);
    localObjectUrls.push(objUrl);

    const box = document.createElement("div");
    box.className = "preview-thumbnail";
    box.innerHTML = '<img src="' + objUrl + '" alt="Upload preview"><button type="button" class="btn-delete-img">×</button>';
    
    box.querySelector(".btn-delete-img").addEventListener("click", () => {
      const idx = localFiles.indexOf(file);
      if (idx > -1) {
        localFiles.splice(idx, 1);
        localObjectUrls.splice(idx, 1);
      }
      box.remove();
      updatePreview();
    });
    
    previewGrid.appendChild(box);
  });
  
  updatePreview();
});

// --- CONVERSOR IMAGEN A WEBP CLIENT-SIDE ---
function convertToWebp(file) {
  return new Promise((resolve, reject) => {
    if (file.type === "image/webp") {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        let width = img.width;
        let height = img.height;
        const maxDim = 1920;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const webpFile = new File([blob], nameWithoutExt + ".webp", { type: "image/webp" });
            resolve(webpFile);
          } else {
            reject(new Error("WebP conversion failed"));
          }
        }, "image/webp", 0.82);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// --- SUBIR IMÁGENES ---
async function uploadImagesToStorage() {
  const urls = [...uploadedImageUrls];
  
  for (const file of localFiles) {
    let fileToUpload = file;
    try {
      fileToUpload = await convertToWebp(file);
    } catch (err) {
      console.warn("Fallo conversión WebP, subiendo original:", err);
    }

    const fileExt = fileToUpload.name.split('.').pop();
    const fileName = Date.now() + "_" + Math.random().toString(36).substring(7) + "." + fileExt;
    const filePath = fileName;
    
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(filePath, fileToUpload);
      
    if (error) {
      throw new Error("Error al subir imagen: " + error.message);
    }
    
    const { data: urlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);
      
    urls.push(urlData.publicUrl);
  }
  
  return urls;
}

// --- PUBLICAR REGISTRO (FORM SUBMIT) ---
const btnSubmit = document.getElementById("btn-submit");
const btnCancel = document.getElementById("btn-cancel");
const formHeading = document.getElementById("form-heading");
const propertyIdInput = document.getElementById("property-id");
const propertyForm = document.getElementById("property-form");

btnSubmit.addEventListener("click", async () => {
  if (!supabase) {
    alert("Supabase no está conectado.");
    return;
  }

  // Validar formulario manualmente
  if (!propertyForm.checkValidity()) {
    propertyForm.reportValidity();
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = "Subiendo imágenes...";

  try {
    const finalUrls = await uploadImagesToStorage();
    
    if (finalUrls.length === 0) {
      alert("Debes añadir al menos una imagen.");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Publicar en Web";
      return;
    }

    btnSubmit.textContent = "Registrando datos...";

    const payload = {
      title: inputTitle.value.trim(),
      description: inputDescription.value.trim(),
      price: parseFloat(inputPrice.value),
      location: inputLocation.value.trim(),
      m2: parseFloat(inputM2.value),
      status: inputStatus.value,
      bedrooms: parseInt(inputBedrooms.value),
      bathrooms: parseFloat(inputBathrooms.value),
      parking: parseInt(inputParking.value),
      image_urls: finalUrls
    };

    const propId = propertyIdInput.value;
    let error = null;

    if (propId) {
      const { error: err } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', propId);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('properties')
        .insert([payload]);
      error = err;
    }

    if (error) throw error;

    alert(propId ? "Modificación publicada con éxito." : "Proyecto publicado con éxito.");
    resetForm();
    loadProperties();

  } catch (err) {
    alert("Error al guardar: " + err.message);
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Publicar en Web";
  }
});

// --- CARGAR LISTADO DE PROPIEDADES EN COLUMNA ---
const propertiesList = document.getElementById("properties-list");

async function loadProperties() {
  if (!supabase) return;
  
  try {
    propertiesList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Cargando publicaciones...</p>';
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      propertiesList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No hay publicaciones registradas.</p>';
      return;
    }

    propertiesList.innerHTML = '';
    data.forEach(prop => {
      const row = document.createElement("div");
      row.className = "cms-item-row";
      row.setAttribute("data-id", prop.id);
      
      const priceFmt = parseFloat(prop.price).toLocaleString();
      const statusLabel = prop.status === "en_venta" ? "Venta" : "Preventa";

      row.innerHTML = '<span>' + prop.title + ' (' + statusLabel + ')</span><button class="btn-delete-row" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 1.1rem;">🗑️</button>';
      
      row.addEventListener("click", (e) => {
        if (e.target.className !== "btn-delete-row") {
          document.querySelectorAll(".cms-item-row").forEach(r => r.classList.remove("active"));
          row.classList.add("active");
          editProperty(prop);
        }
      });

      row.querySelector(".btn-delete-row").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteProperty(prop.id);
      });

      propertiesList.appendChild(row);
    });

  } catch (err) {
    propertiesList.innerHTML = '<p style="color: #ef4444; font-size: 0.85rem;">Error: ' + err.message + '</p>';
  }
}

// --- EDITAR REGISTRO ---
function editProperty(data) {
  propertyIdInput.value = data.id;
  inputTitle.value = data.title;
  inputDescription.value = data.description;
  inputPrice.value = data.price;
  inputLocation.value = data.location;
  inputM2.value = data.m2;
  inputStatus.value = data.status;
  inputBedrooms.value = data.bedrooms;
  inputBathrooms.value = data.bathrooms;
  inputParking.value = data.parking;

  // Limpiar locales
  localFiles = [];
  localObjectUrls.forEach(url => URL.revokeObjectURL(url));
  localObjectUrls = [];
  
  uploadedImageUrls = data.image_urls || [];
  previewGrid.innerHTML = '';

  uploadedImageUrls.forEach(url => {
    const box = document.createElement("div");
    box.className = "preview-thumbnail";
    box.innerHTML = '<img src="' + url + '" alt="Uploaded image"><button type="button" class="btn-delete-img">×</button>';
    
    box.querySelector(".btn-delete-img").addEventListener("click", () => {
      const idx = uploadedImageUrls.indexOf(url);
      if (idx > -1) uploadedImageUrls.splice(idx, 1);
      box.remove();
      updatePreview();
    });
    
    previewGrid.appendChild(box);
  });

  formHeading.textContent = "Editar Publicación";
  btnCancel.style.display = "block";
  updatePreview();
}

// --- ELIMINAR REGISTRO ---
async function deleteProperty(id) {
  if (!confirm("¿Deseas eliminar permanentemente esta publicación de la web?")) return;
  
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;

    alert("Publicación eliminada.");
    resetForm();
    loadProperties();
  } catch (err) {
    alert("Error al eliminar: " + err.message);
  }
}

btnCancel.addEventListener("click", resetForm);

function resetForm() {
  propertyForm.reset();
  propertyIdInput.value = '';
  uploadedImageUrls = [];
  localFiles = [];
  localObjectUrls.forEach(url => URL.revokeObjectURL(url));
  localObjectUrls = [];
  previewGrid.innerHTML = '';
  formHeading.textContent = "Nuevo Registro";
  btnCancel.style.display = "none";
  document.getElementById("location").value = "Prado Oriental, Santo Domingo Este";
  document.getElementById("parking").value = "2";
  
  document.querySelectorAll(".cms-item-row").forEach(r => r.classList.remove("active"));
  updatePreview();
}

// Cargar configs iniciales
document.addEventListener("DOMContentLoaded", () => {
  const savedUrl = localStorage.getItem("supabase_url");
  if (savedUrl) {
    supabaseUrlInput.value = savedUrl;
  }
  checkAuth();
  updatePreview();
});

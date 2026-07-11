/**
 * Panel de Administración - Bienes Raíces Supabase
 * Maneja autenticación, cargas a Storage y operaciones de Base de Datos
 */

let supabase = null;
let uploadedImageUrls = [];
let localFiles = [];

// --- AUTENTICACIÓN LOCAL DE SEGURIDAD ---
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
    authError.textContent = "Contraseña de Supabase incorrecta. Revisa el texto.";
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
      console.log("Supabase cliente inicializado con éxito.");
      loadProperties();
    } catch (err) {
      console.error("Error al inicializar Supabase:", err);
      alert("Error al inicializar Supabase. Verifica la URL y la Anon Key.");
    }
  } else {
    console.log("Por favor configura tu Supabase Anon Key para conectar.");
  }
}

btnSaveConfig.addEventListener("click", () => {
  const url = supabaseUrlInput.value.trim();
  const key = supabaseAnonKeyInput.value.trim();
  
  if (!url || !key) {
    alert("Debes completar ambos campos: URL y Anon Key.");
    return;
  }

  localStorage.setItem("supabase_url", url);
  localStorage.setItem("supabase_anon_key", key);
  
  alert("Configuración de claves guardada exitosamente.");
  initSupabase();
});

// --- CARGA Y RENDERIZADO DE PROPIEDADES ---
const propertiesList = document.getElementById("properties-list");

async function loadProperties() {
  if (!supabase) return;
  
  try {
    propertiesList.innerHTML = '<p style="color: var(--color-gray);">Cargando propiedades desde base de datos...</p>';
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      propertiesList.innerHTML = '<p style="color: var(--color-gray);">No hay propiedades publicadas en bienes raíces aún.</p>';
      return;
    }

    propertiesList.innerHTML = '';
    data.forEach(prop => {
      const item = document.createElement("div");
      item.className = "property-list-item";
      
      const primaryImg = prop.image_urls && prop.image_urls.length > 0 
        ? prop.image_urls[0] 
        : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80';

      item.innerHTML = `
        <img src="${primaryImg}" alt="${prop.title}">
        <div class="property-list-info">
          <h4 class="property-list-title">${prop.title}</h4>
          <p class="property-list-meta">
            <span class="status-badge ${prop.status}">${prop.status === 'en_venta' ? 'En Venta' : 'En Preventa'}</span>
            | USD ${parseFloat(prop.price).toLocaleString()} | ${prop.m2} m² | ${prop.bedrooms} Hab | ${prop.bathrooms} Baños
          </p>
        </div>
        <div class="property-list-actions">
          <button class="btn-action edit" data-id="${prop.id}">Editar</button>
          <button class="btn-action delete" data-id="${prop.id}">Eliminar</button>
        </div>
      `;
      propertiesList.appendChild(item);
    });

    // Eventos de Editar y Eliminar
    document.querySelectorAll(".property-list-actions .edit").forEach(btn => {
      btn.addEventListener("click", () => editProperty(btn.getAttribute("data-id")));
    });

    document.querySelectorAll(".property-list-actions .delete").forEach(btn => {
      btn.addEventListener("click", () => deleteProperty(btn.getAttribute("data-id")));
    });

  } catch (err) {
    console.error("Error al cargar propiedades:", err);
    propertiesList.innerHTML = `<p style="color: #ef4444;">Error al cargar datos: ${err.message}</p>`;
  }
}

// --- GESTIÓN DE PREVIAS DE IMÁGENES ---
const imagesUpload = document.getElementById("images-upload");
const previewContainer = document.getElementById("preview-container");

imagesUpload.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  
  files.forEach(file => {
    localFiles.push(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const box = document.createElement("div");
      box.className = "preview-box";
      box.innerHTML = `
        <img src="${event.target.result}" alt="Preview">
        <button type="button" class="remove-btn">×</button>
      `;
      
      box.querySelector(".remove-btn").addEventListener("click", () => {
        const index = localFiles.indexOf(file);
        if (index > -1) localFiles.splice(index, 1);
        box.remove();
      });
      
      previewContainer.appendChild(box);
    };
    reader.readAsDataURL(file);
  });
});

// --- SUBIR IMÁGENES A STORAGE ---
async function uploadImagesToStorage() {
  const urls = [...uploadedImageUrls]; // Mantener las URLs que ya tenía (si es edición)
  
  for (const file of localFiles) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);
      
    if (error) {
      console.error("Error al subir archivo a Storage:", error);
      throw new Error(`Error al subir imagen: ${error.message}`);
    }
    
    // Obtener URL pública de la imagen
    const { data: urlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);
      
    urls.push(urlData.publicUrl);
  }
  
  return urls;
}

// --- SUBMIT DEL FORMULARIO (INSERTAR O EDITAR) ---
const propertyForm = document.getElementById("property-form");
const propertyIdInput = document.getElementById("property-id");
const btnSubmit = document.getElementById("btn-submit");
const btnCancel = document.getElementById("btn-cancel");
const formHeading = document.getElementById("form-heading");

propertyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!supabase) {
    alert("Debes configurar la Anon/Public Key de Supabase para poder publicar.");
    return;
  }
  
  btnSubmit.disabled = true;
  btnSubmit.textContent = "Procesando...";
  
  try {
    // 1. Subir archivos locales seleccionados al storage
    const allUrls = await uploadImagesToStorage();
    
    if (allUrls.length === 0) {
      alert("Debes subir al menos una imagen para el proyecto.");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Publicar Propiedad";
      return;
    }

    const payload = {
      title: document.getElementById("title").value.trim(),
      description: document.getElementById("description").value.trim(),
      price: parseFloat(document.getElementById("price").value),
      location: document.getElementById("location").value.trim(),
      m2: parseFloat(document.getElementById("m2").value),
      status: document.getElementById("status").value,
      bedrooms: parseInt(document.getElementById("bedrooms").value),
      bathrooms: parseInt(document.getElementById("bathrooms").value),
      parking: parseInt(document.getElementById("parking").value),
      image_urls: allUrls
    };

    const propId = propertyIdInput.value;
    let error = null;

    if (propId) {
      // Editar registro
      const { error: err } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', propId);
      error = err;
    } else {
      // Insertar nuevo registro
      const { error: err } = await supabase
        .from('properties')
        .insert([payload]);
      error = err;
    }

    if (error) throw error;

    alert(propId ? "Proyecto editado con éxito" : "Proyecto publicado con éxito");
    resetForm();
    loadProperties();

  } catch (err) {
    console.error("Error al procesar propiedad:", err);
    alert(`Error: ${err.message}`);
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Publicar Propiedad";
  }
});

// --- ACCIONES: EDITAR Y ELIMINAR ---
async function editProperty(id) {
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Llenar campos
    propertyIdInput.value = data.id;
    document.getElementById("title").value = data.title;
    document.getElementById("description").value = data.description;
    document.getElementById("price").value = data.price;
    document.getElementById("location").value = data.location;
    document.getElementById("m2").value = data.m2;
    document.getElementById("status").value = data.status;
    document.getElementById("bedrooms").value = data.bedrooms;
    document.getElementById("bathrooms").value = data.bathrooms;
    document.getElementById("parking").value = data.parking;

    // Mostrar previsualización de las imágenes que ya están subidas
    previewContainer.innerHTML = '';
    uploadedImageUrls = data.image_urls || [];
    localFiles = []; // Limpiar locales

    uploadedImageUrls.forEach(url => {
      const box = document.createElement("div");
      box.className = "preview-box";
      box.innerHTML = `
        <img src="${url}" alt="Saved preview">
        <button type="button" class="remove-btn">×</button>
      `;
      box.querySelector(".remove-btn").addEventListener("click", () => {
        const index = uploadedImageUrls.indexOf(url);
        if (index > -1) uploadedImageUrls.splice(index, 1);
        box.remove();
      });
      previewContainer.appendChild(box);
    });

    // UI Feedback
    formHeading.textContent = "Editar Proyecto";
    btnSubmit.textContent = "Guardar Cambios";
    btnCancel.style.display = "block";

    // Subir scroll al formulario
    document.querySelector(".glass-card").scrollIntoView({ behavior: "smooth" });

  } catch (err) {
    alert(`Error al cargar datos del proyecto: ${err.message}`);
  }
}

async function deleteProperty(id) {
  if (!supabase) return;
  
  if (confirm("¿Estás seguro de que deseas eliminar este proyecto de Bienes Raíces permanentemente?")) {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert("Proyecto eliminado con éxito.");
      loadProperties();
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    }
  }
}

btnCancel.addEventListener("click", resetForm);

function resetForm() {
  propertyForm.reset();
  propertyIdInput.value = '';
  uploadedImageUrls = [];
  localFiles = [];
  previewContainer.innerHTML = '';
  formHeading.textContent = "Agregar Nuevo Proyecto";
  btnSubmit.textContent = "Publicar Propiedad";
  btnCancel.style.display = "none";
  document.getElementById("location").value = "Prado Oriental, Santo Domingo Este";
  document.getElementById("parking").value = "2";
}

// Chequear autenticación inicial
document.addEventListener("DOMContentLoaded", () => {
  const savedUrl = localStorage.getItem("supabase_url");
  if (savedUrl) {
    supabaseUrlInput.value = savedUrl;
  }
  checkAuth();
});

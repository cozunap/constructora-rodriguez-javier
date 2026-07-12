import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const SUPA_STORAGE = 'https://kvxcnuckuxoemcfgkhau.supabase.co/storage/v1/object/public/property-images/';

function imgSrc(url) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('/assets')) return url;
  return SUPA_STORAGE + url;
}

const inputCls = 'mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-navy shadow-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition';
const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5';

function SectionTitle({ icon, title }) {
  return (
    <div className="col-span-6 flex items-center gap-3 pt-4 pb-1 border-b border-mid/20">
      <span className="text-gold text-lg">{icon}</span>
      <h4 className="font-serif text-navy font-bold text-base">{title}</h4>
    </div>
  );
}

function CheckboxField({ name, label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none group">
      <input
        type="checkbox"
        name={name}
        checked={!!checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold cursor-pointer"
      />
      <span className="text-sm text-navy group-hover:text-gold transition-colors">{label}</span>
    </label>
  );
}

const EMPTY_PROP = {
  status: 'en_venta',
  title: {},
  location: {},
  description: {},
  image_urls: [],
  property_type: '',
  price: '',
  m2: '',
  solar_m2: '',
  bedrooms: '',
  bathrooms: '',
  half_bathrooms: '',
  parking: '',
  floors: '',
  total_rooms: '',
  year_built: '',
  price_per_m2: '',
  hoa_fee: '',
  furnished: false,
  pool: false,
  gym: false,
  elevator: false,
  security_24h: false,
  balcony: false,
  terrace: false,
  garden: false,
  ac: false,
  google_maps_url: '',
  whatsapp_number: '',
  tags: [],
};

export function PropertiesManager() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProp, setEditingProp] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => { fetchProperties(); }, []);

  async function fetchProperties() {
    setLoading(true);
    const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    if (!error) setProperties(data);
    setLoading(false);
  }

  const openEdit = (prop) => {
    setEditingProp({ ...EMPTY_PROP, ...prop });
    setTagsInput((prop.tags || []).join(', '));
  };

  const openNew = () => {
    setEditingProp({ ...EMPTY_PROP });
    setTagsInput('');
  };

  const handleDelete = async (slug) => {
    if (confirm('¿Estás seguro de eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      await supabase.from('properties').delete().eq('slug', slug);
      fetchProperties();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setEditingProp(prev => ({ ...prev, [name]: checked }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditingProp(prev => ({ ...prev, [parent]: { ...(prev[parent] || {}), [child]: value } }));
    } else {
      setEditingProp(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Parse tags from comma-separated string
    const tagsArr = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      ...editingProp,
      tags: tagsArr,
      price: editingProp.price ? Number(editingProp.price) : null,
      m2: editingProp.m2 ? Number(editingProp.m2) : null,
      solar_m2: editingProp.solar_m2 ? Number(editingProp.solar_m2) : null,
      bedrooms: editingProp.bedrooms ? Number(editingProp.bedrooms) : null,
      bathrooms: editingProp.bathrooms ? Number(editingProp.bathrooms) : null,
      half_bathrooms: editingProp.half_bathrooms ? Number(editingProp.half_bathrooms) : null,
      parking: editingProp.parking ? Number(editingProp.parking) : null,
      floors: editingProp.floors ? Number(editingProp.floors) : null,
      total_rooms: editingProp.total_rooms ? Number(editingProp.total_rooms) : null,
      year_built: editingProp.year_built ? Number(editingProp.year_built) : null,
      price_per_m2: editingProp.price_per_m2 ? Number(editingProp.price_per_m2) : null,
      hoa_fee: editingProp.hoa_fee ? Number(editingProp.hoa_fee) : null,
    };

    const { error } = await supabase.from('properties').upsert([payload], { onConflict: 'slug' });
    if (!error) {
      setEditingProp(null);
      fetchProperties();
    } else {
      alert('Error guardando: ' + error.message);
    }
    setSaving(false);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const filePath = `projects/${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('property-images').upload(filePath, file);
      if (!error) {
        setEditingProp(prev => ({ ...prev, image_urls: [...(prev.image_urls || []), filePath] }));
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setEditingProp(prev => ({ ...prev, image_urls: prev.image_urls.filter((_, i) => i !== index) }));
  };

  const moveImage = (index, dir) => {
    setEditingProp(prev => {
      const arr = [...prev.image_urls];
      const swap = index + dir;
      if (swap < 0 || swap >= arr.length) return prev;
      [arr[index], arr[swap]] = [arr[swap], arr[index]];
      return { ...prev, image_urls: arr };
    });
  };

  // ── Status badge helper
  function statusLabel(s) {
    if (s === 'en_desarrollo') return { text: 'Preventa / Desarrollo', cls: 'bg-amber-100 text-amber-800' };
    if (s === 'vendido') return { text: 'Vendido', cls: 'bg-gray-100 text-gray-600' };
    return { text: 'En Venta', cls: 'bg-emerald-100 text-emerald-800' };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING
  if (loading) return <div className="text-center py-16 text-muted">Cargando propiedades...</div>;

  // ─────────────────────────────────────────────────────────────────────────
  // EDIT / CREATE FORM
  if (editingProp) {
    const isNew = !editingProp.id;
    return (
      <div className="bg-white shadow-sm rounded-xl border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-navy rounded-t-xl">
          <h3 className="text-xl font-serif font-bold text-white">
            {isNew ? '✨ Nueva Propiedad' : '✏️ Editar Propiedad'}
          </h3>
          <button onClick={() => setEditingProp(null)} className="text-white/70 hover:text-white text-sm font-medium transition-colors flex items-center gap-1">
            ← Volver
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-0">
          <div className="grid grid-cols-1 gap-y-4 gap-x-5 sm:grid-cols-6">

            {/* ── IDENTIFICACIÓN ── */}
            <SectionTitle icon="🏷️" title="Identificación" />

            <div className="sm:col-span-3">
              <label className={labelCls}>Slug (ID único) <span className="text-red-400">*</span></label>
              <input type="text" name="slug" value={editingProp.slug || ''} onChange={handleChange}
                placeholder="ej. residencial-duran" required disabled={!isNew}
                className={inputCls + (isNew ? '' : ' bg-gray-50 cursor-not-allowed')} />
              <p className="mt-1 text-xs text-gray-400">Solo letras minúsculas y guiones. No se puede cambiar.</p>
            </div>

            <div className="sm:col-span-3">
              <label className={labelCls}>Estado <span className="text-red-400">*</span></label>
              <select name="status" value={editingProp.status || 'en_venta'} onChange={handleChange} className={inputCls}>
                <option value="en_venta">🟢 En Venta</option>
                <option value="en_desarrollo">🟡 Preventa / En Desarrollo</option>
                <option value="vendido">⚫ Vendido</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className={labelCls}>Título en Español <span className="text-red-400">*</span></label>
              <input type="text" name="title.es" value={editingProp.title?.es || ''} onChange={handleChange}
                placeholder="ej. Residencial Duran" required className={inputCls} />
            </div>

            <div className="sm:col-span-3">
              <label className={labelCls}>Título en Inglés</label>
              <input type="text" name="title.en" value={editingProp.title?.en || ''} onChange={handleChange}
                placeholder="ej. Duran Residential" className={inputCls} />
            </div>

            <div className="sm:col-span-3">
              <label className={labelCls}>Ubicación (Español) <span className="text-red-400">*</span></label>
              <input type="text" name="location.es" value={editingProp.location?.es || ''} onChange={handleChange}
                placeholder="ej. San Isidro, Santo Domingo Este" required className={inputCls} />
            </div>

            <div className="sm:col-span-3">
              <label className={labelCls}>Ubicación (Inglés)</label>
              <input type="text" name="location.en" value={editingProp.location?.en || ''} onChange={handleChange}
                placeholder="ej. San Isidro, Santo Domingo Este" className={inputCls} />
            </div>

            {/* ── TIPO Y PRECIO ── */}
            <SectionTitle icon="💰" title="Tipo y Precio" />

            <div className="sm:col-span-2">
              <label className={labelCls}>Tipo de Propiedad</label>
              <select name="property_type" value={editingProp.property_type || ''} onChange={handleChange} className={inputCls}>
                <option value="">— Seleccionar —</option>
                <option value="Casa">🏠 Casa</option>
                <option value="Apartamento">🏢 Apartamento</option>
                <option value="Villa">🏡 Villa</option>
                <option value="Penthouse">🌇 Penthouse</option>
                <option value="Local Comercial">🏪 Local Comercial</option>
                <option value="Solar">🌿 Solar / Terreno</option>
                <option value="Oficina">💼 Oficina</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Precio (USD)</label>
              <input type="number" name="price" value={editingProp.price || ''} onChange={handleChange}
                placeholder="ej. 175000" className={inputCls} />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Precio por m² (USD)</label>
              <input type="number" name="price_per_m2" value={editingProp.price_per_m2 || ''} onChange={handleChange}
                placeholder="ej. 1500" className={inputCls} />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Cuota de Mantenimiento (HOA, USD/mes)</label>
              <input type="number" name="hoa_fee" value={editingProp.hoa_fee || ''} onChange={handleChange}
                placeholder="ej. 200" className={inputCls} />
            </div>

            {/* ── DIMENSIONES ── */}
            <SectionTitle icon="📐" title="Dimensiones" />

            <div className="sm:col-span-2">
              <label className={labelCls}>Metros² de Construcción</label>
              <input type="number" step="0.01" name="m2" value={editingProp.m2 || ''} onChange={handleChange}
                placeholder="ej. 150" className={inputCls} />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Metros² de Solar</label>
              <input type="number" step="0.01" name="solar_m2" value={editingProp.solar_m2 || ''} onChange={handleChange}
                placeholder="ej. 200" className={inputCls} />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Año de Construcción</label>
              <input type="number" name="year_built" value={editingProp.year_built || ''} onChange={handleChange}
                placeholder="ej. 2024" min="1900" max="2030" className={inputCls} />
            </div>

            {/* ── HABITACIONES ── */}
            <SectionTitle icon="🛏️" title="Habitaciones y Espacios" />

            <div className="sm:col-span-1">
              <label className={labelCls}>Habitaciones</label>
              <input type="number" step="0.5" name="bedrooms" value={editingProp.bedrooms || ''} onChange={handleChange}
                placeholder="3" className={inputCls} />
            </div>

            <div className="sm:col-span-1">
              <label className={labelCls}>Baños Completos</label>
              <input type="number" step="0.5" name="bathrooms" value={editingProp.bathrooms || ''} onChange={handleChange}
                placeholder="2" className={inputCls} />
            </div>

            <div className="sm:col-span-1">
              <label className={labelCls}>Medios Baños</label>
              <input type="number" step="1" name="half_bathrooms" value={editingProp.half_bathrooms || ''} onChange={handleChange}
                placeholder="1" className={inputCls} />
            </div>

            <div className="sm:col-span-1">
              <label className={labelCls}>Parqueos</label>
              <input type="number" name="parking" value={editingProp.parking || ''} onChange={handleChange}
                placeholder="2" className={inputCls} />
            </div>

            <div className="sm:col-span-1">
              <label className={labelCls}>Pisos / Niveles</label>
              <input type="number" name="floors" value={editingProp.floors || ''} onChange={handleChange}
                placeholder="1" className={inputCls} />
            </div>

            <div className="sm:col-span-1">
              <label className={labelCls}>Total de Habitaciones</label>
              <input type="number" name="total_rooms" value={editingProp.total_rooms || ''} onChange={handleChange}
                placeholder="6" className={inputCls} />
            </div>

            {/* ── AMENIDADES ── */}
            <SectionTitle icon="✨" title="Amenidades y Características" />

            <div className="sm:col-span-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <CheckboxField name="pool" label="🏊 Piscina" checked={editingProp.pool} onChange={handleChange} />
                <CheckboxField name="gym" label="💪 Gimnasio" checked={editingProp.gym} onChange={handleChange} />
                <CheckboxField name="elevator" label="🛗 Elevador" checked={editingProp.elevator} onChange={handleChange} />
                <CheckboxField name="security_24h" label="🔒 Seguridad 24h" checked={editingProp.security_24h} onChange={handleChange} />
                <CheckboxField name="balcony" label="🌿 Balcón" checked={editingProp.balcony} onChange={handleChange} />
                <CheckboxField name="terrace" label="🌅 Terraza" checked={editingProp.terrace} onChange={handleChange} />
                <CheckboxField name="garden" label="🌳 Jardín" checked={editingProp.garden} onChange={handleChange} />
                <CheckboxField name="ac" label="❄️ Aire Acondicionado" checked={editingProp.ac} onChange={handleChange} />
                <CheckboxField name="furnished" label="🛋️ Amueblado" checked={editingProp.furnished} onChange={handleChange} />
              </div>
            </div>

            {/* ── ETIQUETAS ── */}
            <div className="sm:col-span-6">
              <label className={labelCls}>Etiquetas (tags) — separadas por coma</label>
              <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                placeholder="ej. Piscina privada, Vista al mar, Terraza, Gated community"
                className={inputCls} />
              {tagsInput && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tagsInput.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                    <span key={i} className="bg-gold/10 text-gold border border-gold/20 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* ── CONTACTO Y MAPA ── */}
            <SectionTitle icon="📍" title="Contacto y Ubicación" />

            <div className="sm:col-span-3">
              <label className={labelCls}>Enlace Google Maps</label>
              <input type="url" name="google_maps_url" value={editingProp.google_maps_url || ''} onChange={handleChange}
                placeholder="https://maps.app.goo.gl/..." className={inputCls} />
            </div>

            <div className="sm:col-span-3">
              <label className={labelCls}>WhatsApp de contacto</label>
              <input type="text" name="whatsapp_number" value={editingProp.whatsapp_number || ''} onChange={handleChange}
                placeholder="ej. +18097001234" className={inputCls} />
            </div>

            {/* ── DESCRIPCIÓN ── */}
            <SectionTitle icon="📝" title="Descripción Detallada" />

            <div className="sm:col-span-6">
              <label className={labelCls}>Descripción en Español</label>
              <textarea name="description.es" rows={7} value={editingProp.description?.es || ''} onChange={handleChange}
                placeholder={'Describe la propiedad en detalle...\n\n✨ Características:\n• 3 habitaciones\n• Sala amplia\n\n💳 Forma de Pago:\n• Reserva con $5,000'}
                className={inputCls + ' resize-y'} />
              <p className="mt-1 text-xs text-gray-400">Usa • para listas, ✨ 💳 📅 📍 📲 para secciones destacadas.</p>
            </div>

            <div className="sm:col-span-6">
              <label className={labelCls}>Descripción en Inglés</label>
              <textarea name="description.en" rows={7} value={editingProp.description?.en || ''} onChange={handleChange}
                placeholder="Describe the property in detail..." className={inputCls + ' resize-y'} />
            </div>

            {/* ── IMÁGENES ── */}
            <SectionTitle icon="🖼️" title="Imágenes (la primera es la portada)" />

            <div className="sm:col-span-6">
              <div className="flex flex-wrap gap-3 mb-3">
                {(editingProp.image_urls || []).map((url, i) => (
                  <div key={i} className={`relative group w-28 h-20 rounded-lg overflow-hidden border-2 shadow-sm flex-shrink-0 ${i === 0 ? 'border-gold' : 'border-gray-200'}`}>
                    <img src={imgSrc(url)} alt="preview" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-center text-white text-[9px] font-bold bg-gold/80 py-0.5">PORTADA</span>}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}
                        className="text-white text-xs bg-black/50 rounded px-1.5 py-0.5 disabled:opacity-30">◀</button>
                      <button type="button" onClick={() => removeImage(i)}
                        className="text-white text-xs bg-red-500/80 rounded px-1.5 py-0.5">✕</button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === editingProp.image_urls.length - 1}
                        className="text-white text-xs bg-black/50 rounded px-1.5 py-0.5 disabled:opacity-30">▶</button>
                    </div>
                  </div>
                ))}
                <label className={`w-28 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${uploading ? 'border-gold bg-gold/5' : 'border-gray-300 hover:border-gold hover:bg-gold/5'}`}>
                  {uploading ? (
                    <><span className="text-gold text-xl animate-spin">⏳</span><span className="text-xs text-gold mt-1">Subiendo...</span></>
                  ) : (
                    <><span className="text-2xl text-gray-300">+</span><span className="text-xs text-gray-400 mt-1">Agregar</span></>
                  )}
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              <p className="text-xs text-gray-400">Puedes subir múltiples imágenes. Usa ◀▶ para reordenar. La primera imagen es la portada.</p>
            </div>

          </div>

          {/* FOOTER BUTTONS */}
          <div className="pt-6 mt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
            <button type="button" onClick={() => setEditingProp(null)}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-gold text-white text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-60 flex items-center gap-2 shadow-sm">
              {saving ? '⏳ Guardando...' : (isNew ? '✅ Publicar Propiedad' : '💾 Guardar Cambios')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PROPERTIES LIST
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
      <div className="bg-navy px-6 py-4 flex justify-between items-center rounded-t-xl">
        <div>
          <h3 className="text-lg font-serif font-bold text-white">Gestor de Propiedades</h3>
          <p className="text-white/60 text-xs mt-0.5">{properties.length} propiedad{properties.length !== 1 ? 'es' : ''} registrada{properties.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors shadow-sm">
          + Nueva Propiedad
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-navy font-serif text-lg mb-1">No hay propiedades registradas</p>
          <p className="text-gray-400 text-sm">Haz clic en "Nueva Propiedad" para comenzar.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {properties.map((prop) => {
            const badge = statusLabel(prop.status);
            const thumb = prop.image_urls?.[0];
            return (
              <li key={prop.slug} className="hover:bg-gray-50 transition-colors">
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-20 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                      {thumb && <img src={imgSrc(thumb)} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif font-bold text-navy text-base truncate">{prop.title?.es || prop.slug}</p>
                      <p className="text-gray-400 text-xs truncate">{prop.location?.es}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {prop.property_type && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{prop.property_type}</span>}
                        {prop.price && <span className="text-xs text-gold font-semibold">USD {Number(prop.price).toLocaleString()}</span>}
                        {prop.m2 && <span className="text-xs text-gray-400">{prop.m2} m²</span>}
                        {prop.bedrooms && <span className="text-xs text-gray-400">🛏️ {prop.bedrooms}</span>}
                        {prop.bathrooms && <span className="text-xs text-gray-400">🚿 {prop.bathrooms}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${badge.cls}`}>{badge.text}</span>
                    <button onClick={() => openEdit(prop)}
                      className="text-gold hover:text-navy transition-colors text-sm font-semibold px-3 py-1.5 rounded-md hover:bg-gold/10">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(prop.slug)}
                      className="text-red-400 hover:text-red-600 transition-colors text-sm font-semibold px-3 py-1.5 rounded-md hover:bg-red-50">
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function PropertiesManager() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProp, setEditingProp] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    setLoading(true);
    const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    if (!error) setProperties(data);
    setLoading(false);
  }

  const handleDelete = async (slug) => {
    if (confirm('¿Estás seguro de eliminar esta propiedad?')) {
      await supabase.from('properties').delete().eq('slug', slug);
      fetchProperties();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('properties').upsert([editingProp], { onConflict: 'slug' });
    if (!error) {
      setEditingProp(null);
      fetchProperties();
    } else {
      alert('Error guardando: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For nested JSON (title.es, etc.)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditingProp(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditingProp(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `projects/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('property-images').upload(filePath, file);

    if (uploadError) {
      alert('Error subiendo imagen: ' + uploadError.message);
      return;
    }

    setEditingProp(prev => ({
      ...prev,
      image_urls: [...(prev.image_urls || []), filePath]
    }));
  };

  const removeImage = (index) => {
    setEditingProp(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div className="text-center py-10 text-muted">Cargando propiedades...</div>;
  }

  if (editingProp) {
    return (
      <div className="bg-white shadow sm:rounded-lg border border-mid/20">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6 border-b border-mid/20 pb-4">
            <h3 className="text-xl leading-6 font-serif font-bold text-navy">
              {editingProp.id ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </h3>
            <button onClick={() => setEditingProp(null)} className="text-muted hover:text-navy text-sm font-medium transition-colors">Volver</button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-navy">Slug (ID único, Ej. "residencial-duran")</label>
                <input type="text" name="slug" value={editingProp.slug || ''} onChange={handleChange} required disabled={!!editingProp.id}
                  className="mt-1 focus:ring-gold focus:border-gold block w-full shadow-sm sm:text-sm border-mid/30 rounded-md py-2 px-3 border" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-navy">Estado</label>
                <select name="status" value={editingProp.status || ''} onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-mid/30 bg-white rounded-md shadow-sm focus:outline-none focus:ring-gold focus:border-gold sm:text-sm">
                  <option value="en_venta">En Venta</option>
                  <option value="en_desarrollo">En Desarrollo (Preventa)</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-navy">Título (Español)</label>
                <input type="text" name="title.es" value={editingProp.title?.es || ''} onChange={handleChange} required
                  className="mt-1 focus:ring-gold focus:border-gold block w-full shadow-sm sm:text-sm border-mid/30 rounded-md py-2 px-3 border" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-navy">Título (Inglés)</label>
                <input type="text" name="title.en" value={editingProp.title?.en || ''} onChange={handleChange}
                  className="mt-1 focus:ring-gold focus:border-gold block w-full shadow-sm sm:text-sm border-mid/30 rounded-md py-2 px-3 border" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-navy">Ubicación (Español)</label>
                <input type="text" name="location.es" value={editingProp.location?.es || ''} onChange={handleChange} required
                  className="mt-1 focus:ring-gold focus:border-gold block w-full shadow-sm sm:text-sm border-mid/30 rounded-md py-2 px-3 border" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-navy">Ubicación (Inglés)</label>
                <input type="text" name="location.en" value={editingProp.location?.en || ''} onChange={handleChange}
                  className="mt-1 focus:ring-gold focus:border-gold block w-full shadow-sm sm:text-sm border-mid/30 rounded-md py-2 px-3 border" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-navy">Precio (USD)</label>
                <input type="number" name="price" value={editingProp.price || ''} onChange={handleChange}
                  className="mt-1 focus:ring-gold focus:border-gold block w-full shadow-sm sm:text-sm border-mid/30 rounded-md py-2 px-3 border" />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-navy">M2</label>
                <input type="number" step="0.01" name="m2" value={editingProp.m2 || ''} onChange={handleChange}
                  className="mt-1 focus:ring-gold focus:border-gold block w-full shadow-sm sm:text-sm border-mid/30 rounded-md py-2 px-3 border" />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-navy">Habitaciones</label>
                <input type="number" step="0.5" name="bedrooms" value={editingProp.bedrooms || ''} onChange={handleChange}
                  className="mt-1 focus:ring-gold focus:border-gold block w-full shadow-sm sm:text-sm border-mid/30 rounded-md py-2 px-3 border" />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-navy">Baños</label>
                <input type="number" step="0.5" name="bathrooms" value={editingProp.bathrooms || ''} onChange={handleChange}
                  className="mt-1 focus:ring-gold focus:border-gold block w-full shadow-sm sm:text-sm border-mid/30 rounded-md py-2 px-3 border" />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-navy">Parqueos</label>
                <input type="number" name="parking" value={editingProp.parking || ''} onChange={handleChange}
                  className="mt-1 focus:ring-gold focus:border-gold block w-full shadow-sm sm:text-sm border-mid/30 rounded-md py-2 px-3 border" />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-navy">Descripción (Español)</label>
                <textarea name="description.es" rows={5} value={editingProp.description?.es || ''} onChange={handleChange}
                  className="mt-1 focus:ring-gold focus:border-gold block w-full shadow-sm sm:text-sm border-mid/30 rounded-md py-2 px-3 border" />
                <p className="mt-2 text-sm text-gray-500">Usa • para listas y emojis para destacar secciones.</p>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-navy">Descripción (Inglés)</label>
                <textarea name="description.en" rows={5} value={editingProp.description?.en || ''} onChange={handleChange}
                  className="mt-1 focus:ring-gold focus:border-gold block w-full shadow-sm sm:text-sm border-mid/30 rounded-md py-2 px-3 border" />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-navy">Imágenes</label>
                <div className="mt-2 flex items-center gap-4 flex-wrap">
                  {editingProp.image_urls?.map((url, i) => (
                    <div key={i} className="relative group w-24 h-24 rounded-md overflow-hidden border border-mid/30 shadow-sm">
                      <img src={url.startsWith('http') || url.startsWith('/assets') ? url : `https://kvxcnuckuxoemcfgkhau.supabase.co/storage/v1/object/public/property-images/${url}`} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">&times;</button>
                    </div>
                  ))}
                  <div className="w-24 h-24 border-2 border-dashed border-mid/40 rounded-md flex items-center justify-center hover:border-gold transition-colors relative cursor-pointer">
                    <span className="text-2xl text-mid">+</span>
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-mid/20 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingProp(null)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
                Cancelar
              </button>
              <button type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md border border-mid/20">
      <div className="bg-white px-4 py-5 border-b border-mid/20 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-navy">Gestor de Inmuebles</h3>
        <button onClick={() => setEditingProp({ status: 'en_venta', title: {}, location: {}, description: {}, image_urls: [] })} 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
          Nueva Propiedad
        </button>
      </div>
      <ul className="divide-y divide-mid/10">
        {properties.map((prop) => (
          <li key={prop.slug}>
            <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                  {prop.image_urls && prop.image_urls[0] && (
                    <img src={prop.image_urls[0].startsWith('http') || prop.image_urls[0].startsWith('/assets') ? prop.image_urls[0] : `https://kvxcnuckuxoemcfgkhau.supabase.co/storage/v1/object/public/property-images/${prop.image_urls[0]}`} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-navy truncate font-serif text-lg">{prop.title?.es || prop.slug}</p>
                  <p className="text-sm text-gray-500 truncate">{prop.location?.es}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${prop.status === 'en_desarrollo' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {prop.status}
                </span>
                <button onClick={() => setEditingProp(prop)} className="text-gold hover:text-navy transition-colors text-sm font-medium">Editar</button>
                <button onClick={() => handleDelete(prop.slug)} className="text-red-500 hover:text-red-700 transition-colors text-sm font-medium">Borrar</button>
              </div>
            </div>
          </li>
        ))}
        {properties.length === 0 && (
          <li className="px-4 py-8 text-center text-gray-500 text-sm">No hay propiedades. Crea la primera.</li>
        )}
      </ul>
    </div>
  );
}

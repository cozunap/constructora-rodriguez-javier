import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PropertiesManager } from './PropertiesManager';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Check if user is signing up or logging in. We'll try login first.
    let { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If invalid login credentials, maybe they need to sign up? (for this demo)
    if (error && error.message === 'Invalid login credentials') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setError('Por favor verifica tu email para confirmar tu cuenta.');
      }
    } else if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/admin',
    });
    
    if (error) {
      setError(error.message);
    } else {
      setError('Te hemos enviado un correo con un enlace para restaurar tu contraseña.');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      alert(error.message);
    } else {
      alert('Contraseña actualizada correctamente.');
      setIsChangingPassword(false);
      setNewPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="min-h-screen bg-off-white flex items-center justify-center font-inter"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div></div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-navy flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-serif font-extrabold text-white">
            Constructora Rodríguez Javier
          </h2>
          <p className="mt-2 text-center text-sm text-gold tracking-widest uppercase">Admin CMS</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-mid/20">
            {isResetting ? (
              <form className="space-y-6" onSubmit={handleResetPassword}>
                {error && <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm">{error}</div>}
                <div>
                  <label className="block text-sm font-medium text-navy">Email</label>
                  <div className="mt-1">
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-mid/30 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
                  </div>
                </div>
                <div>
                  <button type="submit" disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-colors">
                    {loading ? 'Cargando...' : 'Restaurar Contraseña'}
                  </button>
                </div>
                <div className="text-center">
                  <button type="button" onClick={() => { setIsResetting(false); setError(''); }} className="text-sm font-medium text-gold hover:text-navy transition-colors">
                    Volver a iniciar sesión
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleLogin}>
                {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{error}</div>}
                <div>
                  <label className="block text-sm font-medium text-navy">Email</label>
                  <div className="mt-1">
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-mid/30 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy">Contraseña</label>
                  <div className="mt-1">
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-mid/30 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <button type="button" onClick={() => { setIsResetting(true); setError(''); }} className="font-medium text-gold hover:text-navy transition-colors">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </div>
                <div>
                  <button type="submit" disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-colors">
                    {loading ? 'Cargando...' : 'Entrar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white font-inter text-navy">
      <nav className="bg-navy border-b border-mid/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-serif text-xl text-white">CRJ Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">{session.user.email}</span>
              <button onClick={() => setIsChangingPassword(true)} className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Cambiar Contraseña
              </button>
              <button onClick={handleLogout} className="text-sm font-medium text-gold hover:text-white transition-colors ml-4">
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isChangingPassword && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-serif font-bold text-navy mb-4">Actualizar Contraseña</h3>
            <form onSubmit={handleUpdatePassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-navy mb-1">Nueva Contraseña</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-mid/30 rounded-md shadow-sm focus:outline-none focus:ring-gold focus:border-gold" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsChangingPassword(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-navy">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-gold text-white rounded-md text-sm hover:bg-gold/90">{loading ? '...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-serif font-bold text-navy">Propiedades</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
            <PropertiesManager />
          </div>
        </main>
      </div>
    </div>
  );
}

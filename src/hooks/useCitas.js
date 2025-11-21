import { useEffect, useState } from 'react';
import * as citaService from '../services/citaService';

export const useCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const listarCitas = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await citaService.listarCitas(params);
      setCitas(data || []);
      return data;
    } catch (err) {
      setError('Error al listar citas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const crearCita = async (citaData) => {
    const nueva = await citaService.crearCita(citaData);
    setCitas(prev => [...prev, nueva]);
    return nueva;
  };

  const crearMultiplesCitas = async (citasData) => {
    const result = await citaService.crearMultiplesCitas(citasData);
    // El backend devuelve { message, total, citas: [] }
    const nuevas = Array.isArray(result) ? result : (result?.citas || []);
    setCitas(prev => [...prev, ...nuevas]);
    return nuevas;
  };

  const actualizarCita = async (id, citaData) => {
    const actualizada = await citaService.actualizarCita(id, citaData);
    setCitas(prev => prev.map(c => c.id === id ? actualizada : c));
    return actualizada;
  };

  const eliminarCita = async (id, userId) => {
    const resultado = await citaService.eliminarCita(id, userId);
    setCitas(prev => prev.filter(c => c.id !== id));
    return resultado;
  };

  return { citas, loading, error, listarCitas, crearCita, crearMultiplesCitas, actualizarCita, eliminarCita };
};

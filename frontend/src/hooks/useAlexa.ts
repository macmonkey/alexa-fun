import { useState, useEffect, useCallback } from 'react';

interface Device {
  serialNumber: string;
  accountName: string;
  online: boolean;
  dnd?: boolean;
}

interface Preset {
  id: string;
  label: string;
  text: string;
  icon: string;
  color: string;
}

interface Sound {
  id: string;
  name: string;
  category: string;
  soundId: string;
}

const API_BASE = '/api';

export function useAlexa() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [volume, setVolume] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [devicesRes, presetsRes, soundsRes, statusRes] = await Promise.all([
          fetch(`${API_BASE}/devices`),
          fetch(`${API_BASE}/presets`),
          fetch(`${API_BASE}/sounds`),
          fetch(`${API_BASE}/status`),
        ]);

        const devicesData = await devicesRes.json();
        const presetsData = await presetsRes.json();
        const soundsData = await soundsRes.json();
        const statusData = await statusRes.json();

        setDevices(devicesData);
        setPresets(presetsData);
        setSounds(soundsData);
        setConnected(statusData.initialized);

        // Erstes Online-Gerät vorauswählen
        const onlineDevices = devicesData.filter((d: Device) => d.online);
        if (onlineDevices.length > 0) {
          setSelectedDevices([onlineDevices[0].serialNumber]);
        }
      } catch (e) {
        setError('Backend nicht erreichbar. Läuft der Server?');
      }
    }

    loadData();
  }, []);

  const speak = useCallback(async (text: string, deviceSerial?: string) => {
    setLoading(true);
    setError(null);

    try {
      const device = deviceSerial || selectedDevices[0];
      if (!device) {
        throw new Error('Kein Gerät ausgewählt');
      }

      const res = await fetch(`${API_BASE}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceSerial: device, text }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Sprechen');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [selectedDevices]);

  const announce = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);

    try {
      // Bei mehreren Geräten: Ankündigung auf allen ausgewählten
      const res = await fetch(`${API_BASE}/announce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceSerials: selectedDevices,
          text,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler bei Ankündigung');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [selectedDevices]);

  const whisper = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);

    try {
      const device = selectedDevices[0];
      if (!device) {
        throw new Error('Kein Gerät verfügbar');
      }

      const res = await fetch(`${API_BASE}/whisper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceSerial: device, text }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Flüstern');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [selectedDevices]);

  const playSound = useCallback(async (soundId: string) => {
    setLoading(true);
    setError(null);

    try {
      const device = selectedDevices[0];
      if (!device) {
        throw new Error('Kein Gerät verfügbar');
      }

      const res = await fetch(`${API_BASE}/sound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceSerial: device, soundId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Sound');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [selectedDevices]);

  const setDeviceVolume = useCallback(async (newVolume: number) => {
    if (selectedDevices.length !== 1) return;

    setVolume(newVolume);

    try {
      await fetch(`${API_BASE}/volume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceSerial: selectedDevices[0], volume: newVolume }),
      });
    } catch (e) {
      console.error('Fehler beim Setzen der Lautstärke:', e);
    }
  }, [selectedDevices]);

  const generateContent = useCallback(async (type: 'joke' | 'funfact' | 'story' | 'riddle' | 'motivation' | 'tongue_twister' | 'quiz'): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Generieren');
      }

      const data = await res.json();
      return data.content;
    } catch (e) {
      setError((e as Error).message);
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    devices,
    presets,
    sounds,
    selectedDevices,
    setSelectedDevices,
    volume,
    setVolume: setDeviceVolume,
    loading,
    error,
    connected,
    speak,
    announce,
    whisper,
    playSound,
    generateContent,
  };
}

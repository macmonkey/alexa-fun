import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
} from '@mui/material';
import SpeakerIcon from '@mui/icons-material/Speaker';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SchoolIcon from '@mui/icons-material/School';

import { useAlexa } from './hooks/useAlexa';
import { DeviceSelector } from './components/DeviceSelector';
import { QuickActions } from './components/QuickActions';
import { TTSInput } from './components/TTSInput';
import { FunGenerator } from './components/FunGenerator';
import { SoundBoard } from './components/SoundBoard';
import { HomeworkTab } from './components/HomeworkTab';

function App() {
  const {
    devices,
    presets,
    sounds,
    selectedDevices,
    setSelectedDevices,
    volume,
    setVolume,
    loading,
    error,
    connected,
    speak,
    announce,
    whisper,
    playSound,
    generateContent,
  } = useAlexa();

  const [tab, setTab] = useState(0);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 3,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Alexa Fun
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Finn & Leo Edition
          </Typography>

          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Chip
              icon={<SpeakerIcon />}
              label={connected ? `${devices.length} Echo(s)` : 'Nicht verbunden'}
              color={connected ? 'success' : 'error'}
              size="small"
            />
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Geräte-Auswahl */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <DeviceSelector
            devices={devices}
            selectedDevices={selectedDevices}
            onSelect={setSelectedDevices}
            volume={volume}
            onVolumeChange={setVolume}
          />
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 1.5,
                minHeight: 'auto',
              },
            }}
          >
            <Tab icon={<SpeakerIcon />} label="Nachrichten" iconPosition="start" />
            <Tab icon={<EmojiEmotionsIcon />} label="Fun" iconPosition="start" />
            <Tab icon={<MusicNoteIcon />} label="Sounds" iconPosition="start" />
            <Tab icon={<SchoolIcon />} label="Hausaufgaben" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Paper sx={{ p: 3 }}>
          {tab === 0 && (
            <Box>
              <QuickActions
                presets={presets}
                onAction={announce}
                loading={loading}
              />
              <Box sx={{ mt: 4 }}>
                <TTSInput
                  onSpeak={speak}
                  onAnnounce={announce}
                  onWhisper={whisper}
                  loading={loading}
                />
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <FunGenerator
              onGenerate={generateContent}
              onSpeak={announce}
              loading={loading}
            />
          )}

          {tab === 2 && (
            <SoundBoard
              sounds={sounds}
              onPlay={playSound}
              loading={loading}
            />
          )}

          {tab === 3 && (
            <HomeworkTab
              onAnnounce={announce}
              loading={loading}
            />
          )}
        </Paper>

        {/* Footer */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 3,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Made with love for Finn & Leo
        </Typography>
      </Container>
    </Box>
  );
}

export default App;

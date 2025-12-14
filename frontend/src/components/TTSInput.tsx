import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import CampaignIcon from '@mui/icons-material/Campaign';

type Mode = 'speak' | 'announce' | 'whisper';

interface Props {
  onSpeak: (text: string) => void;
  onAnnounce: (text: string) => void;
  onWhisper: (text: string) => void;
  loading: boolean;
}

const MAX_HISTORY = 5;

export function TTSInput({ onSpeak, onAnnounce, onWhisper, loading }: Props) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<Mode>('announce');
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('tts-history');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSend = () => {
    if (!text.trim()) return;

    const newHistory = [text, ...history.filter(h => h !== text)].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    localStorage.setItem('tts-history', JSON.stringify(newHistory));

    switch (mode) {
      case 'speak':
        onSpeak(text);
        break;
      case 'announce':
        onAnnounce(text);
        break;
      case 'whisper':
        onWhisper(text);
        break;
    }

    setText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Nachricht senden
      </Typography>

      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, v) => v && setMode(v)}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="announce">
          <CampaignIcon sx={{ mr: 0.5 }} /> Ankündigung
        </ToggleButton>
        <ToggleButton value="speak">
          <RecordVoiceOverIcon sx={{ mr: 0.5 }} /> Sprechen
        </ToggleButton>
        <ToggleButton value="whisper">
          Flüstern
        </ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Nachricht eingeben... (Strg+Enter zum Senden)"
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.1rem',
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !text.trim()}
          sx={{ minWidth: 56, height: 56 }}
        >
          <SendIcon />
        </Button>
      </Box>

      {history.length > 0 && (
        <Paper variant="outlined" sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary' }}>
            Letzte Nachrichten
          </Typography>
          <List dense>
            {history.map((msg, i) => (
              <ListItem key={i} disablePadding>
                <ListItemButton onClick={() => setText(msg)}>
                  <ListItemText
                    primary={msg}
                    primaryTypographyProps={{
                      noWrap: true,
                      fontSize: '0.875rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

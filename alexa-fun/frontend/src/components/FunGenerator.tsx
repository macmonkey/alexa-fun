import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import QuizIcon from '@mui/icons-material/Quiz';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';

type ContentType = 'joke' | 'funfact' | 'story' | 'riddle' | 'motivation' | 'tongue_twister' | 'quiz';

interface Props {
  onGenerate: (type: ContentType) => Promise<string>;
  onSpeak: (text: string) => void;
  loading: boolean;
}

const categories = [
  { type: 'joke' as const, label: 'Witz', icon: <EmojiEmotionsIcon />, color: '#fbbf24' },
  { type: 'funfact' as const, label: 'Fun Fact', icon: <LightbulbIcon />, color: '#34d399' },
  { type: 'story' as const, label: 'Geschichte', icon: <AutoStoriesIcon />, color: '#60a5fa' },
  { type: 'riddle' as const, label: 'Rätsel', icon: <PsychologyIcon />, color: '#a78bfa' },
  { type: 'motivation' as const, label: 'Motivation', icon: <EmojiEventsIcon />, color: '#f472b6' },
  { type: 'tongue_twister' as const, label: 'Zungenbrecher', icon: <RecordVoiceOverIcon />, color: '#fb923c' },
  { type: 'quiz' as const, label: 'Quiz', icon: <QuizIcon />, color: '#2dd4bf' },
];

const MAX_HISTORY = 10;

export function FunGenerator({ onGenerate, onSpeak, loading }: Props) {
  const [content, setContent] = useState<string>('');
  const [activeType, setActiveType] = useState<ContentType | null>(null);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<{ type: ContentType; content: string }[]>(() => {
    const saved = localStorage.getItem('fun-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  const handleGenerate = async (type: ContentType) => {
    setActiveType(type);
    setGenerating(true);
    const result = await onGenerate(type);
    setContent(result);
    setGenerating(false);

    if (result) {
      const newHistory = [{ type, content: result }, ...history.filter(h => h.content !== result)].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      localStorage.setItem('fun-history', JSON.stringify(newHistory));
    }
  };

  const handlePlay = () => {
    if (content) {
      onSpeak(content);
    }
  };

  const handleHistorySelect = (item: { type: ContentType; content: string }) => {
    setActiveType(item.type);
    setContent(item.content);
    setShowHistory(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Fun Generator</Typography>
        <Button
          size="small"
          startIcon={<HistoryIcon />}
          onClick={() => setShowHistory(!showHistory)}
          color={showHistory ? 'primary' : 'inherit'}
        >
          Historie ({history.length})
        </Button>
      </Box>

      {showHistory && history.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
          <List dense>
            {history.map((item, i) => (
              <ListItem key={i} disablePadding>
                <ListItemButton onClick={() => handleHistorySelect(item)}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: categories.find(c => c.type === item.type)?.color,
                      mr: 1,
                    }}
                  />
                  <ListItemText
                    primary={item.content}
                    primaryTypographyProps={{ noWrap: true, fontSize: '0.85rem' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Grid container spacing={1} sx={{ mb: 2 }}>
        {categories.map((cat) => (
          <Grid item xs={6} sm={4} md={3} key={cat.type}>
            <Button
              fullWidth
              variant={activeType === cat.type ? 'contained' : 'outlined'}
              onClick={() => handleGenerate(cat.type)}
              disabled={generating}
              startIcon={cat.icon}
              size="small"
              sx={{
                py: 1,
                borderColor: cat.color,
                color: activeType === cat.type ? 'white' : cat.color,
                bgcolor: activeType === cat.type ? cat.color : 'transparent',
                '&:hover': {
                  borderColor: cat.color,
                  bgcolor: activeType === cat.type ? cat.color : `${cat.color}20`,
                },
              }}
            >
              {cat.label}
            </Button>
          </Grid>
        ))}
      </Grid>

      {(content || generating) && (
        <Card
          sx={{
            bgcolor: activeType ? `${categories.find(c => c.type === activeType)?.color}10` : 'grey.50',
            border: '2px solid',
            borderColor: activeType ? categories.find(c => c.type === activeType)?.color : 'grey.300',
          }}
        >
          <CardContent>
            {generating ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap', fontSize: '1.1rem' }}>
                  {content}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={handlePlay}
                    disabled={loading}
                  >
                    Abspielen
                  </Button>
                  <IconButton
                    onClick={() => activeType && handleGenerate(activeType)}
                    disabled={generating}
                    color="primary"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

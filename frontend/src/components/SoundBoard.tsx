import { Box, Button, Typography, Grid, Chip } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CelebrationIcon from '@mui/icons-material/Celebration';
import PetsIcon from '@mui/icons-material/Pets';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

interface Sound {
  id: string;
  name: string;
  category: string;
  soundId: string;
}

interface Props {
  sounds: Sound[];
  onPlay: (soundId: string) => void;
  loading: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  alerts: <NotificationsActiveIcon />,
  fun: <CelebrationIcon />,
  animals: <PetsIcon />,
  scifi: <RocketLaunchIcon />,
};

const categoryColors: Record<string, string> = {
  alerts: '#f59e0b',
  fun: '#ec4899',
  animals: '#10b981',
  scifi: '#8b5cf6',
};

export function SoundBoard({ sounds, onPlay, loading }: Props) {
  const categories = [...new Set(sounds.map(s => s.category))];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Sound Board
      </Typography>

      {categories.map((category) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Chip
            icon={categoryIcons[category] as React.ReactElement}
            label={category.charAt(0).toUpperCase() + category.slice(1)}
            size="small"
            sx={{
              mb: 1.5,
              bgcolor: `${categoryColors[category]}20`,
              color: categoryColors[category],
              fontWeight: 500,
            }}
          />

          <Grid container spacing={1}>
            {sounds
              .filter((s) => s.category === category)
              .map((sound) => (
                <Grid item xs={4} sm={3} md={2} key={sound.id}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => onPlay(sound.soundId)}
                    disabled={loading}
                    sx={{
                      borderColor: categoryColors[category],
                      color: categoryColors[category],
                      '&:hover': {
                        borderColor: categoryColors[category],
                        bgcolor: `${categoryColors[category]}10`,
                      },
                    }}
                  >
                    {sound.name}
                  </Button>
                </Grid>
              ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}

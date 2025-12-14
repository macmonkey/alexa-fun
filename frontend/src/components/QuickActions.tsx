import { Box, Button, Typography, Grid } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SchoolIcon from '@mui/icons-material/School';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import BedIcon from '@mui/icons-material/Bed';
import TvOffIcon from '@mui/icons-material/TvOff';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import TvIcon from '@mui/icons-material/Tv';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CountertopsIcon from '@mui/icons-material/Countertops';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import ShowerIcon from '@mui/icons-material/Shower';
import MoodIcon from '@mui/icons-material/Mood';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

interface Preset {
  id: string;
  label: string;
  text: string;
  icon: string;
  color: string;
}

interface Props {
  presets: Preset[];
  onAction: (text: string) => void;
  loading: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  person: <PersonIcon />,
  people: <PeopleIcon />,
  restaurant: <RestaurantIcon />,
  school: <SchoolIcon />,
  cleaning_services: <CleaningServicesIcon />,
  bed: <BedIcon />,
  tv_off: <TvOffIcon />,
  volume_off: <VolumeOffIcon />,
  do_not_disturb: <DoNotDisturbIcon />,
  tv: <TvIcon />,
  sports_esports: <SportsEsportsIcon />,
  dishwasher: <CountertopsIcon />,
  table_restaurant: <TableRestaurantIcon />,
  shower: <ShowerIcon />,
  mood: <MoodIcon />,
  star: <StarIcon />,
  favorite: <FavoriteIcon />,
  tongue_twister: <RecordVoiceOverIcon />,
};

export function QuickActions({ presets, onAction, loading }: Props) {
  // Gruppiere: Kinder-Buttons, Spezial-Namen, Zungenbrecher, Aktionen
  const kidButtons = presets.filter(p => ['finn', 'leo', 'beide'].includes(p.id));
  const specialNames = presets.filter(p => ['leo-lang', 'finn-lang', 'huyen'].includes(p.id));
  const tongueTwisters = presets.filter(p => p.id === 'zungenbrecher');
  const actionButtons = presets.filter(p =>
    !['finn', 'leo', 'beide', 'leo-lang', 'finn-lang', 'huyen', 'zungenbrecher'].includes(p.id)
  );

  const handleAction = async (preset: Preset) => {
    // Wenn RANDOM_MINION, hole random Text vom Backend
    if (preset.text === 'RANDOM_MINION') {
      try {
        const res = await fetch(`/api/presets/${preset.id}/random`);
        const data = await res.json();
        onAction(data.text);
      } catch (e) {
        console.error('Fehler beim Laden des Random-Texts:', e);
        onAction('Hallo!');
      }
    } else {
      onAction(preset.text);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Finn & Leo
      </Typography>

      {/* Große Kinder-Buttons */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {kidButtons.map((preset) => (
          <Grid item xs={4} key={preset.id}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              onClick={() => handleAction(preset)}
              startIcon={iconMap[preset.icon] || <PersonIcon />}
              sx={{
                bgcolor: preset.color,
                py: 3,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: preset.color,
                  filter: 'brightness(0.9)',
                },
              }}
            >
              {preset.label}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Spezial-Namen Buttons */}
      {specialNames.length > 0 && (
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {specialNames.map((preset) => (
            <Grid item xs={4} key={preset.id}>
              <Button
                fullWidth
                variant="contained"
                disabled={loading}
                onClick={() => handleAction(preset)}
                startIcon={iconMap[preset.icon]}
                sx={{
                  bgcolor: preset.color,
                  py: 1.5,
                  fontSize: '0.85rem',
                  '&:hover': {
                    bgcolor: preset.color,
                    filter: 'brightness(0.9)',
                  },
                }}
              >
                {preset.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Zungenbrecher Button */}
      {tongueTwisters.length > 0 && (
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {tongueTwisters.map((preset) => (
            <Grid item xs={12} key={preset.id}>
              <Button
                fullWidth
                variant="contained"
                disabled={loading}
                onClick={() => handleAction(preset)}
                startIcon={iconMap[preset.icon]}
                sx={{
                  bgcolor: preset.color,
                  py: 2,
                  fontSize: '1rem',
                  '&:hover': {
                    bgcolor: preset.color,
                    filter: 'brightness(0.9)',
                  },
                }}
              >
                {preset.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Schnellaktionen
      </Typography>

      {/* Aktions-Buttons */}
      <Grid container spacing={1.5}>
        {actionButtons.map((preset) => (
          <Grid item xs={6} sm={4} md={3} key={preset.id}>
            <Button
              fullWidth
              variant="outlined"
              disabled={loading}
              onClick={() => handleAction(preset)}
              startIcon={iconMap[preset.icon]}
              sx={{
                borderColor: preset.color,
                color: preset.color,
                py: 1.5,
                '&:hover': {
                  borderColor: preset.color,
                  bgcolor: `${preset.color}15`,
                },
              }}
            >
              {preset.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

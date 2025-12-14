import { useState, useEffect } from 'react';
import {
  Chip,
  Box,
  Slider,
  Typography,
  IconButton,
  Stack,
  Button,
} from '@mui/material';
import SpeakerIcon from '@mui/icons-material/Speaker';
import SpeakerGroupIcon from '@mui/icons-material/SpeakerGroup';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Device {
  serialNumber: string;
  accountName: string;
  online: boolean;
  dnd?: boolean;
}

interface Props {
  devices: Device[];
  selectedDevices: string[];
  onSelect: (serials: string[]) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export function DeviceSelector({ devices, selectedDevices, onSelect, volume, onVolumeChange }: Props) {
  const [localVolume, setLocalVolume] = useState(volume);

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  const handleVolumeCommit = () => {
    onVolumeChange(localVolume);
  };

  const handleDeviceToggle = (serial: string) => {
    if (selectedDevices.includes(serial)) {
      // Entfernen, aber mindestens ein Gerät muss ausgewählt sein
      if (selectedDevices.length > 1) {
        onSelect(selectedDevices.filter(s => s !== serial));
      }
    } else {
      // Hinzufügen
      onSelect([...selectedDevices, serial]);
    }
  };

  const handleSelectAll = () => {
    const onlineDevices = devices.filter(d => d.online).map(d => d.serialNumber);
    onSelect(onlineDevices);
  };

  const allSelected = devices.filter(d => d.online).every(d => selectedDevices.includes(d.serialNumber));

  return (
    <Stack spacing={2}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Echo-Geräte ({selectedDevices.length} ausgewählt)
          </Typography>
          <Button
            size="small"
            variant={allSelected ? 'contained' : 'outlined'}
            onClick={handleSelectAll}
            startIcon={<SpeakerGroupIcon />}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              py: 0.5,
              px: 2,
            }}
          >
            Alle
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
          }}
        >
          {devices.map((device) => {
            const isSelected = selectedDevices.includes(device.serialNumber);
            return (
              <Chip
                key={device.serialNumber}
                label={device.accountName.replace(' Echo', '').replace('Jens ', '')}
                onClick={() => device.online && handleDeviceToggle(device.serialNumber)}
                disabled={!device.online}
                icon={isSelected ? <CheckCircleIcon /> : <SpeakerIcon />}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  opacity: device.online ? 1 : 0.4,
                  '& .MuiChip-icon': {
                    color: isSelected ? 'inherit' : 'action.active',
                  },
                }}
              />
            );
          })}
        </Box>
        {devices.some(d => d.dnd) && (
          <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
            Einige Geräte haben "Nicht stören" aktiviert
          </Typography>
        )}
      </Box>

      {selectedDevices.length === 1 && (
        <Box sx={{ px: 1 }}>
          <Typography variant="caption" color={localVolume < 10 ? 'error' : 'text.secondary'} gutterBottom>
            Lautstärke {localVolume < 10 && '(zu leise!)'}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton size="small" onClick={() => { setLocalVolume(Math.max(0, localVolume - 10)); onVolumeChange(Math.max(0, localVolume - 10)); }}>
              <VolumeDownIcon />
            </IconButton>
            <Slider
              value={localVolume}
              onChange={(_, v) => setLocalVolume(v as number)}
              onChangeCommitted={handleVolumeCommit}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              sx={{ flex: 1 }}
            />
            <IconButton size="small" onClick={() => { setLocalVolume(Math.min(100, localVolume + 10)); onVolumeChange(Math.min(100, localVolume + 10)); }}>
              <VolumeUpIcon />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: 40 }}>
              {localVolume}%
            </Typography>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

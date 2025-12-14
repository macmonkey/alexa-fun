import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CampaignIcon from '@mui/icons-material/Campaign';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';

interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

interface Props {
  onAnnounce: (text: string) => void;
  loading: boolean;
}

const STORAGE_KEY = 'finn-homework-tasks';

const encouragements = [
  'Super gemacht, Finn! Weiter so!',
  'Finn, du bist ein Held! Nur noch ein bisschen!',
  'Toll, Finn! Du schaffst das!',
  'Großartig, Finn! Fast geschafft!',
  'Finn, du machst das richtig gut!',
];

const reminders = [
  'Finn, Zeit für Hausaufgaben! Los gehts!',
  'Hey Finn! Die Hausaufgaben warten auf dich!',
  'Finn, Hausaufgaben-Zeit! Du schaffst das!',
  'Finn, ab an die Hausaufgaben! Je schneller fertig, desto mehr Spielzeit!',
];

export function HomeworkTab({ onAnnounce, loading }: Props) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      done: false,
      createdAt: Date.now(),
    };

    setTasks([...tasks, task]);
    setNewTask('');
    setDialogOpen(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const clearDone = () => {
    setTasks(tasks.filter(t => !t.done));
  };

  const announceReminder = () => {
    const reminder = reminders[Math.floor(Math.random() * reminders.length)];
    const pendingTasks = tasks.filter(t => !t.done);

    let message = reminder;
    if (pendingTasks.length > 0) {
      message += ` Du hast noch ${pendingTasks.length} Aufgaben: ${pendingTasks.map(t => t.text).join(', ')}.`;
    }

    onAnnounce(message);
  };

  const announceEncouragement = () => {
    const doneCount = tasks.filter(t => t.done).length;
    const totalCount = tasks.length;
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

    let message = encouragement;
    if (totalCount > 0) {
      message += ` Du hast schon ${doneCount} von ${totalCount} Aufgaben erledigt!`;
    }

    onAnnounce(message);
  };

  const announceAllDone = () => {
    onAnnounce('Fantastisch, Finn! Du hast alle Hausaufgaben geschafft! Zeit zum Spielen!');
  };

  const pendingTasks = tasks.filter(t => !t.done);
  const doneTasks = tasks.filter(t => t.done);
  const allDone = tasks.length > 0 && pendingTasks.length === 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <SchoolIcon color="primary" />
        <Typography variant="h6">Finns Hausaufgaben</Typography>
        {allDone && (
          <Chip
            icon={<EmojiEventsIcon />}
            label="Alles erledigt!"
            color="success"
            size="small"
          />
        )}
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={1} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Button
            fullWidth
            variant="contained"
            color="warning"
            startIcon={<CampaignIcon />}
            onClick={announceReminder}
            disabled={loading}
          >
            Erinnern
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<EmojiEventsIcon />}
            onClick={announceEncouragement}
            disabled={loading}
          >
            Loben
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={announceAllDone}
            disabled={loading || !allDone}
          >
            Fertig!
          </Button>
        </Grid>
      </Grid>

      {/* Task List */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        {tasks.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>Keine Aufgaben. Füge welche hinzu!</Typography>
          </Box>
        ) : (
          <List dense>
            {pendingTasks.map((task) => (
              <ListItem key={task.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Checkbox
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                  color="primary"
                />
                <ListItemText
                  primary={task.text}
                  primaryTypographyProps={{
                    sx: { textDecoration: task.done ? 'line-through' : 'none' },
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => deleteTask(task.id)} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {doneTasks.length > 0 && (
              <>
                <ListItem sx={{ bgcolor: 'success.light', py: 0.5 }}>
                  <ListItemText
                    primary={`Erledigt (${doneTasks.length})`}
                    primaryTypographyProps={{ variant: 'caption', fontWeight: 'bold' }}
                  />
                  <Button size="small" onClick={clearDone}>
                    Löschen
                  </Button>
                </ListItem>
                {doneTasks.map((task) => (
                  <ListItem key={task.id} sx={{ opacity: 0.6 }}>
                    <Checkbox checked={task.done} onChange={() => toggleTask(task.id)} color="success" />
                    <ListItemText
                      primary={task.text}
                      primaryTypographyProps={{ sx: { textDecoration: 'line-through' } }}
                    />
                  </ListItem>
                ))}
              </>
            )}
          </List>
        )}
      </Paper>

      {/* Add Task Button */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setDialogOpen(true)}
      >
        Aufgabe hinzufügen
      </Button>

      {/* Add Task Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neue Aufgabe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Aufgabe"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="z.B. Mathe Seite 42"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={addTask} variant="contained" disabled={!newTask.trim()}>
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

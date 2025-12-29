import { useEffect, useState, useContext } from 'react';
import { Grid, Container, Button, Typography, Box, TextField } from '@mui/material'; 
import API from '../api/axios';
import EventCard from '../components/EventCard';
import CreateEventModal from '../components/CreateEventModal';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [openModal, setOpenModal] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchEvents = async () => {
    try {
      const { data } = await API.get('/events');
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  
  const filteredEvents = events.filter((event) => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4">Upcoming Events</Typography>
        {user && (
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            + Create Event
          </Button>
        )}
      </Box>

      
      <TextField
        label="Search events by title or location..."
        variant="outlined"
        fullWidth
        sx={{ mb: 4 }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

    
      <Grid container spacing={3}>
        {filteredEvents.map((event) => (
          <Grid key={event._id} size={{ xs: 12, sm: 6, md: 4 }}>
            <EventCard event={event} refreshEvents={fetchEvents} />
          </Grid>
        ))}
        
        
        {filteredEvents.length === 0 && (
          <Typography variant="h6" sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
            No events found matching "{searchTerm}"
          </Typography>
        )}
      </Grid>

      <CreateEventModal 
        open={openModal} 
        handleClose={() => setOpenModal(false)} 
        refreshEvents={fetchEvents} 
      />
    </Container>
  );
};

export default Dashboard;
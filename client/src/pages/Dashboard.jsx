import { useEffect, useState, useContext } from 'react';
import { Grid, Container, Button, Typography, Box } from '@mui/material';
import API from '../api/axios';
import EventCard from '../components/EventCard';
import CreateEventModal from '../components/CreateEventModal';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
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

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 4 }}>
                <Typography variant="h4">Upcoming Events</Typography>
                {user && (
                    <Button variant="contained" onClick={() => setOpenModal(true)}>
                        + Create Event
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                {events.map((event) => (

                    <Grid key={event._id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <EventCard event={event} refreshEvents={fetchEvents} />
                    </Grid>
                ))}
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
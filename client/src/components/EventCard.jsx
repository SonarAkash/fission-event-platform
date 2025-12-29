import { useState, useContext } from 'react';
import {
    Card, CardMedia, CardContent, Typography, Button, Box, Chip,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import API from '../api/axios';

const EventCard = ({ event, refreshEvents }) => {
    const { user } = useContext(AuthContext);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [rsvpLoading, setRsvpLoading] = useState(false);

    const hasJoined = event.attendees.includes(user?._id);
    const isFull = event.attendees.length >= event.capacity;
    const isOwner = event.organizer._id === user?._id;

    const handleRSVP = async () => {
        if (rsvpLoading) return; // Prevent double clicks
        setRsvpLoading(true);
        try {
            await API.post(`/events/${event._id}/rsvp`);
            refreshEvents();
            toast.success('🎉 You have successfully joined!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'RSVP Failed');
        } finally {
            setRsvpLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await API.delete(`/events/${event._id}`);
            refreshEvents();
            toast.info('Event deleted successfully');
        } catch (error) {
            toast.error('Delete failed');
            setIsDeleting(false);
            setOpenDeleteDialog(false);
        }
    };

    return (
        <>
            <Card sx={{ maxWidth: 345, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardMedia
                    component="img"
                    height="140"
                    image={event.imageUrl}
                    alt={event.title}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                   

                    <Typography gutterBottom variant="h5" component="div">
                        {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {event.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip label={`${event.attendees.length} / ${event.capacity} Filled`}
                            color={isFull ? "error" : "success"} variant="outlined" />
                        <Typography variant="caption" display="block">
                            {new Date(event.date).toLocaleDateString()}
                        </Typography>
                    </Box>

                    <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                        Location: {event.location}
                    </Typography>

                    
                    {user && (
                        <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}> 
                            {!isOwner && (
                                <Button
                                    variant="contained"
                                    fullWidth
                                    disabled={isFull || hasJoined || rsvpLoading}
                                    onClick={handleRSVP}
                                >
                                    {rsvpLoading ? "Joining..." : hasJoined ? "Joined" : isFull ? "Full" : "Join Event"}
                                </Button>
                            )}

                            {isOwner && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    fullWidth
                                    onClick={handleDeleteClick}
                                >
                                    Delete
                                </Button>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>


            <Dialog
                open={openDeleteDialog}
                onClose={() => !isDeleting && setOpenDeleteDialog(false)}
            >
                <DialogTitle>Delete Event?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>"{event.title}"</strong>?
                        This action cannot be undone and will remove the event for all attendees.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        disabled={isDeleting}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        disabled={isDeleting}
                        color="error"
                        variant="contained"
                        autoFocus
                    >
                        {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EventCard;
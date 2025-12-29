import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, Box, Typography } from '@mui/material';
import { toast } from 'react-toastify'; 
import API from '../api/axios';

const CreateEventModal = ({ open, handleClose, refreshEvents }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', capacity: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (formData.capacity <= 0) {
      toast.warn("Capacity must be at least 1");
      return;
    }

    
    if (!file) {
      toast.error("Please upload an image for the event!");
      return;
    }

    setLoading(true); 

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('date', formData.date);
    data.append('location', formData.location);
    data.append('capacity', formData.capacity);
    data.append('image', file);

    try {
      await API.post('/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      refreshEvents();
      toast.success('Event created successfully!');
      handleClose();
      
      setFormData({ title: '', description: '', date: '', location: '', capacity: '' });
      setFile(null);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error creating event');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <Dialog open={open} onClose={!loading ? handleClose : null}> 
      <DialogTitle>Create New Event</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField name="title" label="Title" fullWidth margin="dense" required onChange={handleChange} value={formData.title} />
          <TextField name="description" label="Description" fullWidth margin="dense" multiline rows={3} required onChange={handleChange} value={formData.description} />
          
          
          <TextField 
            name="date" 
            type="date" 
            fullWidth 
            margin="dense" 
            required 
            onChange={handleChange} 
            value={formData.date}
            inputProps={{ min: getTodayDate() }} 
          />
          
          <TextField name="location" label="Location" fullWidth margin="dense" required onChange={handleChange} value={formData.location} />
          
          <TextField 
            name="capacity" 
            label="Capacity" 
            type="number" 
            fullWidth 
            margin="dense" 
            required 
            onChange={handleChange}
            value={formData.capacity}
            inputProps={{ min: 1 }} 
          />
          
          
          <Button 
            variant="contained" 
            component="label" 
            fullWidth 
            sx={{ mt: 2 }} 
            disabled={loading} 
          >
            {file ? "Change Image" : "Upload Image"}
            <input 
              type="file" 
              hidden 
              onChange={handleFileChange} 
              accept="image/*" 
              disabled={loading} 
            />
          </Button>
          
          {file && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Selected: {file.name}
            </Typography>
          )}

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            sx={{ mt: 3 }} 
            disabled={loading} 
          >
            {loading ? 'Creating Event...' : 'Create Event'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
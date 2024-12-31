import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, MenuItem, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const DeleteDish = ({ dishes, setDishes, setErrorMessage, setSuccessMessage }) => {
  const [selectedDishToDelete, setSelectedDishToDelete] = useState('');
  const [expanded, setExpanded] = useState(false); // Для управления раскрытием аккордеона

  const handleDeleteDish = () => {
    if (!selectedDishToDelete) {
      setErrorMessage('Пожалуйста, выберите блюдо');
      return;
    }

    axios.delete(`http://localhost:3001/api/deleteDish/${selectedDishToDelete}`)
      .then(() => {
        const updatedDishes = dishes.filter(dish => dish.id !== parseInt(selectedDishToDelete));
        setDishes(updatedDishes);
        setSelectedDishToDelete('');
        window.location.reload();
        setErrorMessage('');
        setSuccessMessage('Блюдо удалено');
      })
      .catch(() => {
        setErrorMessage('Ошибка при удалении');
      });
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mb: 2 }}>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography variant="h6">Удалить блюдо</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            select
            label="Выберите блюдо"
            value={selectedDishToDelete}
            onChange={(e) => setSelectedDishToDelete(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Выберите блюдо</MenuItem>
            {dishes.map((dish) => (
              <MenuItem key={dish.id} value={dish.id}>
                {dish.name} ({dish.dish_type})
              </MenuItem>
            ))}
          </TextField>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleDeleteDish}
            disabled={!selectedDishToDelete}
          >
            Удалить
          </Button>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default DeleteDish;

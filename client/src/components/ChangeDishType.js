import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, MenuItem, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ChangeDishType = ({ dishes, setDishes, setErrorMessage, setSuccessMessage }) => {
  const [selectedDishToChange, setSelectedDishToChange] = useState('');
  const [newDishType, setNewDishType] = useState('');
  const [expanded, setExpanded] = useState(false); // Для управления раскрытием аккордеона

  const dishTypes = [
    { value: 'salad', label: 'Салат' },
    { value: 'first', label: 'Первое' },
    { value: 'second', label: 'Второе' },
    { value: 'drink', label: 'Напиток' },
    { value: 'dessert', label: 'Десерт' },
  ];

  const handleChangeDishType = () => {
    if (!selectedDishToChange || !newDishType) {
      setErrorMessage('Пожалуйста, выберите блюдо и новый тип');
      return;
    }

    axios.put(`http://localhost:3001/api/dishes/${selectedDishToChange}`, { dish_type: newDishType })
      .then(() => {
        const updatedDishes = dishes.map((dish) =>
          dish.id === parseInt(selectedDishToChange) ? { ...dish, dish_type: newDishType } : dish
        );
        setDishes(updatedDishes);
        setSelectedDishToChange('');
        setNewDishType('');
        window.location.reload()
        setErrorMessage('');
        setSuccessMessage('Тип блюда успешно изменен');
      })
      .catch(() => {
        setErrorMessage('Ошибка при обновлении типа блюда');
      });
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mb: 2 }}>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography variant="h6">Изменить тип блюда</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            select
            label="Выберите блюдо"
            value={selectedDishToChange}
            onChange={(e) => setSelectedDishToChange(e.target.value)}
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
          <TextField
            select
            label="Новый тип блюда"
            value={newDishType}
            onChange={(e) => setNewDishType(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {dishTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleChangeDishType}
            disabled={!selectedDishToChange || !newDishType}
          >
            Обновить тип
          </Button>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ChangeDishType;

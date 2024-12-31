import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, MenuItem, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AddDish = ({ dishes, setDishes, setErrorMessage, setSuccessMessage }) => {
  const [dishName, setDishName] = useState('');
  const [dishType, setDishType] = useState('');
  const [expanded, setExpanded] = useState(false); // Для управления раскрытием аккордеона

  const dishTypes = [
    { value: 'salad', label: 'Салат' },
    { value: 'first', label: 'Первое' },
    { value: 'second', label: 'Второе' },
    { value: 'drink', label: 'Напиток' },
    { value: 'dessert', label: 'Десерт' },
  ];

  const handleAddDish = () => {
    if (!dishName || !dishType) {
      setErrorMessage('Пожалуйста, укажите название и тип блюда');
      return;
    }

    const existingDish = dishes.find(dish => dish.name === dishName);
    if (existingDish) {
      setErrorMessage('Блюдо с таким названием уже существует');
      return;
    }

    axios.post('http://localhost:3001/api/dishes', { name: dishName, dish_type: dishType })
      .then((response) => {
        setDishes([...dishes, response.data]);
        setSuccessMessage('Блюдо успешно добавлено');
        setDishName('');
        setDishType('');
        setErrorMessage('');
      })
      .catch(() => setErrorMessage('Ошибка при добавлении блюда'));
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mb: 2 }}>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h6">Добавить блюдо</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            label="Название блюда"
            variant="outlined"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          
          <TextField
            select
            label="Тип блюда"
            value={dishType}
            onChange={(e) => setDishType(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}  // Добавим отступ перед кнопкой
          >
            {dishTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}> 
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddDish} 
              disabled={!dishName || !dishType}
              sx={{ width: 'auto' }}  // Ширина кнопки будет автоматически подстраиваться
            >
              Добавить блюдо
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AddDish;

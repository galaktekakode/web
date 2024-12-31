import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, MenuItem, Typography, Box } from '@mui/material';

const AddMenuVariant = ({ setErrorMessage }) => {
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [variantNumber, setVariantNumber] = useState('');

  const daysOfWeek = [
    { value: 'Понедельник', label: 'Понедельник' },
    { value: 'Вторник', label: 'Вторник' },
    { value: 'Среда', label: 'Среда' },
    { value: 'Четверг', label: 'Четверг' },
    { value: 'Пятница', label: 'Пятница' },
    { value: 'Суббота', label: 'Суббота' },
    { value: 'Воскресенье', label: 'Воскресенье' },
  ];

  const handleAddMenuVariant = () => {
    if (!dayOfWeek || !variantNumber) {
      setErrorMessage('Пожалуйста, укажите день недели и номер варианта');
      setDayOfWeek('');
      setVariantNumber('');
      return;
    }

    // Проверка, чтобы variantNumber содержал только цифры
    if (!/^\d+$/.test(variantNumber)) {
      setErrorMessage('Номер варианта должен содержать только положительные цифры');
      setDayOfWeek('');
      setVariantNumber('');
      return;
    }

    axios
      .post('http://localhost:3001/api/menuVariants', {
        day_of_week: dayOfWeek,
        variant_number: variantNumber,
      })
      .then(() => {
        setDayOfWeek('');
        setVariantNumber('');
        setErrorMessage('');
        window.location.reload();
      })
      .catch(() => setErrorMessage('Ошибка при добавлении варианта меню'));
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Добавить вариант меню
      </Typography>
      <TextField
        select
        label="Выберите день недели"
        value={dayOfWeek}
        onChange={(e) => setDayOfWeek(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      >
        {daysOfWeek.map((day) => (
          <MenuItem key={day.value} value={day.value}>
            {day.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Номер варианта"
        type="number"
        variant="outlined"
        fullWidth
        value={variantNumber}
        onChange={(e) => setVariantNumber(e.target.value)}
        inputProps={{ min: 0 }}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleAddMenuVariant}>
        Добавить вариант меню
      </Button>
    </Box>
  );
};

export default AddMenuVariant;

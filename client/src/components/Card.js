// src/components/Card.js

import React, { useState } from 'react';
import axios from 'axios';
import './Card.css'; // Импорт стилей
import {
    Card as MuiCard,
    CardActions,
    Typography,
    Button,
    Select,
    MenuItem,
    Box,
    TextField,
    IconButton,
  } from '@mui/material';
  import { Delete, ArrowForward } from '@mui/icons-material';
  
const Card = ({ data, setErrorMessage, setSuccessMessage, menuVariants, setMenuVariants, AllDishes }) => {
  const { day_of_week, dishes, menu_variant_id, variant_number } = data;
  const [selectedDishes, setSelectedDishes] = useState({ Tag: "" });
  const [selectedMenuVariantId, setSelectedMenuVariantId] = useState('');
  const [selectedMenuVariantIds, setSelectedMenuVariantIds] = useState({});

  const handleDeleteDishFromMenu = (id) => {
    axios.delete(`http://localhost:3001/api/menuVariantDishes/${menu_variant_id}/${id}`)
      .then(() => {
        setSuccessMessage('Блюдо успешно удалено из меню');
        window.location.reload();
      })
      .catch(() => setErrorMessage('Ошибка при удалении блюда из меню'));
  };

  const handleDeleteMenuVariant = () => {
    axios.delete(`http://localhost:3001/api/menuVariants/${menu_variant_id}`)
      .then(() => {
        setMenuVariants(menuVariants.filter((variant) => variant.menu_variant_id !== parseInt(menu_variant_id)));
        setErrorMessage('');
        setSuccessMessage('Вариант меню успешно удален');
      })
      .catch(() => setErrorMessage('Ошибка при удалении варианта меню'));
  };

  const handleMoveDishToAnotherMenu = (dishId, selectedMenuVariantId) => {
    axios.post(`http://localhost:3001/api/moveDish/${dishId}`, {
        selectedMenuVariantId: parseInt(selectedMenuVariantId),
        prevVariantId: menu_variant_id
    })
      .then(() => {
        // Обновляем состояние после успешного добавления
        setMenuVariants(menuVariants.filter((variant) => variant.menu_variant_id !== parseInt(menu_variant_id)));
        setErrorMessage('');
        setSuccessMessage('Блюдо перемещено');
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage('Ошибка при перемещении блюда в меню, возможно, это конфликт типов блюда');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const selectedDish = AllDishes.find(dish => dish.id === parseInt(value));
    if (!selectedDish) {
      setErrorMessage('Ошибка: блюдо не найдено.');
      return;
    }

    const selectedDishType = selectedDish.dish_type;
    const existingDish = dishes.find(dish => dish.dish_type === selectedDishType);
    if (existingDish) {
      setErrorMessage(`Ошибка: блюдо типа "${selectedDishType}" уже существует в меню.`);
      setSelectedDishes(prevData => ({
        ...prevData,
        [name]: "" // Сбросить выбор
      }));
      return;
    }

    setErrorMessage('');
    setSelectedDishes((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMove = (dishId, newMenuVariantId) => {
    // Находим выбранное блюдо по ID
    const selectedDish = AllDishes.find((dish) => dish.id === parseInt(dishId));
    console.log(selectedDish)
    if (!selectedDish) {
      setErrorMessage('Ошибка: блюдо не найдено.');
      return;
    }
  
    const selectedDishType = selectedDish.dish_type;
  
    // Проверяем, если в выбранном варианте меню уже существует блюдо с таким типом
    const targetMenu = menuVariants.find(
      (variant) => variant.menu_variant_id === parseInt(newMenuVariantId)
    );
    console.log(targetMenu)
    if (!targetMenu) {
      setErrorMessage('Ошибка: выбранный вариант меню не существует.');
      return;
    }
  
    const existingDish = targetMenu.dishes.find(
      (dish) => dish.dish_type === selectedDishType
    );
  
    if (existingDish) {
      setErrorMessage(`Ошибка: блюдо типа "${selectedDishType}" уже существует в выбранном меню.`);
      return;
    }

    // Если все проверки прошли успешно
    setSelectedMenuVariantId(newMenuVariantId);
    setErrorMessage('');
    setSelectedMenuVariantIds((prevState) => ({
      ...prevState,
      [dishId]: newMenuVariantId, // Обновляем только для текущего блюда
    }));
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/api/addmenuVariantDishes/${menu_variant_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedDishes),
      });

      if (response.ok) {
        setSuccessMessage('Блюдо успешно добавлено в вариант меню');
        setErrorMessage('');
        window.location.reload();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Ошибка при добавлении блюда в меню');
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('Ошибка при добавлении блюда в меню');
      setSuccessMessage('');
    }
  };

  return (
    <MuiCard sx={{ mb: 2, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {day_of_week} - Вариант {variant_number}
      </Typography>
      
      <div className="dishes-list">
        {dishes.length > 0 && dishes
          .filter((element) => element.dish_id !== null)
          .map((element, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
              }}
              className="dish-card"
            >
              <div className="dish-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" className="dish-name">
                  {element.dish_name}
                </Typography>
                <div className="dish-actions">
                  <IconButton
                    onClick={() => handleDeleteDishFromMenu(element.dish_id)}
                    color="error"
                    className="icon-button move-button"
                    title="Удалить"
                  >
                    <Delete />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      handleMoveDishToAnotherMenu(element.dish_id, selectedMenuVariantId)
                    }
                    color="primary"
                    className="icon-button move-button"
                    title="Переместить"
                  >
                    <ArrowForward />
                  </IconButton>
                </div>
              </div>
  
              <div className="dish-footer" style={{ marginTop: '16px' }}>
                <Select
                  value={selectedMenuVariantIds[element.dish_id] || ''}
                  onChange={(e) => handleMove(element.dish_id, e.target.value)}
                  size="small"
                  fullWidth
                  sx={{
                    minWidth: '200px',
                  }}
                  className="menu-select"
                >
                  <MenuItem value="">Выберите вариант меню</MenuItem>
                  {menuVariants
                    .filter((variant) => variant.menu_variant_id !== menu_variant_id)
                    .map((variant) => (
                      <MenuItem key={variant.menu_variant_id} value={variant.menu_variant_id}>
                        {variant.day_of_week} - Вариант {variant.variant_number}
                      </MenuItem>
                    ))}
                </Select>
              </div>
            </Box>
          ))}
      </div>
  
      {dishes.length !== 5 && (
        <form onSubmit={handleSubmit} className="add-dish-form" style={{ marginTop: '16px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2, maxWidth: 300, margin: '0 auto' }}>
            <TextField
              select
              label="Добавить блюдо"
              name="Tag"
              value={selectedDishes.Tag}
              onChange={handleChange}
              fullWidth
              sx={{
                maxWidth: '100%',
              }}
            >
              <MenuItem value="">Выберите блюдо</MenuItem>
              {AllDishes.map((dish) => (
                <MenuItem key={dish.id} value={dish.id}>
                  {dish.name} ({dish.dish_type})
                </MenuItem>
              ))}
            </TextField>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ marginTop: '8px' }}
              className="add-button"
            >
              Добавить в меню
            </Button>
          </Box>
        </form>
      )}
  
      <CardActions>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button
            onClick={() => handleDeleteMenuVariant(menu_variant_id)}
            variant="contained"
            color="error"
            sx={{ mt: 2 }}
            className="delete-menu-button"
          >
            Удалить меню
          </Button>
        </Box>
      </CardActions>
    </MuiCard>
  );  
};

export default Card;
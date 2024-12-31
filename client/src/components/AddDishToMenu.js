// src/components/AddDishToMenu.js

import React, { useState } from 'react';

const AddDishToMenu = ({ menuVariants, dishes, setErrorMessage }) => {
  const [selectedMenuVariantId, setSelectedMenuVariantId] = useState('');
  const [selectedDishId, setSelectedDishId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Обработчик отправки формы
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedMenuVariantId || !selectedDishId) {
      setError('Пожалуйста, выберите вариант меню и блюдо');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/menuVariantDishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menu_variant_id: selectedMenuVariantId,
          dish_id: selectedDishId,
        }),
      });

      if (response.ok) {
        setMessage('Блюдо успешно добавлено в вариант меню');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка при добавлении блюда в меню');
        setMessage('');
      }
    } catch (error) {
      setError('Ошибка при добавлении блюда в меню');
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Добавить блюдо в вариант меню</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Выберите вариант меню:</label>
          <select
            value={selectedMenuVariantId}
            onChange={(e) => setSelectedMenuVariantId(e.target.value)}
          >
            <option value="">-- Выберите вариант меню --</option>
            {menuVariants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.day_of_week} - Вариант {variant.variant_number}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Выберите блюдо:</label>
          <select
            value={selectedDishId}
            onChange={(e) => setSelectedDishId(e.target.value)}
          >
            <option value="">-- Выберите блюдо --</option>
            {dishes.map((dish) => (
              <option key={dish.id} value={dish.id}>
                {dish.name} ({dish.dish_type})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Добавить в меню</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}
      </form>
    </div>
  );
};

export default AddDishToMenu;
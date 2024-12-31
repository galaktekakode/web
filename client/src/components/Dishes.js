import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Dishes = ({ menuVariants, setErrorMessage, setSuccessMessage }) => {
  const [selectedMenuVariant, setSelectedMenuVariant] = useState('');
  const [selectedDishToDelete, setSelectedDishToDelete] = useState('');
  const [dishesInVariant, setDishesInVariant] = useState([]); // Список блюд в выбранном варианте меню

  // Функция для получения блюд для выбранного варианта меню
  const fetchDishesForVariant = useCallback((menuVariantId) => {
    axios.get(`http://localhost:3001/api/menuVariants/${menuVariantId}/dishes`)
      .then((response) => {
        setDishesInVariant(response.data); // Обновляем список блюд в выбранном варианте меню
      })
      .catch(() => setErrorMessage('Ошибка при загрузке блюд для варианта меню'));
  }, [setErrorMessage]); // Функция зависит от setErrorMessage

  // Обработчик удаления блюда из выбранного варианта меню
  const handleDeleteDishFromMenu = () => {
    if (!selectedDishToDelete || !selectedMenuVariant) {
      setErrorMessage('Пожалуйста, выберите блюдо и вариант меню для удаления');
      return;
    }

    // Отправка запроса на удаление блюда из меню
    axios.delete(`http://localhost:3001/api/menuVariantDishes/${selectedMenuVariant}/${selectedDishToDelete}`)
      .then(() => {
        // Обновляем список блюд в контексте выбранного варианта меню
        fetchDishesForVariant(selectedMenuVariant);
        setErrorMessage('');
        setSuccessMessage('Блюдо успешно удалено из меню');
      })
      .catch(() => setErrorMessage('Ошибка при удалении блюда из меню'));
  };

  // Когда меняется выбранный вариант меню, загружаем блюда для этого варианта
  useEffect(() => {
    if (selectedMenuVariant) {
      fetchDishesForVariant(selectedMenuVariant);
    }
  }, [selectedMenuVariant, fetchDishesForVariant]); // Добавляем fetchDishesForVariant в зависимости

  return (
    <div>
      <h2>Удалить блюдо из варианта меню</h2>

      {/* Выбор варианта меню */}
      <select
        value={selectedMenuVariant}
        onChange={(e) => setSelectedMenuVariant(e.target.value)}
      >
        <option value="">Выберите вариант меню</option>
        {menuVariants.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {variant.day_of_week} - Вариант {variant.variant_number}
          </option>
        ))}
      </select>

      {/* Выбор блюда для удаления */}
      <select
        value={selectedDishToDelete}
        onChange={(e) => setSelectedDishToDelete(e.target.value)}
      >
        <option value="">Выберите блюдо для удаления</option>
        {dishesInVariant.map((dish) => (
          <option key={dish.id} value={dish.id}>
            {dish.name} ({dish.dish_type})
          </option>
        ))}
      </select>

      <button onClick={handleDeleteDishFromMenu}>Удалить</button>
    </div>
  );
};

export default Dishes;

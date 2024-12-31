// src/components/Card.js

import React, { useState } from 'react';
import axios from 'axios';
import './Card.css'; // Импорт стилей

const Card = ({ data, setErrorMessage, setSuccessMessage, menuVariants, setMenuVariants, AllDishes }) => {
  const { day_of_week, dishes, menu_variant_id, variant_number } = data;
  const [selectedDishes, setSelectedDishes] = useState({ Tag: "" });
  const [selectedMenuVariantId, setSelectedMenuVariantId] = useState('');

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

  const handleMove = (e) => {
    const { name, value, dataset } = e.target;
    const selectedDish = AllDishes.find(dish => dish.id === parseInt(dataset.dishId));

    if (!selectedDish) {
      setErrorMessage('Ошибка: блюдо не найдено.');
      return;
    }
    
    const selectedDishType = selectedDish.dish_type;

    const existingDish = menuVariants.find(menu => menu.menu_variant_id === parseInt(value)).dishes.find(dish => dish.dish_type === selectedDishType);
    if (existingDish) {
      setErrorMessage(`Ошибка: блюдо типа "${selectedDishType}" уже существует в меню.`);
      return;
    }

    setErrorMessage('');
    setSelectedMenuVariantId(value)
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
    <div className="card">
      <h2>{day_of_week} - {variant_number}</h2>
      
      <div className="dishes-list">
        {dishes.length > 0 && dishes
            .filter((element) => element.dish_id !== null)
            .map((element, index) => (
            <div key={index} className="dish-card">
                <div className="dish-header">
                <h3 className="dish-name">{element.dish_name}</h3>
                <div className="dish-actions">
                    <button
                    onClick={() => handleDeleteDishFromMenu(element.dish_id)}
                    className="icon-button move-button"
                    title="Удалить"
                    >
                    🗑️
                    </button>
                    <button
                    onClick={() =>
                        handleMoveDishToAnotherMenu(element.dish_id, selectedMenuVariantId)
                    }
                    className="icon-button move-button"
                    title="Переместить"
                    >
                    ➡️
                    </button>
                </div>
                </div>
                <div className="dish-footer">
                <select
                    value={selectedMenuVariantId}
                    onChange={(e) => handleMove(e)}
                    data-dish-id={element.dish_id}
                    className="menu-select"
                >
                    <option value="">Выберите вариант меню</option>
                    {menuVariants
                    .filter(
                        (variant) =>
                        variant.menu_variant_id !== menu_variant_id
                    )
                    .map((variant, index) => (
                        <option key={index} value={variant.menu_variant_id}>
                        {variant.day_of_week} - Вариант {variant.variant_number}
                        </option>
                    ))}
                </select>
                </div>
            </div>
            ))}
        </div>


      {dishes.length !== 5 && (
        <form onSubmit={handleSubmit} className="add-dish-form">
          <select
            required
            name="Tag"
            value={selectedDishes.Tag}
            onChange={handleChange}
          >
            <option value="">Выберите блюдо</option>
            {AllDishes.map((dish) => (
              <option key={dish.id} value={dish.id}>
                {dish.name} ({dish.dish_type})
              </option>
            ))}
          </select>
          <button type="submit" className="add-button">Добавить в меню</button>
        </form>
      )}

      <button onClick={() => handleDeleteMenuVariant(menu_variant_id)} className="delete-menu-button">Удалить меню</button>
    </div>
  );
};

export default Card;
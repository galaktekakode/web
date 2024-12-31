import React, { useState } from 'react';
import axios from 'axios';

const MenuVariants = ({ menuVariants, setErrorMessage }) => {
  const [selectedMenuVariant, setSelectedMenuVariant] = useState(null);
  const [menuDishes, setMenuDishes] = useState([]);

  const handleViewDishesForMenu = (menuVariantId) => {
    axios.get(`http://localhost:3001/api/menuVariants/${menuVariantId}/dishes`)
      .then((response) => setMenuDishes(response.data))
      .catch(() => setErrorMessage('Ошибка при загрузке блюд для выбранного варианта меню'));
  };

  return (
    <div>
      <h2>Варианты меню</h2>
      <select
        value={selectedMenuVariant?.id || ''}
        onChange={(e) =>
          setSelectedMenuVariant(menuVariants.find(v => v.id === Number(e.target.value)))
        }
      >
        <option value="">Выберите вариант меню</option>
        {menuVariants.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {variant.day_of_week} - {variant.variant_number}
          </option>
        ))}
      </select>
      <button onClick={() => handleViewDishesForMenu(selectedMenuVariant?.id)}>
        Показать состав меню
      </button>
      {menuDishes.length > 0 && (
        <ul>
          {menuDishes.map((dish) => (
            <li key={dish.id}>
              {dish.name} ({dish.dish_type})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MenuVariants;

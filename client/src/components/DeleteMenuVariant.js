import React, { useState } from 'react';
import axios from 'axios';

const DeleteMenuVariant = ({ menuVariants, setMenuVariants, setErrorMessage, setSuccessMessage }) => {
  const [selectedMenuVariant, setSelectedMenuVariant] = useState('');

  const handleDeleteMenuVariant = () => {
    if (!selectedMenuVariant) {
      setErrorMessage('Пожалуйста, выберите вариант меню для удаления');
      return;
    }

    axios.delete(`http://localhost:3001/api/menuVariants/${selectedMenuVariant}`)
      .then(() => {
        setMenuVariants(menuVariants.filter((variant) => variant.id !== parseInt(selectedMenuVariant)));
        setSelectedMenuVariant('');
        setErrorMessage('');
        setSuccessMessage('Вариант меню успешно удален');
      })
      .catch(() => setErrorMessage('Ошибка при удалении варианта меню'));
  };

  return (
    <div>
      <h2>Удалить вариант меню</h2>

      {/* Выбор варианта меню для удаления */}
      <select
        value={selectedMenuVariant}
        onChange={(e) => setSelectedMenuVariant(e.target.value)}
      >
        <option value="">Выберите вариант меню для удаления</option>
        {menuVariants.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {variant.day_of_week} - Вариант {variant.variant_number}
          </option>
        ))}
      </select>

      <button onClick={handleDeleteMenuVariant}>Удалить вариант меню</button>
    </div>
  );
};

export default DeleteMenuVariant;
